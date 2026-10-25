import { configureStore, createSlice } from '@reduxjs/toolkit';

const savedTasks = JSON.parse(localStorage.getItem('campusPilotTasks') || 'null');

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: savedTasks || [
    { id: 1, title: 'Finish Campus Pilot UI', detail: 'Frontend Engineering', done: true },
    { id: 2, title: 'Review OS lecture notes', detail: 'Operating Systems', done: true },
    { id: 3, title: 'Complete attendance tracker', detail: 'Project work', done: false },
    { id: 4, title: 'Practice JavaScript DOM', detail: 'Coding', done: false },
    { id: 5, title: 'Submit FEE project outline', detail: 'Deadline · Friday', done: false },
    { id: 6, title: 'Read AI Algorithms chapter', detail: 'Study', done: false },
    { id: 7, title: 'Update project README', detail: 'Project work', done: false }
  ],
  reducers: {
    addTask: (state, action) => {
      state.push({ id: Date.now(), title: action.payload.title, detail: action.payload.detail || 'Added just now', done: false });
    },
    toggleTask: (state, action) => {
      const task = state.find(item => item.id === action.payload);
      if (task) task.done = !task.done;
    },
    removeTask: (state, action) => state.filter(item => item.id !== action.payload)
  }
});

export const { addTask, toggleTask, removeTask } = tasksSlice.actions;
export const store = configureStore({ reducer: { tasks: tasksSlice.reducer } });
store.subscribe(() => localStorage.setItem('campusPilotTasks', JSON.stringify(store.getState().tasks)));
