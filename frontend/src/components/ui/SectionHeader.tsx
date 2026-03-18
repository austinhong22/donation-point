interface SectionHeaderProps {
  title: string;
  description?: string;
  compact?: boolean;
}

export function SectionHeader({ title, description, compact = false }: SectionHeaderProps) {
  return (
    <div className={compact ? 'section-header section-header-compact' : 'section-header'}>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
