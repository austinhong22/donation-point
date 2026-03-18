import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useActor } from '../../contexts/ActorContext';
import { formatRoleLabel, roleToRoute } from '../../utils/actors';
import { ActorSwitcher } from './ActorSwitcher';

const navItems = [
  { to: '/donor', label: 'Donor' },
  { to: '/charity', label: 'Charity manager' },
  { to: '/admin', label: 'Admin' },
];

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { actors, currentActor, isLoading, errorMessage, selectActor } = useActor();

  return (
    <div className="shell">
      <header className="shell-header">
        <div>
          <p className="shell-kicker">Fair Donation Point PoC</p>
          <h1>Local demo console</h1>
          <p className="shell-copy">
            Explore the seeded donor, charity manager, and admin flow using the backend demo APIs.
          </p>
        </div>

        <div className="shell-controls">
          <ActorSwitcher
            actors={actors}
            currentActorId={currentActor?.id ?? null}
            disabled={isLoading}
            onSelect={(actorId) => {
              const actor = actors.find((candidate) => candidate.id === actorId);
              selectActor(actorId);
              navigate(roleToRoute(actor?.role));
            }}
          />
          <div className="actor-summary">
            <span>Current role</span>
            <strong>{currentActor ? formatRoleLabel(currentActor.role) : 'Loading'}</strong>
            <small>{currentActor?.email ?? 'Waiting for actor data'}</small>
          </div>
        </div>
      </header>

      <nav className="top-nav" aria-label="Primary">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            className={({ isActive }) =>
              isActive || location.pathname === item.to ? 'top-nav-link active' : 'top-nav-link'
            }
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {errorMessage ? <div className="shell-banner shell-banner-error">{errorMessage}</div> : null}

      <main className="shell-content">
        <Outlet />
      </main>
    </div>
  );
}
