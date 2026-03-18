interface StatusBadgeProps {
  status: string;
  tone?: 'default' | 'neutral';
}

export function StatusBadge({ status, tone = 'default' }: StatusBadgeProps) {
  const normalized = status.toLowerCase();
  let variant = 'badge-slate';

  if (tone === 'neutral') {
    variant = 'badge-neutral';
  } else if (normalized.includes('fulfill') || normalized.includes('complete')) {
    variant = 'badge-green';
  } else if (normalized.includes('request') || normalized.includes('pending') || normalized.includes('active')) {
    variant = 'badge-amber';
  } else if (normalized.includes('denied') || normalized.includes('error')) {
    variant = 'badge-red';
  }

  return <span className={`status-badge ${variant}`}>{status.split('_').join(' ')}</span>;
}
