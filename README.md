# Campus Pilot — React Edition

Campus Pilot is a student productivity dashboard based on the original project files. This version introduces React, React Router, Context API, Redux Toolkit, and controlled React forms while retaining the existing midnight-and-cyan visual style and core sections.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

1. Extract the project folder.
2. Open a terminal in `campus-pilot-react`.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL printed by Vite.

To create a production build, run `npm run build`.

## Rubric mapping

- **React Navigation / page structure:** `BrowserRouter`, `Routes`, `Route`, and `NavLink` in `src/App.jsx` provide client-side navigation for the dashboard, timetable, tasks, notes, attendance, CGPA calculator, Pomodoro, announcements, and expenses.
- **Context API / state architecture:** `src/context/AppContext.jsx` shares authentication, theme, and notes state across components. The theme and user session are persisted in local storage.
- **Redux Toolkit:** `src/store.js` defines a `tasks` slice with `addTask`, `toggleTask`, and `removeTask` reducers. `react-redux` provides the store to the app; task data persists in local storage.
- **React form handling:** Login/register, task, note, timetable, CGPA, and expense inputs are controlled with React state. Submit handlers validate required fields and update application state.

## Project structure

```text
campus-pilot-react/
├── index.html
├── package.json
├── README.md
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── store.js
    ├── style.css
    ├── react-additions.css
    └── context/
        └── AppContext.jsx
```

## Notes

- This is a front-end academic demo; authentication is local-browser-only and is not secure enough for production accounts.
- The original HTML, CSS, JavaScript, and README files should be kept as a backup while evaluating the React version.
- Example timetable, attendance, CGPA, announcements, and expenses are demo data and should be replaced with your actual data before presenting if required.
