import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addTask, removeTask, toggleTask } from './store.js';
import { useApp } from './context/AppContext.jsx';

const navItems = [
  ['/', '⌂', 'Dashboard'], ['/timetable', '◷', 'Timetable'], ['/tasks', '✓', 'To-do List'],
  ['/notes', '▤', 'Notes'], ['/attendance', '◔', 'Attendance'], ['/cgpa', '★', 'CGPA Calculator'],
  ['/pomodoro', '◉', 'Pomodoro'], ['/announcements', '!', 'Announcements'], ['/expenses', '₹', 'Expenses']
];
const titles = { '/': 'Dashboard', '/timetable': 'Weekly Timetable', '/tasks': 'To-do List', '/notes': 'Notes', '/attendance': 'Attendance Tracker', '/cgpa': 'CGPA Calculator', '/pomodoro': 'Pomodoro Timer', '/announcements': 'College Announcements', '/expenses': 'Expense Tracker' };
const classes = [
  ['AI', 'Foundations of AI Algorithms', '09:00 — 10:00 · C-204', 'Prof. Mehta', 'blue'],
  ['FE', 'Frontend Engineering II', '10:15 — 11:15 · F-12 Lab', 'Prof. Arora', 'purple'],
  ['OS', 'Operating System & Linux', '12:00 — 01:00 · A-109', 'Dr. Singh', 'green'],
  ['DM', 'Discrete Mathematics', '02:00 — 03:00 · B-301', 'Dr. Sharma', 'orange']
];
const announcements = [
  ['📢', 'purple', 'ACADEMICS · 2 HOURS AGO', 'FEE Evaluation registrations are open', 'Students can submit their project details and evaluation preferences through the department portal.'],
  ['🎓', 'green', 'LIBRARY · YESTERDAY', 'Extended library hours', 'The central library will remain open until 10:00 PM during evaluation week.'],
  ['⚡', 'orange', 'IT SERVICES · 2 DAYS AGO', 'Campus Wi-Fi maintenance', 'Scheduled maintenance may cause intermittent connectivity between 11 PM and 1 AM.']
];

function Toast({ message }) {
  return <div id="toast" className={message ? 'show' : ''}>{message}</div>;
}

function AuthScreen() {
  const { login } = useApp();
  const [mode, setMode] = useState('login');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });

  function submit(e) {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    if (mode === 'register') {
      const account = { name: form.name.trim(), email, password: form.password };
      if (!account.name || !email || form.password.length < 6) {
        setError(true); setMessage('Enter your name and email, and use a password of at least 6 characters.'); return;
      }
      localStorage.setItem('campusPilotUser', JSON.stringify(account));
      setMode('login'); setForm({ ...form, password: '' }); setError(false); setMessage('Account created. Please log in.');
      return;
    }
    const account = JSON.parse(localStorage.getItem('campusPilotUser') || 'null');
    if (!account) { setError(true); setMessage('No account found. Please register first.'); return; }
    if (account.email !== email || account.password !== form.password) { setError(true); setMessage('Incorrect email or password.'); return; }
    login(account);
  }

  return <div className="auth-screen"><div className="auth-glow glow-one"/><div className="auth-glow glow-two"/><div className="auth-card">
    <div className="auth-brand"><div className="brand-mark">✦</div><div><h1>Campus Pilot</h1><span>Student OS</span></div></div>
    <div className="auth-copy"><span className="pill">CAMPUS COMMAND CENTER</span><h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p>{mode === 'login' ? 'Sign in to your student productivity cockpit.' : 'Set up your Campus Pilot student account.'}</p></div>
    <div className="auth-tabs"><button type="button" className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setMessage(''); }}>Login</button><button type="button" className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => { setMode('register'); setMessage(''); }}>Register</button></div>
    <form className="auth-form" onSubmit={submit}>
      {mode === 'register' && <label>Full name<input name="name" value={form.name} onChange={update} placeholder="Your name" autoComplete="name" required /></label>}
      <label>College email<input name="email" type="email" value={form.email} onChange={update} placeholder="you@college.edu" autoComplete="email" required /></label>
      <label>Password<input name="password" type="password" value={form.password} onChange={update} placeholder={mode === 'login' ? 'Enter your password' : 'Create a password'} minLength={mode === 'register' ? 6 : undefined} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required /></label>
      <button className="auth-submit" type="submit">{mode === 'login' ? 'Enter Campus Pilot' : 'Create account'} <span>→</span></button>
      <p className="auth-hint">This front-end demo stores account details locally in your browser.</p>
    </form>
    {message && <p className={`auth-message ${error ? 'form-error' : 'form-success'}`} role="status">{message}</p>}
  </div></div>;
}

function Layout({ children, notify }) {
  const { user, logout, dark, toggleTheme } = useApp();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const tasks = useSelector(state => state.tasks);
  const { notes } = useApp();
  const title = titles[location.pathname] || 'Campus Pilot';
  const today = new Date();
  const dateText = `${today.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()} · ${today.getDate()} ${today.toLocaleDateString('en-US', { month: 'long' }).toUpperCase()} ${today.getFullYear()}`;
  const searchItems = useMemo(() => [
    ...navItems.map(([path, , label]) => ({ title: label, detail: `Open ${label}`, path })),
    ...tasks.map(task => ({ title: task.title, detail: `Task · ${task.detail}`, path: '/tasks' })),
    ...notes.map(note => ({ title: note.title, detail: 'Saved note', path: '/notes' })),
    ...announcements.map(item => ({ title: item[3], detail: 'Campus announcement', path: '/announcements' }))
  ].filter(item => !query || `${item.title} ${item.detail}`.toLowerCase().includes(query.toLowerCase())), [query, tasks, notes]);

  useEffect(() => {
    const handler = e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true); } if (e.key === 'Escape') setSearchOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark">✦</div><div><h1>Campus Pilot</h1><span>Student OS</span></div></div>
      <nav>{navItems.map(([path, icon, label]) => <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><span>{icon}</span>{label}</NavLink>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item" onClick={toggleTheme}><span>{dark ? '☀' : '☾'}</span>{dark ? 'Light mode' : 'Dark mode'}</button><div className="profile-mini"><div className="avatar">{(user?.name || 'K').charAt(0).toUpperCase()}</div><div className="profile-details"><strong>{user?.name || 'Student'}</strong><small>BE CSE AI</small></div><button className="logout-btn" title="Log out" onClick={logout}>↪</button></div></div>
    </aside>
    <main className="main"><header className="topbar"><div><p className="eyebrow">{dateText}</p><h2>{location.pathname === '/' ? `Good day, ${user?.name || 'Student'} 👋` : title}</h2></div><div className="top-actions"><div className="search-box"><span>⌕</span><input value={query} onFocus={() => setSearchOpen(true)} onChange={e => { setQuery(e.target.value); setSearchOpen(true); }} placeholder="Search Campus Pilot..."/><kbd>Ctrl K</kbd></div><button className="icon-btn" onClick={() => notify('You have 3 new campus updates')} aria-label="Notifications">🔔<i/></button></div></header>
      {searchOpen && <div className="search-overlay"><div className="search-results"><div className="search-head"><strong>Universal Search</strong><button onClick={() => { setSearchOpen(false); setQuery(''); }}>Esc</button></div><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tasks, notes, classes, announcements..."/><div id="searchResults">{searchItems.slice(0, 12).map((item, i) => <Link className="result" key={`${item.title}-${i}`} to={item.path} onClick={() => setSearchOpen(false)}><b>{item.title}</b><small>{item.detail}</small></Link>)}{searchItems.length === 0 && <div className="result">No results found.</div>}</div></div></div>}
      {children}
    </main>
  </div>;
}

function Dashboard() {
  const tasks = useSelector(state => state.tasks);
  const done = tasks.filter(task => task.done).length;
  const [seconds, setSeconds] = useState(1500);
  const [running, setRunning] = useState(false);
  useEffect(() => { if (!running) return; const id = setInterval(() => setSeconds(s => { if (s <= 1) { setRunning(false); return 0; } return s - 1; }), 1000); return () => clearInterval(id); }, [running]);
  const time = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  return <section className="page active-page"><div className="hero"><div><span className="pill">CAMPUS COMMAND CENTER</span><h3>Everything you need,<br/><em>one cockpit.</em></h3><p>Plan classes, track progress, manage tasks and stay on top of campus life.</p></div><div className="hero-orbit"><div className="orbit-ring"/><div className="orbit-core">✦</div></div></div>
    <div className="stats-grid"><article className="stat-card"><span>Attendance</span><strong>82%</strong><small className="up">↑ 3.2% this month</small></article><article className="stat-card"><span>Current CGPA</span><strong>8.70</strong><small>Target 9.0</small></article><article className="stat-card"><span>Tasks Completed</span><strong>{done}/{tasks.length}</strong><small>{tasks.length - done} remaining</small></article><article className="stat-card"><span>Spent This Month</span><strong>₹4,280</strong><small>₹720 under budget</small></article></div>
    <div className="dashboard-grid"><article className="panel timetable-preview"><div className="panel-head"><div><span className="section-label">TODAY</span><h3>Wednesday schedule</h3></div><Link className="text-btn" to="/timetable">View full timetable →</Link></div><ClassRows compact/></article>
      <article className="panel focus-card"><div className="panel-head"><div><span className="section-label">FOCUS</span><h3>Pomodoro</h3></div><span className="live-dot">{running ? 'RUNNING' : 'READY'}</span></div><div className="timer-ring"><div><strong>{time}</strong><span>FOCUS SESSION</span></div></div><button className="primary-btn" onClick={() => setRunning(v => !v)}>{running ? 'Pause focus session' : 'Start focus session'}</button><Link className="text-btn block-link" to="/pomodoro">Open full timer →</Link></article>
      <article className="panel task-preview"><div className="panel-head"><div><span className="section-label">PRODUCTIVITY</span><h3>Today's tasks</h3></div><Link className="text-btn" to="/tasks">Manage →</Link></div><TaskItems tasks={tasks.slice(0, 4)}/></article>
      <article className="panel announcements-preview"><div className="panel-head"><div><span className="section-label">CAMPUS FEED</span><h3>Latest announcements</h3></div><Link className="text-btn" to="/announcements">See all →</Link></div>{announcements.map((a, i) => <div className="announcement-mini" key={a[3]}><span className={`announce-icon ${a[1]}`}>{a[0]}</span><div><strong>{a[3]}</strong><p>{a[4]}</p></div><time>{['2h', '1d', '2d'][i]}</time></div>)}</article>
    </div></section>;
}

function ClassRows({ compact = false, items = classes }) {
  return <div className={compact ? 'class-list' : 'full-schedule'}>{items.map((item, i) => compact ? <div className={`class-row ${i === 1 ? 'current' : ''}`} key={item[1]}><div className="time">{item[2].split(' — ')[0]}<span>{i < 2 ? 'AM' : 'PM'}</span></div><div className={`class-dot ${item[4]}`}/><div className="class-info"><strong>{item[1]}</strong><span>{item[2].split(' · ')[1]} · {item[3]}</span></div><b>{item[2].split(' — ')[1]?.split(' · ')[0]}</b></div> : <div className="schedule-card" key={item[1]}><span className={`course-tag ${item[4]}`}>{item[0]}</span><div><strong>{item[1]}</strong><p>{item[2]}</p></div><span>{item[3]}</span></div>)}</div>;
}

function Timetable({ notify }) {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('campusPilotClasses') || 'null') || classes);
  const [form, setForm] = useState({ name: '', time: '', room: '', teacher: '' });
  const [show, setShow] = useState(false);
  const [day, setDay] = useState('WED');
  useEffect(() => localStorage.setItem('campusPilotClasses', JSON.stringify(items)), [items]);
  function submit(e) { e.preventDefault(); if (!form.name.trim() || !form.time.trim() || !form.room.trim() || !form.teacher.trim()) return; setItems([...items, ['NEW', form.name.trim(), `${form.time} · ${form.room}`, form.teacher.trim(), 'purple']]); setForm({ name: '', time: '', room: '', teacher: '' }); setShow(false); notify('Class added to timetable'); }
  return <section className="page active-page"><div className="section-top"><div><span className="section-label">ACADEMICS</span><h3>Weekly Timetable</h3><p>Your classes at a glance.</p></div><button className="primary-btn small" onClick={() => setShow(!show)}>+ Add class</button></div>
    <div className="week-tabs">{['MON','TUE','WED','THU','FRI'].map((d, i) => <button key={d} className={`day ${day === d ? 'today' : ''}`} onClick={() => setDay(d)}>{d}<b>{17 + i}</b></button>)}</div>
    {show && <form className="panel form-grid" onSubmit={submit}><label>Class name<input value={form.name} onChange={e => setForm({...form, name:e.target.value})} required/></label><label>Time<input value={form.time} onChange={e => setForm({...form, time:e.target.value})} placeholder="09:00 — 10:00" required/></label><label>Room<input value={form.room} onChange={e => setForm({...form, room:e.target.value})} required/></label><label>Professor<input value={form.teacher} onChange={e => setForm({...form, teacher:e.target.value})} required/></label><button className="primary-btn" type="submit">Save class</button></form>}
    <ClassRows items={items}/></section>;
}

function TaskItems({ tasks }) {
  const dispatch = useDispatch();
  return <>{tasks.map(task => <div className={`task-item ${task.done ? 'done' : ''}`} key={task.id}><button className="task-check" onClick={() => dispatch(toggleTask(task.id))} aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}>{task.done ? '✓' : ''}</button><div><strong>{task.title}</strong><small>{task.detail}</small></div></div>)}</>;
}
function TasksPage({ notify }) {
  const tasks = useSelector(state => state.tasks);
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [filter, setFilter] = useState('All');
  const filtered = tasks.filter(task => filter === 'All' || (filter === 'Completed' ? task.done : !task.done));
  const done = tasks.filter(task => task.done).length;
  function submit(e) { e.preventDefault(); if (!title.trim()) return; dispatch(addTask({ title: title.trim(), detail: detail.trim() || 'Added just now' })); setTitle(''); setDetail(''); notify('Task added'); }
  return <section className="page active-page"><div className="section-top"><div><span className="section-label">PRODUCTIVITY</span><h3>To-do List</h3><p>Turn plans into progress.</p></div><form className="inline-form" onSubmit={submit}><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Add a task..." aria-label="Task title" required/><input className="task-detail-input" value={detail} onChange={e => setDetail(e.target.value)} placeholder="Category (optional)" aria-label="Task category"/><button className="primary-btn small" type="submit">Add</button></form></div>
    <div className="task-layout"><div className="panel"><div className="filter-row">{['All','Today','Completed'].map(f => <button type="button" key={f} className={`filter ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>)}</div>{filtered.length ? <TaskItems tasks={filtered}/> : <p className="empty-state">No tasks in this view.</p>}{filtered.map(task => <button className="task-remove" key={`remove-${task.id}`} onClick={() => { dispatch(removeTask(task.id)); notify('Task removed'); }}>Remove “{task.title}”</button>)}</div><div className="panel progress-panel"><span className="section-label">YOUR PROGRESS</span><strong>{tasks.length ? Math.round(done / tasks.length * 100) : 0}%</strong><div className="progress-bar"><i style={{width: `${tasks.length ? done / tasks.length * 100 : 0}%`}}/></div><p>{done} of {tasks.length} tasks completed.</p></div></div></section>;
}

function NotesPage({ notify }) {
  const { notes, addNote, updateNote, removeNote } = useApp();
  const [form, setForm] = useState({ title: '', body: '' });
  const [editing, setEditing] = useState(null);
  const [show, setShow] = useState(false);
  function submit(e) { e.preventDefault(); if (!form.title.trim() || !form.body.trim()) return; if (editing) updateNote({ ...editing, ...form }); else addNote(form); setForm({title:'',body:''}); setEditing(null); setShow(false); notify(editing ? 'Note updated' : 'Note created'); }
  function edit(note) { setEditing(note); setForm({ title: note.title, body: note.body }); setShow(true); }
  return <section className="page active-page"><div className="section-top"><div><span className="section-label">KNOWLEDGE</span><h3>Notes</h3><p>Keep your semester knowledge organized.</p></div><button className="primary-btn small" onClick={() => { setEditing(null); setForm({title:'',body:''}); setShow(!show); }}>+ New note</button></div>
    {show && <form className="panel note-form" onSubmit={submit}><label>Note title<input value={form.title} onChange={e => setForm({...form,title:e.target.value})} required maxLength={90}/></label><label>Note content<textarea value={form.body} onChange={e => setForm({...form,body:e.target.value})} rows="4" required/></label><div><button className="primary-btn" type="submit">{editing ? 'Save changes' : 'Create note'}</button> <button className="secondary-btn" type="button" onClick={() => setShow(false)}>Cancel</button></div></form>}
    <div className="notes-grid">{notes.map(note => <article className="note-card" key={note.id}><div className={`note-color ${note.color}`}/><h4>{note.title}</h4><p>{note.body}</p><div className="note-actions"><button onClick={() => edit(note)}>Edit</button><button onClick={() => { removeNote(note.id); notify('Note deleted'); }}>Delete</button></div></article>)}</div></section>;
}

function Attendance() {
  const subjects = [['Frontend Engineering II',18,20],['Operating Systems',15,19],['Discrete Mathematics',16,20],['AI Algorithms',17,20]];
  return <section className="page active-page"><div className="section-top"><div><span className="section-label">ACADEMICS</span><h3>Attendance Tracker</h3><p>Stay safely above your minimum attendance.</p></div></div><div className="attendance-grid"><div className="attendance-summary panel"><div className="attendance-circle"><strong>82%</strong><span>OVERALL</span></div><div><h4>Good standing</h4><p>Keep monitoring each subject to stay above 75% attendance.</p></div></div><div className="panel chart-panel"><h3>Attendance trend</h3><div className="simple-bars">{[['Apr',74],['May',76],['Jun',78],['Jul',80],['Aug',82]].map(([m,v]) => <div key={m}><span>{v}%</span><i style={{height:`${v}%`}}/><small>{m}</small></div>)}</div></div></div><div className="subject-grid">{subjects.map(([name,att,total]) => <div className="subject" key={name}><div><strong>{name}</strong><span>{att} / {total} classes</span></div><b>{Math.round(att/total*100)}%</b><div className="mini-bar"><i style={{width:`${att/total*100}%`}}/></div></div>)}</div></section>;
}

function CGPA({ notify }) {
  const [grades, setGrades] = useState([['Frontend Engineering II','A',4],['Operating Systems','A-',4],['Discrete Mathematics','B+',3],['AI Algorithms','A',4]]);
  const [result, setResult] = useState('8.70');
  const points = {A:10,'A-':9,'B+':8,B:7,'B-':6,C:5};
  function change(i, k, value) { setGrades(current => current.map((row, index) => index === i ? row.map((v, j) => j === k ? value : v) : row)); }
  function calculate() { const credits = grades.reduce((sum, row) => sum + Math.max(0, Number(row[2]) || 0), 0); const score = grades.reduce((sum, row) => sum + (points[row[1]] || 0) * Math.max(0, Number(row[2]) || 0), 0); setResult(credits ? (score / credits).toFixed(2) : '0.00'); notify('CGPA calculated'); }
  return <section className="page active-page"><div className="section-top"><div><span className="section-label">ACADEMICS</span><h3>CGPA Calculator</h3><p>Estimate your semester performance.</p></div></div><div className="cgpa-layout"><div className="panel"><div id="gradeRows">{grades.map((row,i) => <div className="grade-row" key={i}><input aria-label="Subject name" value={row[0]} onChange={e => change(i,0,e.target.value)}/><select aria-label="Grade" value={row[1]} onChange={e => change(i,1,e.target.value)}>{Object.keys(points).map(point => <option key={point}>{point}</option>)}</select><input aria-label="Credits" type="number" min="1" max="30" value={row[2]} onChange={e => change(i,2,e.target.value)}/><button className="remove-grade" onClick={() => setGrades(g => g.filter((_,j) => j !== i))} aria-label="Remove subject">×</button></div>)}</div><button className="secondary-btn" onClick={() => setGrades(g => [...g,['New Subject','A',3]])}>+ Add subject</button> <button className="primary-btn" onClick={calculate}>Calculate CGPA</button></div><div className="cgpa-result panel"><span>YOUR CGPA</span><strong>{result}</strong><p>Based on entered grades and credits.</p><div className="target"><span>Target</span><b>9.00</b></div></div></div></section>;
}

function Pomodoro({ notify }) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState('FOCUS');
  useEffect(() => { if (!running) return; const id = setInterval(() => { setSeconds(s => { if (s > 0) return s - 1; if (minutes > 0) { setMinutes(m => m - 1); return 59; } setRunning(false); notify('Pomodoro session complete 🎉'); return 0; }); }, 1000); return () => clearInterval(id); }, [running, minutes, notify]);
  function preset(m) { setRunning(false); setMinutes(m); setSeconds(0); setMode(m === 15 ? 'SHORT SESSION' : m === 50 ? 'DEEP WORK' : 'FOCUS'); }
  return <section className="page active-page"><div className="focus-page"><span className="section-label">DEEP WORK</span><h3>Pomodoro Timer</h3><p>Focus for 25 minutes. Rest. Repeat.</p><div className="big-timer"><div><strong>{String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}</strong><span>{mode}</span></div></div><div className="timer-controls"><button className="secondary-btn" onClick={() => {setRunning(false);setMinutes(25);setSeconds(0);setMode('FOCUS');}}>Reset</button><button className="primary-btn" onClick={() => setRunning(v => !v)}>{running ? 'Pause' : 'Start'}</button></div><div className="timer-presets">{[[25,'25 min'],[15,'15 min'],[50,'50 min']].map(([m,label]) => <button key={m} className={minutes === m ? 'active' : ''} onClick={() => preset(m)}>{label}</button>)}</div></div></section>;
}

function Announcements() {
  return <section className="page active-page"><div className="section-top"><div><span className="section-label">CAMPUS FEED</span><h3>College Announcements</h3><p>Important updates in one place.</p></div></div><div className="announce-list">{announcements.map(a => <article className="announce-card" key={a[3]}><div className={`announce-icon ${a[1]}`}>{a[0]}</div><div><span>{a[2]}</span><h4>{a[3]}</h4><p>{a[4]}</p></div><button type="button" onClick={e => e.currentTarget.textContent = e.currentTarget.textContent === 'Read' ? 'Read ✓' : 'Read'}>Read</button></article>)}</div></section>;
}

function Expenses({ notify }) {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('campusPilotExpenses') || 'null') || [{category:'Food',amount:1860,icon:'🍔'},{category:'Transport',amount:920,icon:'🚌'},{category:'Study',amount:800,icon:'📚'},{category:'Entertainment',amount:700,icon:'🎮'}]);
  const [form, setForm] = useState({ category:'', amount:'' });
  const [show, setShow] = useState(false);
  useEffect(() => localStorage.setItem('campusPilotExpenses', JSON.stringify(items)), [items]);
  const total = items.reduce((sum, item) => sum + Number(item.amount), 0);
  function submit(e) { e.preventDefault(); const amount = Number(form.amount); if (!form.category.trim() || !Number.isFinite(amount) || amount <= 0) return; setItems([...items, {category:form.category.trim(),amount,icon:'₹'}]); setForm({category:'',amount:''}); setShow(false); notify('Expense added'); }
  return <section className="page active-page"><div className="section-top"><div><span className="section-label">PERSONAL FINANCE</span><h3>Expense Tracker</h3><p>Know where your campus money goes.</p></div><button className="primary-btn small" onClick={() => setShow(v => !v)}>+ Add expense</button></div>{show && <form className="panel expense-form" onSubmit={submit}><label>Category<input value={form.category} onChange={e => setForm({...form,category:e.target.value})} placeholder="e.g. Food" required/></label><label>Amount (₹)<input type="number" min="1" step="0.01" value={form.amount} onChange={e => setForm({...form,amount:e.target.value})} required/></label><button className="primary-btn" type="submit">Save expense</button></form>}<div className="expense-top"><div className="expense-total panel"><span>THIS MONTH</span><strong>₹{total.toLocaleString('en-IN')}</strong><small>₹5,000 monthly budget</small><div className="progress-bar"><i style={{width:`${Math.min(total/5000*100,100)}%`}}/></div></div><div className="panel expense-breakdown"><h3>Spending by category</h3>{items.map((item,i) => <div className="expense-category" key={`${item.category}-${i}`}><span>{item.icon} {item.category}</span><b>₹{Number(item.amount).toLocaleString('en-IN')}</b><i style={{width:`${total ? item.amount/total*100 : 0}%`}}/></div>)}</div></div><div className="panel expense-table"><div className="table-row head"><span>Category</span><span>Transactions</span><span>Amount</span></div>{items.map((item,i) => <div className="table-row" key={`${item.category}-${i}`}><span>{item.icon} {item.category}</span><span>1</span><b>₹{Number(item.amount).toLocaleString('en-IN')}</b></div>)}</div></section>;
}

export default function App() {
  const { user } = useApp();
  const [message, setMessage] = useState('');
  useEffect(() => { if (!message) return; const id = setTimeout(() => setMessage(''), 2400); return () => clearTimeout(id); }, [message]);
  const notify = text => setMessage(text);
  if (!user) return <><AuthScreen/><Toast message={message}/></>;
  return <Layout notify={notify}><Routes>
    <Route path="/" element={<Dashboard/>}/>
    <Route path="/timetable" element={<Timetable notify={notify}/>}/>
    <Route path="/tasks" element={<TasksPage notify={notify}/>}/>
    <Route path="/notes" element={<NotesPage notify={notify}/>}/>
    <Route path="/attendance" element={<Attendance/>}/>
    <Route path="/cgpa" element={<CGPA notify={notify}/>}/>
    <Route path="/pomodoro" element={<Pomodoro notify={notify}/>}/>
    <Route path="/announcements" element={<Announcements/>}/>
    <Route path="/expenses" element={<Expenses notify={notify}/>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes><Toast message={message}/></Layout>;
}
