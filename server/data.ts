import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export interface StoredState {
  version: number;
  payload: unknown;
  updatedAt: string;
}

function firestoreDb() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) throw new Error('Thiếu cấu hình Firestore trên máy chủ.');
  if (!getApps().length) initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  return getFirestore();
}

export async function readState(): Promise<StoredState | null> {
  const snapshot = await firestoreDb().doc('app/state').get();
  return snapshot.exists ? snapshot.data() as StoredState : null;
}

export async function writeState(payload: unknown, expectedVersion?: number): Promise<StoredState> {
  const ref = firestoreDb().doc('app/state');
  return firestoreDb().runTransaction(async (transaction) => {
    const currentSnapshot = await transaction.get(ref);
    const current = currentSnapshot.exists ? currentSnapshot.data() as StoredState : null;
    if (typeof expectedVersion === 'number' && current && current.version !== expectedVersion) {
      const error = new Error('Dữ liệu đã được sửa trên thiết bị khác.');
      Object.assign(error, { code: 'VERSION_CONFLICT', current });
      throw error;
    }
    const next: StoredState = { version: (current?.version || 0) + 1, payload, updatedAt: new Date().toISOString() };
    transaction.set(ref, next);
    return next;
  });
}

function r2Client() {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) throw new Error('Thiếu cấu hình R2 trên máy chủ.');
  return new S3Client({ region: 'auto', endpoint, credentials: { accessKeyId, secretAccessKey } });
}

export async function createBackup(state: StoredState) {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error('Thiếu tên bucket R2.');
  const client = r2Client();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const key = `backups/bep-chay-${timestamp}.json`;
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: JSON.stringify(state), ContentType: 'application/json' }));
  const list = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: 'backups/bep-chay-' }));
  const completed = (list.Contents || []).filter((item) => item.Key).sort((a, b) => (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0));
  for (const old of completed.slice(2)) await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: old.Key! }));
  return { key, retained: Math.min(completed.length, 2) };
}

