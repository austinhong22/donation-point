import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { useActor } from './contexts/ActorContext';
import { AdminPage } from './pages/AdminPage';
import { CharityPage } from './pages/CharityPage';
import { DonorPage } from './pages/DonorPage';
import { LoadingState } from './components/ui/LoadingState';
import { roleToRoute } from './utils/actors';

function ActorHomeRedirect() {
  const { currentActor, isLoading } = useActor();

  if (isLoading) {
    return <LoadingState title="Preparing the demo" message="Loading seeded actors and routes." />;
  }

  return <Navigate to={roleToRoute(currentActor?.role)} replace />;
}

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<ActorHomeRedirect />} />
        <Route path="/donor" element={<DonorPage />} />
        <Route path="/charity" element={<CharityPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
