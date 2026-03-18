import type { PropsWithChildren } from 'react';

export function Layout({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">Local-only PoC</p>
        <h1>Fair donation points, shown as a clear end-to-end story.</h1>
        <p className="hero-copy">
          This scaffold sets up a backend Spring Boot service, a React frontend,
          and a MySQL runtime so we can implement the donor, charity manager,
          and admin flow incrementally.
        </p>
      </header>
      <main className="content-grid">{children}</main>
    </div>
  );
}
