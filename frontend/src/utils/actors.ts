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
    return '기부처 담당자';
  }

  if (role === 'ADMIN') {
    return '운영자';
  }

  return '후원자';
}
