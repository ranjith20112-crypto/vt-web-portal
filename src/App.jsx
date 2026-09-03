import { useEffect } from 'react';
import './App.css';
import LoginPage from './login-component/loginscreen';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { appRoutes, appRoutesPayload } from './routes/appRoutes';
import api from './apiroute/apiroute';

function App() {

  // ─── Auto-sync every registered page as a Module on app load ───────
  // Adding a new entry to appRoutes.js is the ONLY step needed —
  // this effect pushes { name, path, moduleCode, moduleGroup } for every
  // route to the backend, which upserts them into app_modules and
  // deactivates any that were removed. No manual DB inserts, ever.
  useEffect(() => {
    api.post('/modules/sync', appRoutesPayload)
      .then((res) => {
        if (res.data?.success) {
          console.log(`Modules synced: ${res.data.syncedCount ?? appRoutesPayload.length}`);
        }
      })
      .catch((err) => {
        console.error('Module sync failed:', err);
      });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        {appRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<route.component />}
          />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

export default App;