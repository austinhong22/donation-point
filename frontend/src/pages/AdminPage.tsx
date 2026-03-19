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
import {
  formatActorDisplayName,
  formatCharityName,
  formatDateTime,
  formatPoints,
  formatProductName,
} from '../utils/format';
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
      const message = error instanceof Error ? error.message : '운영자 데이터를 불러오지 못했습니다.';
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
        const message = error instanceof Error ? error.message : '지정 상세를 불러오지 못했습니다.';
        setErrorMessage(message);
      } finally {
        setDetailLoading(false);
      }
    }

    void loadDetail();
  }, [currentActor?.role, selectedOrder?.allocationId, selectedOrder?.orderId]);

  if (actorLoading) {
    return <LoadingState title="운영자 화면 준비 중" message="선택한 역할 정보를 불러오고 있습니다." />;
  }

  if (!currentActor) {
    return <ErrorState title="선택된 역할이 없습니다" message="계속하려면 상단에서 데모 역할을 선택해 주세요." />;
  }

  if (currentActor.role !== 'ADMIN') {
    return (
      <ErrorState
        title="운영자 역할이 필요합니다"
        message="주문을 확인하고 완료 처리하려면 데모 운영자 역할로 전환해 주세요."
        actionLabel="현재 역할 화면으로 이동"
        onAction={() => navigate(roleToRoute(currentActor.role))}
      />
    );
  }

  return (
    <div className="page-stack">
      <SurfaceCard>
        <SectionHeader title="운영 대시보드" description="주문 대기 현황, 활성 지정 건, 완료 진행 상황을 한눈에 확인합니다." />
        {isLoading ? (
          <LoadingState title="대시보드 불러오는 중" message="운영 지표와 주문 대기열을 가져오고 있습니다." />
        ) : dashboard ? (
          <div className="stat-grid">
            <div className="stat-card">
              <span>주문 요청 수</span>
              <strong>{dashboard.requestedOrders}</strong>
            </div>
            <div className="stat-card">
              <span>완료된 주문 수</span>
              <strong>{dashboard.fulfilledOrders}</strong>
            </div>
            <div className="stat-card">
              <span>활성 지정 건 수</span>
              <strong>{dashboard.activeAllocations}</strong>
            </div>
            <div className="stat-card">
              <span>총 요청 포인트</span>
              <strong>{formatPoints(dashboard.totalRequestedPoints)}</strong>
            </div>
            <div className="stat-card">
              <span>총 완료 포인트</span>
              <strong>{formatPoints(dashboard.totalFulfilledPoints)}</strong>
            </div>
          </div>
        ) : null}
      </SurfaceCard>

      {errorMessage ? <div className="page-banner page-banner-error">{errorMessage}</div> : null}

      <SurfaceCard>
        <SectionHeader title="주문 목록" description="모든 주문과 해당 주문을 만든 지정 건을 확인하고, 완료 처리할 수 있습니다." />
        {isLoading ? (
          <LoadingState title="주문 목록 불러오는 중" message="운영자 주문 대기열을 준비하고 있습니다." />
        ) : (
          <DataTable
            columns={[
              {
                key: 'order',
                header: '주문',
                render: (order) => `#${order.orderId}`,
              },
              {
                key: 'allocation',
                header: '사용 지정 건',
                render: (order) => `#${order.allocationId}`,
              },
              {
                key: 'charity',
                header: '기부처',
                render: (order) => (
                  <div>
                    <strong>{formatCharityName(order.charityName)}</strong>
                    <div className="cell-subtle">{formatActorDisplayName(order.charityManagerName)}</div>
                  </div>
                ),
              },
              {
                key: 'product',
                header: '상품',
                render: (order) => formatProductName(order.partnerProductName),
              },
              {
                key: 'totalPoints',
                header: '포인트',
                render: (order) => formatPoints(order.totalPoints),
              },
              {
                key: 'status',
                header: '상태',
                render: (order) => <StatusBadge status={order.status} />,
              },
              {
                key: 'createdAt',
                header: '주문 요청 시각',
                render: (order) => formatDateTime(order.createdAt),
              },
              {
                key: 'actions',
                header: '동작',
                render: (order) => (
                  <div className="inline-actions">
                    <button
                      className="secondary-button"
                      onClick={() => setSelectedOrderId(order.orderId)}
                      type="button"
                    >
                      상세 보기
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
                          const message = error instanceof Error ? error.message : '주문을 완료 처리하지 못했습니다.';
                          setErrorMessage(message);
                        } finally {
                          setSubmittingOrderId(null);
                        }
                      }}
                      type="button"
                    >
                      {order.status === 'FULFILLED' ? '완료됨' : '완료 처리'}
                    </button>
                  </div>
                ),
              },
            ]}
            rows={orders}
            rowKey={(order) => order.orderId}
            emptyTitle="표시할 주문이 없습니다"
            emptyMessage="현재 시드 데이터 기준으로 처리할 주문이 없습니다."
          />
        )}
      </SurfaceCard>

      {selectedOrder ? (
        <SurfaceCard>
          <SectionHeader title="주문 상세" description="주문 정보와 이 주문을 만든 후원 지정 건 타임라인을 함께 확인합니다." />
          <div className="detail-summary-grid">
            <div className="detail-summary-item">
              <span>주문 번호</span>
              <strong>#{selectedOrder.orderId}</strong>
            </div>
            <div className="detail-summary-item">
              <span>사용 지정 건</span>
              <strong>#{selectedOrder.allocationId}</strong>
            </div>
            <div className="detail-summary-item">
              <span>기부처</span>
              <strong>{formatCharityName(selectedOrder.charityName)}</strong>
            </div>
            <div className="detail-summary-item">
              <span>담당자</span>
              <strong>{formatActorDisplayName(selectedOrder.charityManagerName)}</strong>
            </div>
            <div className="detail-summary-item">
              <span>주문 상품</span>
              <strong>{formatProductName(selectedOrder.partnerProductName)}</strong>
            </div>
            <div className="detail-summary-item">
              <span>주문 합계</span>
              <strong>{formatPoints(selectedOrder.totalPoints)}</strong>
            </div>
            <div className="detail-summary-item">
              <span>상태</span>
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
                  const message = error instanceof Error ? error.message : '주문을 완료 처리하지 못했습니다.';
                  setErrorMessage(message);
                } finally {
                  setSubmittingOrderId(null);
                }
              }}
              type="button"
            >
              {selectedOrder.status === 'FULFILLED' ? '완료 처리됨' : '주문 완료 처리'}
            </button>
          </div>
        </SurfaceCard>
      ) : null}

      {detailLoading ? (
        <LoadingState title="전체 흐름 불러오는 중" message="선택한 주문의 전체 흐름을 가져오고 있습니다." />
      ) : detail ? (
        <AllocationTraceCard detail={detail} />
      ) : (
        <SurfaceCard>
          <SectionHeader title="지정 상세 타임라인" description="위에서 주문을 선택하면 공통 지정 흐름과 감사 이력을 확인할 수 있습니다." />
        </SurfaceCard>
      )}
    </div>
  );
}
