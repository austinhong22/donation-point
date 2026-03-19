import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeAdminOrder, getAdminDashboard, getAdminOrders, getAllocationDetail } from '../api/client';
import type { AdminDashboard, AdminOrder, AllocationDetail } from '../api/types';
import { AllocationTraceCard } from '../components/detail/AllocationTraceCard';
import { DataTable } from '../components/ui/DataTable';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingState } from '../components/ui/LoadingState';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { useActor } from '../contexts/ActorContext';
import { formatDateTime, formatPoints } from '../utils/format';
import { roleToRoute } from '../utils/actors';

export function AdminPage() {
  const navigate = useNavigate();
  const { currentActor, isLoading: actorLoading } = useActor();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
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
      setSelectedOrderId((current) => current ?? nextOrders[0]?.orderId ?? null);
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

  const selectedOrder = orders.find((order) => order.orderId === selectedOrderId) ?? null;

  useEffect(() => {
    if (!selectedOrder || currentActor?.role !== 'ADMIN') {
      setDetail(null);
      return;
    }

    const allocationId = selectedOrder.allocationId;

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
  }, [currentActor?.role, selectedOrder?.allocationId, selectedOrder?.orderId]);

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
        <SectionHeader title="Dashboard summary cards" description="Inspect queue size, active allocations, and fulfillment progress for the demo." />
        {isLoading ? (
          <LoadingState title="Loading dashboard" message="Fetching admin metrics and order queue." />
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

      {errorMessage ? <div className="page-banner page-banner-error">{errorMessage}</div> : null}

      <SurfaceCard>
        <SectionHeader title="Orders table" description="See every order, which allocation funded it, and mark fulfillment complete." />
        {isLoading ? (
          <LoadingState title="Loading orders" message="Preparing the admin order queue." />
        ) : (
          <DataTable
            columns={[
              {
                key: 'order',
                header: 'Order',
                render: (order) => `#${order.orderId}`,
              },
              {
                key: 'allocation',
                header: 'Funding allocation',
                render: (order) => `#${order.allocationId}`,
              },
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
                      onClick={() => setSelectedOrderId(order.orderId)}
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
                          setSelectedOrderId(order.orderId);
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

      {selectedOrder ? (
        <SurfaceCard>
          <SectionHeader title="Order detail" description="Review order ownership and the donor allocation timeline that funded it." />
          <div className="detail-summary-grid">
            <div className="detail-summary-item">
              <span>Order</span>
              <strong>#{selectedOrder.orderId}</strong>
            </div>
            <div className="detail-summary-item">
              <span>Funding allocation</span>
              <strong>#{selectedOrder.allocationId}</strong>
            </div>
            <div className="detail-summary-item">
              <span>Charity</span>
              <strong>{selectedOrder.charityName}</strong>
            </div>
            <div className="detail-summary-item">
              <span>Manager</span>
              <strong>{selectedOrder.charityManagerName}</strong>
            </div>
            <div className="detail-summary-item">
              <span>Requested product</span>
              <strong>{selectedOrder.partnerProductName}</strong>
            </div>
            <div className="detail-summary-item">
              <span>Order total</span>
              <strong>{formatPoints(selectedOrder.totalPoints)}</strong>
            </div>
            <div className="detail-summary-item">
              <span>Status</span>
              <strong>
                <StatusBadge status={selectedOrder.status} />
              </strong>
            </div>
          </div>

          <div className="detail-section">
            <button
              className="primary-button"
              disabled={selectedOrder.status === 'FULFILLED' || submittingOrderId === selectedOrder.orderId}
              onClick={async () => {
                setSubmittingOrderId(selectedOrder.orderId);

                try {
                  await completeAdminOrder(selectedOrder.orderId);
                  await loadAdminData();
                  setSelectedOrderId(selectedOrder.orderId);
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
              {selectedOrder.status === 'FULFILLED' ? 'Fulfillment completed' : 'Mark fulfillment complete'}
            </button>
          </div>
        </SurfaceCard>
      ) : null}

      {detailLoading ? (
        <LoadingState title="Loading allocation trace" message="Fetching the end-to-end story behind the selected order." />
      ) : detail ? (
        <AllocationTraceCard detail={detail} />
      ) : (
        <SurfaceCard>
          <SectionHeader title="Allocation detail timeline" description="Select an order above to inspect the shared allocation trace and audit history." />
        </SurfaceCard>
      )}
    </div>
  );
}
