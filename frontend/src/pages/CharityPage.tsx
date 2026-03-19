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
  const { currentActor, isLoading: actorLoading, refreshActors } = useActor();
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

  const selectedAllocation = allocations.find((allocation) => allocation.allocationId === selectedAllocationId) ?? null;
  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? null;
  const orderPreviewPoints = selectedProduct ? selectedProduct.pointCost * quantity : 0;
  const remainingBeforeOrder = selectedAllocation?.remainingPoints ?? 0;
  const remainingAfterOrder = remainingBeforeOrder - orderPreviewPoints;
  const totalRemainingPoints = allocations.reduce((sum, allocation) => sum + allocation.remainingPoints, 0);
  const requestedOrders = orders.filter((order) => order.status !== 'FULFILLED').length;
  const selectedAllocationOrderCount = selectedAllocation
    ? orders.filter((order) => order.allocationId === selectedAllocation.allocationId).length
    : 0;
  const orderDisabled =
    submitting ||
    !selectedAllocationId ||
    !selectedProductId ||
    quantity < 1 ||
    allocations.length === 0 ||
    products.length === 0 ||
    orderPreviewPoints > remainingBeforeOrder;

  return (
    <div className="page-stack">
      <SurfaceCard>
        <SectionHeader title="Charity balance summary" description="Review received donor allocations and spend them on partner goods for your charity." />
        <div className="stat-grid">
          <div className="stat-card">
            <span>Managed charity</span>
            <strong>{currentActor.managedCharityId ? `#${currentActor.managedCharityId}` : 'Not linked'}</strong>
          </div>
          <div className="stat-card">
            <span>Total remaining points</span>
            <strong>{formatPoints(totalRemainingPoints)}</strong>
          </div>
          <div className="stat-card">
            <span>Received allocations</span>
            <strong>{allocations.length}</strong>
          </div>
          <div className="stat-card">
            <span>Open partner orders</span>
            <strong>{requestedOrders}</strong>
          </div>
          <div className="stat-card">
            <span>Selected allocation remaining</span>
            <strong>{formatPoints(remainingBeforeOrder)}</strong>
          </div>
        </div>
      </SurfaceCard>

      {errorMessage ? <div className="page-banner page-banner-error">{errorMessage}</div> : null}

      <div className="two-column-grid">
        <SurfaceCard>
          <SectionHeader title="Create order from allocation" description="One order uses one selected donation allocation. Remaining points are shown before and after submit." />

          {isLoading ? (
            <LoadingState title="Loading inputs" message="Fetching allocations and partner products." />
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
                  await refreshActors();
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
              <Field label="Donation allocation" hint="Only allocations received by your charity are available.">
                <select
                  value={selectedAllocationId ?? ''}
                  onChange={(event) => setSelectedAllocationId(Number(event.target.value))}
                >
                  {allocations.map((allocation) => (
                    <option key={allocation.allocationId} value={allocation.allocationId}>
                      #{allocation.allocationId} · {allocation.donorName} · remaining {formatPoints(allocation.remainingPoints)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Partner product" hint="Order total points = unit point cost × quantity.">
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

              <div className="detail-summary-grid">
                <div className="detail-summary-item">
                  <span>Allocation funding this order</span>
                  <strong>{selectedAllocation ? `#${selectedAllocation.allocationId}` : 'Choose an allocation'}</strong>
                </div>
                <div className="detail-summary-item">
                  <span>Remaining before order</span>
                  <strong>{formatPoints(remainingBeforeOrder)}</strong>
                </div>
                <div className="detail-summary-item">
                  <span>Projected order spend</span>
                  <strong>{formatPoints(orderPreviewPoints)}</strong>
                </div>
                <div className="detail-summary-item">
                  <span>Remaining after order</span>
                  <strong>{remainingAfterOrder >= 0 ? formatPoints(remainingAfterOrder) : 'Insufficient points'}</strong>
                </div>
                <div className="detail-summary-item">
                  <span>Orders already funded by this allocation</span>
                  <strong>{selectedAllocationOrderCount}</strong>
                </div>
              </div>

              <button className="primary-button" disabled={orderDisabled} type="submit">
                {submitting ? 'Submitting order...' : 'Create order'}
              </button>
            </form>
          )}
        </SurfaceCard>

        <SurfaceCard>
          <SectionHeader title="Partner product catalog" description="Seeded products that can be funded by received donation allocations." />
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
        <SectionHeader title="Received allocations" description="See each donor allocation, remaining points, and which trace to inspect below." />
        {isLoading ? (
          <LoadingState title="Loading allocations" message="Fetching received allocations for your charity." />
        ) : (
          <DataTable
            columns={[
              {
                key: 'allocation',
                header: 'Allocation',
                render: (allocation) => `#${allocation.allocationId}`,
              },
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
                key: 'fundedOrders',
                header: 'Funded orders',
                render: (allocation) => orders.filter((order) => order.allocationId === allocation.allocationId).length,
              },
              {
                key: 'status',
                header: 'Status',
                render: (allocation) => <StatusBadge status={allocation.status} />,
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
        <SectionHeader title="Charity order history" description="See which allocation funded which order and how much each order spent." />
        {isLoading ? (
          <LoadingState title="Loading orders" message="Fetching charity order history." />
        ) : (
          <DataTable
            columns={[
              {
                key: 'allocation',
                header: 'Funding allocation',
                render: (order) => `#${order.allocationId}`,
              },
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
              {
                key: 'action',
                header: 'Action',
                render: (order) => (
                  <button
                    className="secondary-button"
                    onClick={() => setSelectedAllocationId(order.allocationId)}
                    type="button"
                  >
                    Open allocation
                  </button>
                ),
              },
            ]}
            rows={orders}
            rowKey={(order) => order.orderId}
            emptyTitle="No orders yet"
            emptyMessage="Create the first partner order from a received allocation."
          />
        )}
      </SurfaceCard>

      {detailLoading ? (
        <LoadingState title="Loading allocation trace" message="Fetching donor, charity, order, and audit history." />
      ) : detail ? (
        <AllocationTraceCard detail={detail} />
      ) : (
        <SurfaceCard>
          <SectionHeader title="Allocation detail" description="Select an allocation above to inspect its shared timeline and order trace." />
        </SurfaceCard>
      )}
    </div>
  );
}
