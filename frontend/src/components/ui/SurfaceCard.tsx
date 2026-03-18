import type { ReactNode } from 'react';

interface SurfaceCardProps {
  children: ReactNode;
  className?: string;
}

export function SurfaceCard({ children, className }: SurfaceCardProps) {
  return <section className={className ? `surface-card ${className}` : 'surface-card'}>{children}</section>;
}
