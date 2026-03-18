import type { ActorRole } from '../api/types';

export function roleToRoute(role?: ActorRole) {
  if (role === 'CHARITY_MANAGER') {
    return '/charity';
  }

  if (role === 'ADMIN') {
    return '/admin';
  }

  return '/donor';
}

export function formatRoleLabel(role: ActorRole) {
  if (role === 'CHARITY_MANAGER') {
    return 'Charity Manager';
  }

  if (role === 'ADMIN') {
    return 'Admin';
  }

  return 'Donor';
}
