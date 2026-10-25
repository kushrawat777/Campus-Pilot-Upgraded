import React from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campusPilotUser');
    return localStorage.getItem('campusPilotLoggedIn') === 'true' && saved ? JSON.parse(saved) : null;
  });
  const [dark, setDark] = useState(() => localStorage.getItem('campusDark') === 'true');
  const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem('campusPilotNotes') || 'null') || [
    { id: 1, title: 'Frontend Engineering II', body: 'DOM manipulation, events, localStorage and responsive UI patterns.', color: 'purple' },
    { id: 2, title: 'Operating Systems', body: 'Processes, CPU scheduling, memory management and Linux commands.', color: 'green' },
    { id: 3, title: 'AI Algorithms', body: 'Search algorithms, heuristics, complexity and problem solving.', color: 'blue' },
    { id: 4, title: 'Discrete Mathematics', body: 'Graphs, relations, sets, logic and combinatorics.', color: 'orange' },
    { id: 5, title: 'Project Ideas', body: 'Campus navigation, productivity dashboards and student tools.', color: 'purple' },
    { id: 6, title: 'Quick Revision', body: 'Important formulas, shortcuts and exam reminders.', color: 'green' }
  ]);

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
    localStorage.setItem('campusDark', String(dark));
  }, [dark]);
  useEffect(() => localStorage.setItem('campusPilotNotes', JSON.stringify(notes)), [notes]);

  const value = useMemo(() => ({
    user,
    login: account => { localStorage.setItem('campusPilotLoggedIn', 'true'); setUser(account); },
    logout: () => { localStorage.removeItem('campusPilotLoggedIn'); setUser(null); },
    dark,
    toggleTheme: () => setDark(current => !current),
    notes,
    addNote: note => setNotes(current => [{ ...note, id: Date.now(), color: 'purple' }, ...current]),
    updateNote: note => setNotes(current => current.map(item => item.id === note.id ? note : item)),
    removeNote: id => setNotes(current => current.filter(item => item.id !== id))
  }), [user, dark, notes]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
