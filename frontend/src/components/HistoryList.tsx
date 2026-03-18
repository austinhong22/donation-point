import { historyItems } from '../data/demoData';

export function HistoryList() {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Recent history</h2>
        <p>Balances and transactions will eventually come from append-only ledger data.</p>
      </div>
      <div className="history-list">
        {historyItems.map((item) => (
          <article className="history-item" key={item.id}>
            <div>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </div>
            <div className="history-meta">
              <strong>{item.amount}</strong>
              <span>{item.status}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
