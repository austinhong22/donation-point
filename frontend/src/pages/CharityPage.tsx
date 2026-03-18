import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createCharityOrder,
  getAllocationDetail,
  listMyAllocations,
  listMyOrders,
  listPartnerProducts,
} from '../api/client';
import type {
  AllocationDetail,
  CharityAllocationSummary,
  CharityOrder,
  PartnerProduct,
} from '../api/types';
import { AllocationTraceCard } from '../components/detail/AllocationTraceCard';
import { DataTable } from '../components/ui/DataTable';
import { ErrorState } from '../components/ui/ErrorState';
import { Field } from '../components/ui/Field';
import { LoadingState } from '../components/ui/LoadingState';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { useActor } from '../contexts/ActorContext';
import { roleToRoute } from '../utils/actors';
import { formatDateTime, formatPoints } from '../utils/format';

export function CharityPage() {
  const navigate = useNavigate();
  const { currentActor, isLoading: actorLoading } = useActor();
  const [allocations, setAllocations] = useState<CharityAllocationSummary[]>([]);
  const [orders, setOrders] = useState<CharityOrder[]>([]);
  const [products, setProducts] = useState<PartnerProduct[]>([]);
  const [selectedAllocationId, setSelectedAllocationId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [detail, setDetail] = useState<AllocationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadCharityData() {
    setIsLoading(true);

    try {
      const [nextAllocations, nextOrders, nextProducts] = await Promise.all([
        listMyAllocations(),
        listMyOrders(),
        listPartnerProducts(),
      ]);

      setAllocations(nextAllocations);
      setOrders(nextOrders);
      setProducts(nextProducts);
      setSelectedAllocationId((current) => current ?? nextAllocations[0]?.allocationId ?? null);
      setSelectedProductId((current) => current ?? nextProducts[0]?.id ?? null);
      setErrorMessage(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load charity data.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (actorLoading || currentActor?.role !== 'CHARITY_MANAGER') {
      return;
    }

    void loadCharityData();
  }, [actorLoading, currentActor?.role]);

  useEffect(() => {
    if (!selectedAllocationId || currentActor?.role !== 'CHARITY_MANAGER') {
      setDetail(null);
      return;
    }

    const allocationId = selectedAllocationId;

    async function loadDetail() {
      setDetailLoading(true);

      try {
        const nextDetail = await getAllocationDetail(allocationId);
        setDetail(nextDetail);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not load allocation detail.';
        setErrorMessage(message);
      } finally {
        setDetailLoading(false);
      }
    }

    void loadDetail();
  }, [currentActor?.role, selectedAllocationId]);

  if (actorLoading) {
    return <LoadingState title="Preparing charity page" message="Loading actor context." />;
  }

  if (!currentActor) {
    return <ErrorState title="No actor selected" message="Choose a seeded actor to continue." />;
  }

  if (currentActor.role !== 'CHARITY_MANAGER') {
    return (
      <ErrorState
        title="Charity manager actor required"
        message="Switch to the seeded charity manager actor to request partner goods."
        actionLabel="Go to current actor route"
        onAction={() => navigate(roleToRoute(currentActor.role))}
      />
    );
  }

  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? null;
  const orderPreviewPoints = selectedProduct ? selectedProduct.pointCost * quantity : 0;

  return (
    <div className="page-stack">
      <SurfaceCard>
        <SectionHeader title="Charity spending" description="Spend remaining allocation points on partner products for your charity." />

        <div className="stat-grid">
          <div className="stat-card">
            <span>Managed charity</span>
            <strong>{currentActor.managedCharityId ? `#${currentActor.managedCharityId}` : 'Not linked'}</strong>
          </div>
          <div className="stat-card">
            <span>Your visible balance</span>
            <strong>{formatPoints(currentActor.pointBalance)}</strong>
          </div>
          <div className="stat-card">
            <span>Order preview</span>
            <strong>{formatPoints(orderPreviewPoints)}</strong>
          </div>
        </div>
      </SurfaceCard>

      <div className="two-column-grid">
        <SurfaceCard>
          <SectionHeader title="Create partner order" description="For this PoC, one order spends from one donation allocation only." />

          {isLoading ? (
            <LoadingState title="Loading inputs" message="Fetching your allocations and partner catalog." />
          ) : errorMessage ? (
            <ErrorState title="Order form unavailable" message={errorMessage} />
          ) : (
            <form
              className="form-stack"
              onSubmit={async (event) => {
                event.preventDefault();

                if (!selectedAllocationId || !selectedProductId) {
                  setErrorMessage('Choose both an allocation and a partner product.');
                  return;
                }

                setSubmitting(true);

                try {
                  await createCharityOrder({
                    allocationId: selectedAllocationId,
                    partnerProductId: selectedProductId,
                    quantity,
                  });
                  await loadCharityData();
                  setSelectedAllocationId(selectedAllocationId);
                  setErrorMessage(null);
                } catch (error) {
                  const message = error instanceof Error ? error.message : 'Could not create the charity order.';
                  setErrorMessage(message);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <Field label="Donation allocation" hint="Only allocations for your charity are available.">
                <select
                  value={selectedAllocationId ?? ''}
                  onChange={(event) => setSelectedAllocationId(Number(event.target.value))}
                >
                  {allocations.map((allocation) => (
                    <option key={allocation.allocationId} value={allocation.allocationId}>
                      {allocation.donorName} · remaining {formatPoints(allocation.remainingPoints)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Partner product" hint="Total points are calculated from unit point cost and quantity.">
                <select
                  value={selectedProductId ?? ''}
                  onChange={(event) => setSelectedProductId(Number(event.target.value))}
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} · {formatPoints(product.pointCost)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Quantity">
                <input
                  min={1}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  type="number"
                  value={quantity}
                />
              </Field>

              <div className="form-preview">
                <span>Projected spend</span>
                <strong>{formatPoints(orderPreviewPoints)}</strong>
              </div>

              <button className="primary-button" disabled={submitting || allocations.length === 0 || products.length === 0} type="submit">
                {submitting ? 'Submitting order...' : 'Create order'}
              </button>
            </form>
          )}
        </SurfaceCard>

        <SurfaceCard>
          <SectionHeader title="Partner catalog" description="Seeded products the charity manager can request with allocated points." />
          {isLoading ? (
            <LoadingState title="Loading products" message="Fetching partner products." />
          ) : (
            <div className="catalog-list">
              {products.map((product) => (
                <article className="catalog-item" key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <p>{product.description}</p>
                  </div>
                  <span>{formatPoints(product.pointCost)}</span>
                </article>
              ))}
            </div>
          )}
        </SurfaceCard>
      </div>

      <SurfaceCard>
        <SectionHeader title="My allocations" description="Review donor allocations, remaining points, and open the trace detail below." />
        {isLoading ? (
          <LoadingState title="Loading allocations" message="Fetching allocations for your charity." />
        ) : errorMessage ? (
          <ErrorState title="Allocations unavailable" message={errorMessage} />
        ) : (
          <DataTable
            columns={[
              {
                key: 'donorName',
                header: 'Donor',
                render: (allocation) => allocation.donorName,
              },
              {
                key: 'allocatedPoints',
                header: 'Allocated',
                render: (allocation) => formatPoints(allocation.allocatedPoints),
              },
              {
                key: 'remainingPoints',
                header: 'Remaining',
                render: (allocation) => formatPoints(allocation.remainingPoints),
              },
              {
                key: 'status',
                header: 'Status',
                render: (allocation) => <StatusBadge status={allocation.status} />,
              },
              {
                key: 'createdAt',
                header: 'Created',
                render: (allocation) => formatDateTime(allocation.createdAt),
              },
              {
                key: 'action',
                header: 'Action',
                render: (allocation) => (
                  <button
                    className="secondary-button"
                    onClick={() => setSelectedAllocationId(allocation.allocationId)}
                    type="button"
                  >
                    View trace
                  </button>
                ),
              },
            ]}
            rows={allocations}
            rowKey={(allocation) => allocation.allocationId}
            emptyTitle="No allocations available"
            emptyMessage="Seed data did not expose any allocations for this actor."
          />
        )}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader title="My partner orders" description="Orders requested by this charity manager, including fulfillment status." />
        {isLoading ? (
          <LoadingState title="Loading orders" message="Fetching charity orders." />
        ) : errorMessage ? (
          <ErrorState title="Orders unavailable" message={errorMessage} />
        ) : (
          <DataTable
            columns={[
              {
                key: 'product',
                header: 'Product',
                render: (order) => order.partnerProductName,
              },
              {
                key: 'quantity',
                header: 'Qty',
                render: (order) => order.quantity,
              },
              {
                key: 'points',
                header: 'Points',
                render: (order) => formatPoints(order.totalPoints),
              },
              {
                key: 'status',
                header: 'Status',
                render: (order) => <StatusBadge status={order.status} />,
              },
              {
                key: 'createdAt',
                header: 'Requested',
                render: (order) => formatDateTime(order.createdAt),
              },
            ]}
            rows={orders}
            rowKey={(order) => order.orderId}
            emptyTitle="No orders yet"
            emptyMessage="Create the first partner order from an available allocation."
          />
        )}
      </SurfaceCard>

      {detailLoading ? (
        <LoadingState title="Loading allocation trace" message="Fetching donor, charity, order, and audit history." />
      ) : detail ? (
        <AllocationTraceCard detail={detail} />
      ) : (
        <SurfaceCard>
          <SectionHeader title="Allocation detail" description="Select an allocation above to inspect its end-to-end trace." />
        </SurfaceCard>
      )}
    </div>
  );
}
