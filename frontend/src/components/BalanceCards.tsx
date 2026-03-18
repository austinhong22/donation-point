import { balanceCards } from '../data/demoData';

export function BalanceCards() {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Demo snapshot</h2>
        <p>Static data for now, ready to be replaced with backend API calls.</p>
      </div>
      <div className="card-grid">
        {balanceCards.map((card) => (
          <article className={`metric-card ${card.tone}`} key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
