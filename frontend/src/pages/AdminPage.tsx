import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeAdminOrder, getAdminDashboard, getAdminOrders, getAllocationDetail } from '../api/client';
import type { AdminDashboard, AdminOrder, AllocationDetail } from '../api/types';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingState } from '../components/ui/LoadingState';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { AllocationTraceCard } from '../components/detail/AllocationTraceCard';
import { useActor } from '../contexts/ActorContext';
import { formatDateTime, formatPoints } from '../utils/format';
import { roleToRoute } from '../utils/actors';

export function AdminPage() {
  const navigate = useNavigate();
  const { currentActor, isLoading: actorLoading } = useActor();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedAllocationId, setSelectedAllocationId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AllocationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittingOrderId, setSubmittingOrderId] = useState<number | null>(null);

  async function loadAdminData() {
    setIsLoading(true);

    try {
      const [nextDashboard, nextOrders] = await Promise.all([getAdminDashboard(), getAdminOrders()]);

      setDashboard(nextDashboard);
      setOrders(nextOrders);
      setSelectedAllocationId((current) => current ?? nextOrders[0]?.allocationId ?? null);
      setErrorMessage(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load admin data.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (actorLoading || currentActor?.role !== 'ADMIN') {
      return;
    }

    void loadAdminData();
  }, [actorLoading, currentActor?.role]);

  useEffect(() => {
    if (!selectedAllocationId || currentActor?.role !== 'ADMIN') {
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
    return <LoadingState title="Preparing admin page" message="Loading actor context." />;
  }

  if (!currentActor) {
    return <ErrorState title="No actor selected" message="Choose a seeded actor to continue." />;
  }

  if (currentActor.role !== 'ADMIN') {
    return (
      <ErrorState
        title="Admin actor required"
        message="Switch to the seeded admin actor to inspect and complete partner orders."
        actionLabel="Go to current actor route"
        onAction={() => navigate(roleToRoute(currentActor.role))}
      />
    );
  }

  return (
    <div className="page-stack">
      <SurfaceCard>
        <SectionHeader title="Admin dashboard" description="Inspect request volume, active allocations, and completion progress." />

        {isLoading ? (
          <LoadingState title="Loading dashboard" message="Fetching seeded admin metrics and order queue." />
        ) : errorMessage ? (
          <ErrorState title="Dashboard unavailable" message={errorMessage} />
        ) : dashboard ? (
          <div className="stat-grid">
            <div className="stat-card">
              <span>Requested orders</span>
              <strong>{dashboard.requestedOrders}</strong>
            </div>
            <div className="stat-card">
              <span>Fulfilled orders</span>
              <strong>{dashboard.fulfilledOrders}</strong>
            </div>
            <div className="stat-card">
              <span>Active allocations</span>
              <strong>{dashboard.activeAllocations}</strong>
            </div>
            <div className="stat-card">
              <span>Total requested points</span>
              <strong>{formatPoints(dashboard.totalRequestedPoints)}</strong>
            </div>
            <div className="stat-card">
              <span>Total fulfilled points</span>
              <strong>{formatPoints(dashboard.totalFulfilledPoints)}</strong>
            </div>
          </div>
        ) : null}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader title="Partner order queue" description="Review order ownership, select an allocation trace, and complete fulfillment." />
        {isLoading ? (
          <LoadingState title="Loading orders" message="Preparing the admin queue." />
        ) : errorMessage ? (
          <ErrorState title="Orders unavailable" message={errorMessage} />
        ) : (
          <DataTable
            columns={[
              {
                key: 'charity',
                header: 'Charity',
                render: (order) => (
                  <div>
                    <strong>{order.charityName}</strong>
                    <div className="cell-subtle">{order.charityManagerName}</div>
                  </div>
                ),
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
                key: 'totalPoints',
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
                key: 'actions',
                header: 'Actions',
                render: (order) => (
                  <div className="inline-actions">
                    <button
                      className="secondary-button"
                      onClick={() => setSelectedAllocationId(order.allocationId)}
                      type="button"
                    >
                      Inspect
                    </button>
                    <button
                      className="primary-button"
                      disabled={order.status === 'FULFILLED' || submittingOrderId === order.orderId}
                      onClick={async () => {
                        setSubmittingOrderId(order.orderId);

                        try {
                          await completeAdminOrder(order.orderId);
                          await loadAdminData();
                          setSelectedAllocationId(order.allocationId);
                          setErrorMessage(null);
                        } catch (error) {
                          const message = error instanceof Error ? error.message : 'Could not complete the order.';
                          setErrorMessage(message);
                        } finally {
                          setSubmittingOrderId(null);
                        }
                      }}
                      type="button"
                    >
                      {order.status === 'FULFILLED' ? 'Completed' : 'Complete'}
                    </button>
                  </div>
                ),
              },
            ]}
            rows={orders}
            rowKey={(order) => order.orderId}
            emptyTitle="No admin orders"
            emptyMessage="The seeded queue is empty."
          />
        )}
      </SurfaceCard>

      {detailLoading ? (
        <LoadingState title="Loading allocation trace" message="Fetching the end-to-end story behind the selected order." />
      ) : detail ? (
        <AllocationTraceCard detail={detail} />
      ) : (
        <SurfaceCard>
          <SectionHeader title="Allocation detail" description="Select an order above to inspect its donor-to-fulfillment trace." />
        </SurfaceCard>
      )}
    </div>
  );
}
