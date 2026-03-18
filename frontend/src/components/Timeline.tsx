import { timelineItems } from '../data/demoData';

export function Timeline() {
  return (
    <section className="panel panel-wide">
      <div className="panel-header">
        <h2>PoC timeline</h2>
        <p>The main story that backend and frontend will implement next.</p>
      </div>
      <div className="timeline-list">
        {timelineItems.map((item) => (
          <article className={`timeline-item ${item.status.toLowerCase()}`} key={item.id}>
            <div className="timeline-stage">
              <span className="timeline-status">{item.status}</span>
              <h3>{item.stage}</h3>
            </div>
            <p>{item.description}</p>
            <span className="timeline-owner">{item.owner}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
