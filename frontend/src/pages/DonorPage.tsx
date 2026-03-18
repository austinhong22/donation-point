import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listCharities, listPartnerProducts } from '../api/client';
import type { Charity, PartnerProduct } from '../api/types';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingState } from '../components/ui/LoadingState';
import { SectionHeader } from '../components/ui/SectionHeader';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { useActor } from '../contexts/ActorContext';
import { roleToRoute } from '../utils/actors';
import { formatPoints } from '../utils/format';

const flowSteps = [
  '1. Donor mock payment is recorded and converted into donation points.',
  '2. Donor allocates those points to a selected charity.',
  '3. Charity manager spends remaining allocated points on partner goods.',
  '4. Admin reviews partner orders and marks fulfillment complete.',
  '5. UI surfaces balances, histories, and an end-to-end timeline.',
];

export function DonorPage() {
  const navigate = useNavigate();
  const { currentActor, isLoading: actorLoading } = useActor();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [products, setProducts] = useState<PartnerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (actorLoading || currentActor?.role !== 'DONOR') {
      return;
    }

    async function loadReferenceData() {
      setIsLoading(true);

      try {
        const [nextCharities, nextProducts] = await Promise.all([listCharities(), listPartnerProducts()]);
        setCharities(nextCharities);
        setProducts(nextProducts);
        setErrorMessage(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not load donor reference data.';
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    }

    void loadReferenceData();
  }, [actorLoading, currentActor?.role]);

  if (actorLoading) {
    return <LoadingState title="Preparing donor page" message="Loading actor context." />;
  }

  if (!currentActor) {
    return <ErrorState title="No actor selected" message="Choose a seeded actor to continue." />;
  }

  if (currentActor.role !== 'DONOR') {
    return (
      <ErrorState
        title="Donor actor required"
        message="Switch to the seeded donor actor to explore the start of the flow."
        actionLabel="Go to current actor route"
        onAction={() => navigate(roleToRoute(currentActor.role))}
      />
    );
  }

  return (
    <div className="page-stack">
      <SurfaceCard>
        <SectionHeader title="Donor overview" description="This page anchors the beginning of the PoC flow and exposes the seeded discovery data." />
        <div className="stat-grid">
          <div className="stat-card">
            <span>Actor</span>
            <strong>{currentActor.displayName}</strong>
          </div>
          <div className="stat-card">
            <span>Seeded point balance</span>
            <strong>{formatPoints(currentActor.pointBalance)}</strong>
          </div>
          <div className="stat-card">
            <span>Charities in demo</span>
            <strong>{charities.length}</strong>
          </div>
          <div className="stat-card">
            <span>Partner products</span>
            <strong>{products.length}</strong>
          </div>
        </div>
      </SurfaceCard>

      <div className="two-column-grid">
        <SurfaceCard>
          <SectionHeader title="PoC flow" description="The main scenario the backend and frontend are prepared to demonstrate end to end." />
          <div className="timeline-list">
            {flowSteps.map((step) => (
              <article className="timeline-entry" key={step}>
                <strong>{step}</strong>
              </article>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <SectionHeader title="Seeded charities" description="Discovery data loaded from the backend for the donor experience." />
          {isLoading ? (
            <LoadingState title="Loading charities" message="Fetching available charities." />
          ) : errorMessage ? (
            <ErrorState title="Charities unavailable" message={errorMessage} />
          ) : (
            <div className="catalog-list">
              {charities.map((charity) => (
                <article className="catalog-item" key={charity.id}>
                  <div>
                    <strong>{charity.name}</strong>
                    <p>{charity.description}</p>
                  </div>
                  <span>{formatPoints(charity.pointBalance)}</span>
                </article>
              ))}
            </div>
          )}
        </SurfaceCard>
      </div>

      <SurfaceCard>
        <SectionHeader title="Partner product catalog" description="Products that the charity manager can request once points are allocated." />
        {isLoading ? (
          <LoadingState title="Loading products" message="Fetching seeded partner products." />
        ) : errorMessage ? (
          <ErrorState title="Products unavailable" message={errorMessage} />
        ) : (
          <div className="catalog-grid">
            {products.map((product) => (
              <article className="catalog-panel" key={product.id}>
                <p className="catalog-code">{product.sku}</p>
                <strong>{product.name}</strong>
                <p>{product.description}</p>
                <span>{formatPoints(product.pointCost)}</span>
              </article>
            ))}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
