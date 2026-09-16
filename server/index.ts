import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { createBackup, readState, writeState } from './data.js';

const app = express();
// Tenten's Node launcher uses port 8666 when it does not inject PORT.
// Keep PORT configurable for other hosts while matching that fallback here.
const port = Number(process.env.PORT || 8666);
const isProduction = process.env.NODE_ENV === 'production';
const accessCode = process.env.ACCESS_CODE || (isProduction ? '' : '2410');
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const attempts = new Map<string, { count: number; resetAt: number }>();

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

function signature(value: string) {
  return crypto.createHmac('sha256', sessionSecret).update(value).digest('hex');
}

function createSession() {
  const expiresAt = Date.now() + 180 * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ expiresAt })).toString('base64url');
  return `${payload}.${signature(payload)}`;
}

function hasValidSession(raw?: string) {
  if (!raw) return false;
  const [payload, suppliedSignature] = raw.split('.');
  if (!payload || !suppliedSignature) return false;
  const expected = signature(payload);
  if (suppliedSignature.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(suppliedSignature), Buffer.from(expected))) return false;
  try {
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { expiresAt: number };
    return value.expiresAt > Date.now();
  } catch {
    return false;
  }
}

function requireSession(request: express.Request, response: express.Response, next: express.NextFunction) {
  if (!hasValidSession(request.cookies.bep_chay_session)) {
    response.status(401).json({ message: 'Phiên truy cập đã hết hạn.' });
    return;
  }
  next();
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, dataProvider: process.env.DATA_PROVIDER || 'local' });
});

app.get('/api/auth/status', (request, response) => {
  response.json({ authenticated: hasValidSession(request.cookies.bep_chay_session) });
});

app.post('/api/auth/login', (request, response) => {
  const ip = request.ip || 'unknown';
  const now = Date.now();
  const state = attempts.get(ip);
  if (state && state.resetAt > now && state.count >= 8) {
    response.status(429).json({ message: 'Bạn thử lại sau ít phút nhé.' });
    return;
  }
  if (!accessCode || String(request.body?.code) !== accessCode) {
    const next = state && state.resetAt > now ? state : { count: 0, resetAt: now + 10 * 60 * 1000 };
    next.count += 1;
    attempts.set(ip, next);
    response.status(401).json({ message: 'Mã chưa đúng.' });
    return;
  }
  attempts.delete(ip);
  response.cookie('bep_chay_session', createSession(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProduction,
    maxAge: 180 * 24 * 60 * 60 * 1000
  });
  response.json({ authenticated: true });
});

app.post('/api/auth/logout', (_request, response) => {
  response.clearCookie('bep_chay_session');
  response.status(204).end();
});

app.get('/api/state', requireSession, async (_request, response) => {
  if ((process.env.DATA_PROVIDER || 'local') !== 'firestore') {
    response.json({ mode: 'local', state: null });
    return;
  }
  try {
    response.json({ mode: 'firestore', state: await readState() });
  } catch (error) {
    console.error('Unable to read shared state', error);
    response.status(503).json({ message: 'Chưa kết nối được dữ liệu chung.' });
  }
});

app.put('/api/state', requireSession, async (request, response) => {
  if ((process.env.DATA_PROVIDER || 'local') !== 'firestore') {
    response.status(409).json({ message: 'Máy chủ đang ở chế độ dữ liệu cục bộ.' });
    return;
  }
  try {
    response.json({ state: await writeState(request.body.payload, request.body.expectedVersion) });
  } catch (error) {
    const typed = error as Error & { code?: string; current?: unknown };
    if (typed.code === 'VERSION_CONFLICT') {
      response.status(409).json({ message: typed.message, state: typed.current });
      return;
    }
    console.error('Unable to write shared state', error);
    response.status(503).json({ message: 'Chưa lưu được dữ liệu chung.' });
  }
});

app.post('/api/admin/backup', async (request, response) => {
  const expected = process.env.BACKUP_TOKEN;
  const supplied = request.header('authorization')?.replace(/^Bearer\s+/i, '');
  if (!expected || !supplied || supplied.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) {
    response.status(401).json({ message: 'Không có quyền tạo sao lưu.' });
    return;
  }
  try {
    const state = await readState();
    if (!state) { response.status(404).json({ message: 'Chưa có dữ liệu để sao lưu.' }); return; }
    response.json({ ok: true, backup: await createBackup(state) });
  } catch (error) {
    console.error('Unable to create backup', error);
    response.status(503).json({ message: 'Tạo sao lưu thất bại.' });
  }
});

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(currentDir, '../dist');
app.use(express.static(distDir));
app.get('*splat', (_request, response) => response.sendFile(path.join(distDir, 'index.html')));

app.listen(port, () => {
  console.log(`Bep Chay is running on port ${port}`);
});
