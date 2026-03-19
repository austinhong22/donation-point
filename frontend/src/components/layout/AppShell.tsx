import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useActor } from '../../contexts/ActorContext';
import { formatRoleLabel, roleToRoute } from '../../utils/actors';
import { formatActorDisplayName } from '../../utils/format';
import { ActorSwitcher } from './ActorSwitcher';

const navItems = [
  { to: '/donor', label: '후원자' },
  { to: '/charity', label: '기부처 담당자' },
  { to: '/admin', label: '운영자' },
];

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { actors, currentActor, isLoading, errorMessage, selectActor } = useActor();

  return (
    <div className="shell">
      <header className="shell-header">
        <div>
          <p className="shell-kicker">공정 기부 포인트 개념 검증</p>
          <h1>로컬 데모 콘솔</h1>
          <p className="shell-copy">
            시드 데이터로 준비된 후원자, 기부처 담당자, 운영자 흐름을 한글 화면으로 확인할 수 있습니다.
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
            <span>현재 역할</span>
            <strong>{currentActor ? formatRoleLabel(currentActor.role) : '불러오는 중'}</strong>
            <small>{currentActor ? formatActorDisplayName(currentActor.displayName) : '역할 정보를 기다리는 중입니다.'}</small>
            <small>{currentActor ? '데모 계정이 연결되어 있습니다.' : '역할 정보를 기다리는 중입니다.'}</small>
          </div>
        </div>
      </header>

      <nav className="top-nav" aria-label="주요 메뉴">
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
