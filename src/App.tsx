import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { BookOpen, CalendarDays, Check, ChefHat, Clock3, Heart, Home, Leaf, ListChecks, LockKeyhole, Minus, Plus, RefreshCw, Search, Settings as SettingsIcon, ShoppingBasket, SlidersHorizontal, Sparkles, Utensils, WifiOff } from 'lucide-react';
import { Link, NavLink, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { categories } from './data/recipes';
import { scaleAmount, shoppingFromMeals, suggestMeal } from './lib/engine';
import { useApp } from './state';
import type { Category, MealKey, Priority, Recipe, Settings } from './types';

const mealNames: Record<MealKey, string> = { breakfast: 'Bữa sáng', lunch: 'Bữa trưa', dinner: 'Bữa tối', snack: 'Bữa phụ' };
const priorities: Array<{ id: Priority; label: string; icon: ReactNode }> = [
  { id: 'taste', label: 'Hợp khẩu vị', icon: <Heart size={16} /> },
  { id: 'quick', label: 'Nấu nhanh', icon: <Clock3 size={16} /> },
  { id: 'pantry', label: 'Tận dụng đồ có', icon: <ShoppingBasket size={16} /> },
  { id: 'budget', label: 'Tiết kiệm', icon: <Leaf size={16} /> },
  { id: 'balanced', label: 'Cân đối', icon: <Sparkles size={16} /> }
];

const today = () => new Date().toLocaleDateString('en-CA');
const prettyDate = (value: string) => new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${value}T12:00:00`));

function App() {
  const [auth, setAuth] = useState<'loading' | 'yes' | 'no'>('loading');
  useEffect(() => {
    fetch('/api/auth/status').then((res) => res.json()).then((data) => setAuth(data.authenticated ? 'yes' : 'no')).catch(() => setAuth('no'));
  }, []);
  if (auth === 'loading') return <Splash />;
  if (auth === 'no') return <Unlock onSuccess={() => setAuth('yes')} />;
  return <Shell />;
}

function Splash() {
  return <main className="splash"><div className="brand-mark"><Leaf /></div><h1>Bếp Chay</h1><p>Mỗi ngày một bữa lành</p></main>;
}

function Unlock({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError('');
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Không thể mở bếp.');
      onSuccess();
    } catch (err) { setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.'); }
    finally { setLoading(false); }
  }
  return <main className="unlock-page">
    <section className="unlock-card">
      <div className="brand-mark"><Leaf /></div>
      <p className="eyebrow">BẾP NHÀ MÌNH</p><h1>Mời bạn vào bếp</h1>
      <p className="muted">Nhập mã chung của gia đình. Thiết bị này sẽ được ghi nhớ.</p>
      <form onSubmit={submit}><label htmlFor="code">Mã vào bếp</label><div className="code-input"><LockKeyhole size={19} /><input id="code" value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" autoComplete="current-password" maxLength={20} autoFocus /></div>{error && <p className="form-error">{error}</p>}<button className="primary wide" disabled={loading || !code}>{loading ? 'Đang mở…' : 'Vào bếp'}</button></form>
    </section>
  </main>;
}

function Shell() {
  const syncStatus = useSharedSync();
  return <div className="app-shell">
    <header className="topbar"><Link to="/" className="brand"><span className="brand-mark small"><Leaf /></span><span><b>Bếp Chay</b><small>{syncStatus === 'synced' ? 'Đã đồng bộ cho cả nhà' : syncStatus === 'saving' ? 'Đang lưu…' : syncStatus === 'offline' ? 'Đang dùng dữ liệu trên máy' : 'Mỗi ngày một bữa lành'}</small></span></Link><NavLink to="/settings" className="icon-button" aria-label="Cài đặt"><SettingsIcon /></NavLink></header>
    <main className="page"><Routes><Route path="/" element={<TodayPage />} /><Route path="/recipes" element={<RecipeLibrary />} /><Route path="/recipes/new" element={<RecipeEditor />} /><Route path="/recipes/:id" element={<RecipeDetail />} /><Route path="/recipes/:id/edit" element={<RecipeEditor />} /><Route path="/plan" element={<PlanPage />} /><Route path="/shopping" element={<ShoppingPage />} /><Route path="/settings" element={<SettingsPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></main>
    <nav className="bottom-nav"><NavItem to="/" icon={<Home />} label="Hôm nay" /><NavItem to="/recipes" icon={<BookOpen />} label="Kho món" /><NavItem to="/plan" icon={<CalendarDays />} label="Kế hoạch" /><NavItem to="/shopping" icon={<ListChecks />} label="Đi chợ" /></nav>
  </div>;
}

function useSharedSync() {
  const { state, dispatch } = useApp();
  const [status, setStatus] = useState<'checking' | 'local' | 'saving' | 'synced' | 'offline'>('checking');
  const ready = useRef(false);
  const version = useRef<number | undefined>(undefined);
  const latestState = useRef(state);
  latestState.current = state;
  useEffect(() => {
    let cancelled = false;
    fetch('/api/state').then(async (response) => {
      if (!response.ok) throw new Error('sync unavailable');
      const data = await response.json();
      if (cancelled) return;
      if (data.mode === 'local') { setStatus('local'); return; }
      if (data.state?.payload) {
        version.current = data.state.version;
        dispatch({ type: 'hydrate', value: data.state.payload });
        ready.current = true;
        setStatus('synced');
      } else {
        const created = await fetch('/api/state', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payload: latestState.current }) });
        if (!created.ok) throw new Error('sync unavailable');
        const result = await created.json();
        version.current = result.state.version;
        ready.current = true;
        setStatus('synced');
      }
    }).catch(() => { if (!cancelled) setStatus(navigator.onLine ? 'local' : 'offline'); });
    return () => { cancelled = true; };
  }, [dispatch]);
  useEffect(() => {
    if (!ready.current) return;
    setStatus('saving');
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch('/api/state', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payload: state, expectedVersion: version.current }) });
        const result = await response.json();
        if (response.status === 409 && result.state?.payload) {
          version.current = result.state.version;
          dispatch({ type: 'hydrate', value: result.state.payload });
          setStatus('synced');
          return;
        }
        if (!response.ok) throw new Error('save failed');
        version.current = result.state.version;
        setStatus('synced');
      } catch { setStatus(navigator.onLine ? 'local' : 'offline'); }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [state, dispatch]);
  return status;
}

function NavItem({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return <NavLink to={to} className={({ isActive }) => isActive ? 'active' : ''}>{icon}<span>{label}</span></NavLink>;
}

function TodayPage() {
  const { state, dispatch } = useApp();
  const date = today();
  const todays = state.settings.enabledMeals.map((meal) => state.meals.find((item) => item.id === `${date}-${meal}`) || suggestMeal(meal, date, state.recipes, state.settings, state.pantry, state.meals));
  function updatePriorities(id: Priority) {
    const current = state.settings.priorities;
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    dispatch({ type: 'settings', value: { ...state.settings, priorities: next } });
  }
  function refresh(meal: MealKey) {
    dispatch({ type: 'meal-upsert', value: suggestMeal(meal, date, state.recipes, state.settings, state.pantry, [...state.meals, ...todays]) });
  }
  return <>
    <section className="hero"><div><p className="eyebrow">{prettyDate(date)}</p><h1>Hôm nay ăn gì?</h1><p>Chọn theo nhịp ngày hôm nay, Bếp sẽ lo phần còn lại.</p></div><div className="hero-art"><ChefHat /></div></section>
    <section className="section"><div className="section-title"><div><p className="eyebrow">CHỌN NHANH</p><h2>Hôm nay mình ưu tiên…</h2></div><SlidersHorizontal /></div><div className="chips">{priorities.map((item) => <button key={item.id} className={state.settings.priorities.includes(item.id) ? 'chip selected' : 'chip'} onClick={() => updatePriorities(item.id)}>{item.icon}{item.label}</button>)}</div></section>
    <PantryPicker />
    <section className="section"><div className="section-title"><div><p className="eyebrow">GỢI Ý CHO NHÀ MÌNH</p><h2>Thực đơn hôm nay</h2></div></div><div className="meal-list">{todays.map((meal) => <MealCard key={meal.id} meal={meal} onRefresh={() => refresh(meal.meal)} />)}</div></section>
  </>;
}

function PantryPicker() {
  const { state, dispatch } = useApp();
  const [value, setValue] = useState('');
  function add() { const next = value.trim(); if (next && !state.pantry.includes(next)) dispatch({ type: 'pantry', value: [...state.pantry, next] }); setValue(''); }
  return <section className="section pantry"><div><p className="eyebrow">ĐANG CÓ TRONG BẾP</p><h2>Tận dụng nguyên liệu</h2><p className="muted">Nhập nhanh, không cần số lượng.</p></div><div className="inline-input"><input value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') add(); }} placeholder="Ví dụ: đậu phụ" /><button onClick={add} aria-label="Thêm"><Plus /></button></div>{state.pantry.length > 0 && <div className="chips compact">{state.pantry.map((item) => <button className="chip selected" key={item} onClick={() => dispatch({ type: 'pantry', value: state.pantry.filter((value) => value !== item) })}>{item}<Minus size={14} /></button>)}</div>}</section>;
}

function MealCard({ meal, onRefresh }: { meal: ReturnType<typeof suggestMeal>; onRefresh: () => void }) {
  const { state, dispatch } = useApp();
  const recipes = meal.recipeIds.map((id) => state.recipes.find((item) => item.id === id)).filter(Boolean) as Recipe[];
  const locked = meal.status !== 'suggested';
  function adjust(delta: number) { dispatch({ type: 'meal-upsert', value: { ...meal, servings: Math.max(1, meal.servings + delta) } }); }
  return <article className="meal-card"><div className="meal-card-head"><div><span className="meal-time">{mealNames[meal.meal]}</span><div className="servings"><button onClick={() => adjust(-1)}><Minus /></button><span>{meal.servings} người</span><button onClick={() => adjust(1)}><Plus /></button></div></div><button className="round-action" onClick={onRefresh} disabled={locked} aria-label="Gợi ý khác"><RefreshCw /></button></div><div className="recipe-strip">{recipes.map((recipe) => <Link to={`/recipes/${recipe.id}`} className="mini-recipe" key={recipe.id}><RecipeImage recipe={recipe} /><div><small>{recipe.category}</small><b>{recipe.name}</b><span><Clock3 /> {recipe.prepMinutes + recipe.cookMinutes} phút</span></div></Link>)}</div><div className="reason"><Sparkles /> {meal.reasons.join(' · ')}</div><div className="meal-actions">{meal.status === 'suggested' && <button className="primary" onClick={() => dispatch({ type: 'meal-upsert', value: { ...meal, status: 'confirmed' } })}><Check /> Chốt bữa này</button>}{meal.status === 'confirmed' && <><span className="confirmed"><Check /> Đã chốt</span><button className="ghost" onClick={() => dispatch({ type: 'meal-upsert', value: { ...meal, status: 'cooked' } })}>Đã nấu</button><button className="ghost" onClick={() => dispatch({ type: 'meal-upsert', value: { ...meal, status: 'skipped' } })}>Bỏ qua</button></>}{meal.status === 'cooked' && <span className="confirmed"><Check /> Cả nhà đã ăn</span>}{meal.status === 'skipped' && <span className="muted">Đã bỏ qua bữa này</span>}</div></article>;
}

function RecipeImage({ recipe, large = false }: { recipe: Recipe; large?: boolean }) {
  return <div className={large ? 'recipe-image large' : 'recipe-image'} aria-label={`Ảnh giữ chỗ cho ${recipe.name}`}><Leaf /><span>{recipe.category}</span></div>;
}

function RecipeLibrary() {
  const { state } = useApp();
  const [query, setQuery] = useState(''); const [category, setCategory] = useState('Tất cả');
  const recipes = state.recipes.filter((recipe) => !recipe.hidden && (category === 'Tất cả' || recipe.category === category) && `${recipe.name} ${recipe.tags.join(' ')} ${recipe.ingredients.map((item) => item.name).join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  return <><div className="heading-with-action"><PageHeading eyebrow="26 MÓN KHỞI ĐẦU" title="Kho món nhà mình" text="Tìm theo tên món, nguyên liệu hoặc nhóm món." /><Link className="primary" to="/recipes/new"><Plus /> Thêm món</Link></div><div className="search-box"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm món hoặc nguyên liệu…" /></div><div className="chips scroll"><button className={category === 'Tất cả' ? 'chip selected' : 'chip'} onClick={() => setCategory('Tất cả')}>Tất cả</button>{categories.map((item) => <button key={item} className={category === item ? 'chip selected' : 'chip'} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="recipe-grid">{recipes.map((recipe) => <RecipeTile recipe={recipe} key={recipe.id} />)}</div>{recipes.length === 0 && <Empty icon={<Search />} title="Chưa tìm thấy món" text="Thử tên hoặc nguyên liệu khác nhé." />}</>;
}

function RecipeTile({ recipe }: { recipe: Recipe }) {
  const { dispatch } = useApp();
  return <article className="recipe-tile"><Link to={`/recipes/${recipe.id}`}><RecipeImage recipe={recipe} /></Link><div className="tile-body"><div className="tile-top"><span>{recipe.category}</span><button className={recipe.favorite ? 'heart active' : 'heart'} onClick={() => dispatch({ type: 'recipe-toggle-favorite', id: recipe.id })}><Heart /></button></div><Link to={`/recipes/${recipe.id}`}><h3>{recipe.name}</h3><p>{recipe.summary}</p><div className="meta"><span><Clock3 /> {recipe.prepMinutes + recipe.cookMinutes} phút</span><span><Utensils /> {recipe.servings} người</span></div></Link></div></article>;
}

function RecipeDetail() {
  const { id } = useParams(); const { state } = useApp(); const recipe = state.recipes.find((item) => item.id === id); const [servings, setServings] = useState(recipe?.servings || 2);
  if (!recipe) return <Empty icon={<BookOpen />} title="Không tìm thấy món" text="Món này có thể đã được ẩn." />;
  return <><RecipeImage recipe={recipe} large /><section className="recipe-detail"><div className="detail-heading"><div><p className="eyebrow">{recipe.category}</p><h1>{recipe.name}</h1><p>{recipe.summary}</p></div><Link className="ghost" to={`/recipes/${recipe.id}/edit`}>Chỉnh sửa</Link></div><div className="status-note"><span className={`status-dot ${recipe.verification}`} />{recipe.verification === 'draft' ? 'Bản nháp — cần đối chiếu trước khi nấu' : recipe.verification === 'source-checked' ? 'Đã đối chiếu phương pháp' : 'Đã nấu thử'}</div><div className="detail-stats"><span><Clock3 /> Chuẩn bị {recipe.prepMinutes} phút</span><span><ChefHat /> Nấu {recipe.cookMinutes} phút</span>{recipe.advanceMinutes ? <span><CalendarDays /> Cần chuẩn bị trước {recipe.advanceMinutes} phút</span> : null}</div><div className="serving-control"><b>Khẩu phần</b><div className="servings"><button onClick={() => setServings(Math.max(1, servings - 1))}><Minus /></button><span>{servings} người</span><button onClick={() => setServings(servings + 1)}><Plus /></button></div></div><section className="detail-section"><h2>Nguyên liệu</h2><ul className="ingredient-list">{recipe.ingredients.map((item) => <li key={`${item.id}-${item.unit}`}><span>{item.name}{item.note ? <small>{item.note}</small> : null}</span><b>{scaleAmount(item.amount, recipe.servings, servings)} {item.unit}</b></li>)}</ul></section><section className="detail-section"><h2>Cách làm</h2><ol className="steps">{recipe.steps.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol></section><section className="source-note"><b>Ghi chú nội dung</b><p>{recipe.sourceNote}</p>{recipe.sources?.length ? <ul>{recipe.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul> : null}</section></section></>;
}

function RecipeEditor() {
  const { id } = useParams(); const { state, dispatch } = useApp(); const navigate = useNavigate(); const existing = id ? state.recipes.find((item) => item.id === id) : undefined; const isNew = !id;
  const [name, setName] = useState(existing?.name || ''); const [summary, setSummary] = useState(existing?.summary || ''); const [category, setCategory] = useState<Category>(existing?.category || 'Kho'); const [servings, setServings] = useState(existing?.servings || 2); const [prepMinutes, setPrepMinutes] = useState(existing?.prepMinutes || 15); const [cookMinutes, setCookMinutes] = useState(existing?.cookMinutes || 20); const [hidden, setHidden] = useState(existing?.hidden || false); const [verification, setVerification] = useState<Recipe['verification']>(existing?.verification || 'draft');
  const [ingredientText, setIngredientText] = useState(existing?.ingredients.map((item) => `${item.name} | ${item.amount} | ${item.unit}`).join('\n') || '');
  const [stepText, setStepText] = useState(existing?.steps.join('\n') || '');
  if (!isNew && !existing) return <Navigate to="/recipes" />;
  function slug(value: string) { return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
  function inferredRoles(value: Category): Recipe['roles'] { if (value === 'Món nước' || value === 'Cơm/cháo') return ['one-bowl']; if (value === 'Canh') return ['soup']; if (value === 'Xào' || value === 'Gỏi/trộn' || value === 'Hấp/luộc') return ['vegetable']; return ['main']; }
  function save(event: FormEvent) {
    event.preventDefault();
    const ingredients = ingredientText.split('\n').map((line) => line.split('|').map((part) => part.trim())).filter((parts) => parts[0] && Number(parts[1]) >= 0 && parts[2]).map(([ingredientName, amount, unit]) => ({ id: slug(ingredientName), name: ingredientName, amount: Number(amount), unit }));
    const steps = stepText.split('\n').map((item) => item.trim()).filter(Boolean);
    if (!ingredients.length || !steps.length) return;
    const recipeId = existing?.id || `${slug(name)}-${Date.now().toString(36)}`;
    const value: Recipe = { id: recipeId, name, summary, category, servings, prepMinutes, cookMinutes, ingredients, steps, tags: existing?.tags || [], roles: existing?.roles || inferredRoles(category), equipment: existing?.equipment || ['bếp ga'], spicy: existing?.spicy || false, budget: existing?.budget ?? true, favorite: existing?.favorite, hidden, sourceNote: existing?.sourceNote || 'Công thức do gia đình thêm, chưa ghi nguồn tham khảo.', sources: existing?.sources, verification, updatedAt: new Date().toISOString(), version: (existing?.version || 0) + 1 };
    dispatch({ type: 'recipe-upsert', value }); navigate(`/recipes/${recipeId}`);
  }
  return <><PageHeading eyebrow="QUẢN LÝ MÓN" title={isNew ? 'Thêm món mới' : `Sửa ${existing!.name}`} text="Mỗi dòng nguyên liệu theo mẫu: Tên | số lượng | đơn vị. Mỗi dòng cách làm là một bước." /><form className="editor-form" onSubmit={save}><div className="form-grid"><label>Tên món<input value={name} onChange={(e) => setName(e.target.value)} required /></label><label>Nhóm món<select value={category} onChange={(e) => setCategory(e.target.value as Category)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label>Số người<input type="number" min="1" value={servings} onChange={(e) => setServings(Number(e.target.value))} required /></label><label>Chuẩn bị (phút)<input type="number" min="0" value={prepMinutes} onChange={(e) => setPrepMinutes(Number(e.target.value))} required /></label><label>Nấu (phút)<input type="number" min="1" value={cookMinutes} onChange={(e) => setCookMinutes(Number(e.target.value))} required /></label></div><label>Mô tả<textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} required /></label><label>Nguyên liệu<textarea value={ingredientText} onChange={(e) => setIngredientText(e.target.value)} rows={7} placeholder={'Đậu phụ | 300 | g\nNước tương | 20 | ml'} required /></label><label>Các bước<textarea value={stepText} onChange={(e) => setStepText(e.target.value)} rows={7} placeholder={'Sơ chế nguyên liệu.\nNấu trên lửa vừa.\nNêm lại và hoàn thành.'} required /></label><label>Trạng thái<select value={verification} onChange={(e) => setVerification(e.target.value as Recipe['verification'])}><option value="draft">Bản nháp</option><option value="source-checked">Đã đối chiếu nguồn</option><option value="cooked">Đã nấu thử</option></select></label><label className="toggle-row"><input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} /><span>Ẩn món khỏi kho và gợi ý</span></label><div className="form-actions"><button type="button" className="ghost" onClick={() => navigate(-1)}>Hủy</button><button className="primary">Lưu món</button></div></form></>;
}

function PlanPage() {
  const { state, dispatch } = useApp(); const start = new Date(); const days = Array.from({ length: 7 }, (_, i) => { const day = new Date(start); day.setDate(start.getDate() + i); return day.toLocaleDateString('en-CA'); });
  function addDay(date: string) { for (const meal of state.settings.enabledMeals.filter((item) => item !== 'snack')) dispatch({ type: 'meal-upsert', value: suggestMeal(meal, date, state.recipes, state.settings, state.pantry, state.meals) }); }
  return <><PageHeading eyebrow="KHI CẦN CHỦ ĐỘNG" title="Kế hoạch 7 ngày" text="Lập trước một ngày hoặc cả tuần; hôm nào ăn ngoài cứ bỏ qua." /><div className="week-list">{days.map((date) => { const meals = state.meals.filter((item) => item.date === date); return <section className="day-card" key={date}><div className="day-head"><div><b>{prettyDate(date)}</b>{date === today() && <span>Hôm nay</span>}</div><button className="ghost" onClick={() => addDay(date)}>{meals.length ? 'Làm mới' : 'Gợi ý ngày này'}</button></div>{meals.length ? <div className="day-meals">{meals.map((meal) => <div key={meal.id}><small>{mealNames[meal.meal]}</small><p>{meal.recipeIds.map((id) => state.recipes.find((recipe) => recipe.id === id)?.name).filter(Boolean).join(' · ')}</p></div>)}</div> : <p className="muted">Chưa lên món.</p>}</section>; })}</div></>;
}

function ShoppingPage() {
  const { state, dispatch } = useApp();
  const planned = state.meals.filter((item) => item.status === 'confirmed' || item.status === 'suggested');
  function generate() { dispatch({ type: 'shopping-set', value: shoppingFromMeals(planned, state.recipes, state.shopping) }); }
  const checked = state.shopping.filter((item) => item.checked).length;
  return <><PageHeading eyebrow="DANH SÁCH DÙNG CHUNG" title="Đi chợ" text="Nguyên liệu giống nhau và cùng đơn vị sẽ được cộng lại." /><section className="shopping-summary"><ShoppingBasket /><div><b>{state.shopping.length ? `${checked}/${state.shopping.length} món đã xong` : 'Chưa có danh sách'}</b><p>Từ {planned.length} bữa trong kế hoạch</p></div><button className="primary" onClick={generate}>{state.shopping.length ? 'Cập nhật' : 'Tạo danh sách'}</button></section><div className="shopping-list">{state.shopping.map((item) => <label className={item.checked ? 'shopping-item checked' : 'shopping-item'} key={item.id}><input type="checkbox" checked={item.checked} onChange={() => dispatch({ type: 'shopping-toggle', id: item.id })} /><span className="checkmark"><Check /></span><span>{item.name}</span><b>{Math.round(item.amount * 10) / 10} {item.unit}</b></label>)}</div>{!state.shopping.length && <Empty icon={<ShoppingBasket />} title="Giỏ đang trống" text="Lên vài bữa trong Kế hoạch rồi tạo danh sách nhé." />}</>;
}

function SettingsPage() {
  const { state, dispatch } = useApp(); const [draft, setDraft] = useState<Settings>(state.settings); const [saved, setSaved] = useState(false);
  function toggleMeal(meal: MealKey) { setDraft({ ...draft, enabledMeals: draft.enabledMeals.includes(meal) ? draft.enabledMeals.filter((item) => item !== meal) : [...draft.enabledMeals, meal] }); }
  function save() { dispatch({ type: 'settings', value: draft }); setSaved(true); window.setTimeout(() => setSaved(false), 1800); }
  return <><PageHeading eyebrow="BẾP NHÀ MÌNH" title="Cài đặt" text="Bếp dùng các lựa chọn này khi tạo gợi ý mới." /><section className="settings-card"><h2>Bữa muốn được gợi ý</h2><div className="option-grid">{(Object.keys(mealNames) as MealKey[]).map((meal) => <button key={meal} className={draft.enabledMeals.includes(meal) ? 'option selected' : 'option'} onClick={() => toggleMeal(meal)}><span className="fake-check"><Check /></span>{mealNames[meal]}</button>)}</div></section><section className="settings-card"><h2>Số người mặc định</h2><div className="servings large-control"><button onClick={() => setDraft({ ...draft, defaultServings: Math.max(1, draft.defaultServings - 1) })}><Minus /></button><span>{draft.defaultServings} người</span><button onClick={() => setDraft({ ...draft, defaultServings: draft.defaultServings + 1 })}><Plus /></button></div></section><section className="settings-card"><h2>Nguyên liệu hạn chế</h2><label>Không được có<input value={draft.avoidedIngredients.join(', ')} onChange={(e) => setDraft({ ...draft, avoidedIngredients: e.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} /></label><label>Ít thích<input value={draft.dislikedIngredients.join(', ')} onChange={(e) => setDraft({ ...draft, dislikedIngredients: e.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} /></label><p className="hint">Phân cách bằng dấu phẩy. Dị ứng hiện chưa được cung cấp.</p></section><section className="offline-note"><WifiOff /><div><b>Công thức đã có trên thiết bị</b><p>Bạn vẫn đọc được kho món đã mở sau khi mất mạng. Chỉnh sửa cần có Internet ở bản hoàn thiện.</p></div></section><button className="primary wide sticky-save" onClick={save}>{saved ? <><Check /> Đã lưu</> : 'Lưu cài đặt'}</button></>;
}

function PageHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) { return <header className="page-heading"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{text}</p></header>; }
function Empty({ icon, title, text }: { icon: ReactNode; title: string; text: string }) { return <div className="empty"><span>{icon}</span><h3>{title}</h3><p>{text}</p></div>; }

export default App;
