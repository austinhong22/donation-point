import { roles } from '../data/demoData';

export function RolePills() {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Supported roles</h2>
        <p>Prepared for the three PoC actors from day one.</p>
      </div>
      <div className="pill-row">
        {roles.map((role) => (
          <span className="pill" key={role}>
            {role}
          </span>
        ))}
      </div>
    </section>
  );
}
