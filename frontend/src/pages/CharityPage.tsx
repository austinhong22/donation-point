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
import {
  formatActorDisplayName,
  formatDateTime,
  formatPoints,
  formatProductDescription,
  formatProductName,
} from '../utils/format';

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
      const message = error instanceof Error ? error.message : '기부처 담당자 데이터를 불러오지 못했습니다.';
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
      const message = error instanceof Error ? error.message : '지정 상세를 불러오지 못했습니다.';
        setErrorMessage(message);
      } finally {
        setDetailLoading(false);
      }
    }

    void loadDetail();
  }, [currentActor?.role, selectedAllocationId]);

  if (actorLoading) {
    return <LoadingState title="기부처 담당자 화면 준비 중" message="선택한 역할 정보를 불러오고 있습니다." />;
  }

  if (!currentActor) {
    return <ErrorState title="선택된 역할이 없습니다" message="계속하려면 상단에서 데모 역할을 선택해 주세요." />;
  }

  if (currentActor.role !== 'CHARITY_MANAGER') {
    return (
      <ErrorState
        title="기부처 담당자 역할이 필요합니다"
        message="제휴 상품 주문을 만들려면 데모 기부처 담당자 역할로 전환해 주세요."
        actionLabel="현재 역할 화면으로 이동"
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
        <SectionHeader title="기부처 포인트 요약" description="기부처가 받은 지정 건을 확인하고, 제휴 상품 주문에 사용할 수 있습니다." />
        <div className="stat-grid">
          <div className="stat-card">
            <span>현재 역할</span>
            <strong>{formatActorDisplayName(currentActor.displayName)}</strong>
          </div>
          <div className="stat-card">
            <span>연결된 기부처</span>
            <strong>{currentActor.managedCharityId ? `#${currentActor.managedCharityId}` : '연결되지 않음'}</strong>
          </div>
          <div className="stat-card">
            <span>총 잔여 포인트</span>
            <strong>{formatPoints(totalRemainingPoints)}</strong>
          </div>
          <div className="stat-card">
            <span>받은 지정 건 수</span>
            <strong>{allocations.length}</strong>
          </div>
          <div className="stat-card">
            <span>처리 중 주문</span>
            <strong>{requestedOrders}</strong>
          </div>
          <div className="stat-card">
            <span>선택한 지정 건 잔여 포인트</span>
            <strong>{formatPoints(remainingBeforeOrder)}</strong>
          </div>
        </div>
      </SurfaceCard>

      {errorMessage ? <div className="page-banner page-banner-error">{errorMessage}</div> : null}

      <div className="two-column-grid">
        <SurfaceCard>
          <SectionHeader
            title="지정 건으로 주문 생성"
            description="한 주문은 하나의 지정 건만 사용합니다. 주문 전후 잔여 포인트를 바로 확인할 수 있습니다."
          />

          {isLoading ? (
            <LoadingState title="입력값 불러오는 중" message="지정 건과 제휴 상품 정보를 가져오고 있습니다." />
          ) : (
            <form
              className="form-stack"
              onSubmit={async (event) => {
                event.preventDefault();

                if (!selectedAllocationId || !selectedProductId) {
                  setErrorMessage('지정 건과 제휴 상품을 모두 선택해 주세요.');
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
                  const message = error instanceof Error ? error.message : '기부처 주문을 생성하지 못했습니다.';
                  setErrorMessage(message);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <Field label="후원 지정 건" hint="현재 기부처가 받은 지정 건만 선택할 수 있습니다.">
                <select
                  value={selectedAllocationId ?? ''}
                  onChange={(event) => setSelectedAllocationId(Number(event.target.value))}
                >
                  {allocations.map((allocation) => (
                    <option key={allocation.allocationId} value={allocation.allocationId}>
                      #{allocation.allocationId} · {formatActorDisplayName(allocation.donorName)} · 잔여 {formatPoints(allocation.remainingPoints)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="제휴 상품" hint="주문 총 포인트 = 상품 단가 포인트 × 수량입니다.">
                <select
                  value={selectedProductId ?? ''}
                  onChange={(event) => setSelectedProductId(Number(event.target.value))}
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {formatProductName(product.name)} · {formatPoints(product.pointCost)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="수량">
                <input
                  min={1}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  type="number"
                  value={quantity}
                />
              </Field>

              <div className="detail-summary-grid">
                <div className="detail-summary-item">
                  <span>이 주문의 사용 지정 건</span>
                  <strong>{selectedAllocation ? `#${selectedAllocation.allocationId}` : '지정 건을 선택해 주세요'}</strong>
                </div>
                <div className="detail-summary-item">
                  <span>주문 전 잔여 포인트</span>
                  <strong>{formatPoints(remainingBeforeOrder)}</strong>
                </div>
                <div className="detail-summary-item">
                  <span>예상 주문 사용 포인트</span>
                  <strong>{formatPoints(orderPreviewPoints)}</strong>
                </div>
                <div className="detail-summary-item">
                  <span>주문 후 예상 잔여 포인트</span>
                  <strong>{remainingAfterOrder >= 0 ? formatPoints(remainingAfterOrder) : '포인트 부족'}</strong>
                </div>
                <div className="detail-summary-item">
                  <span>이 지정 건으로 생성된 주문 수</span>
                  <strong>{selectedAllocationOrderCount}</strong>
                </div>
              </div>

              <button className="primary-button" disabled={orderDisabled} type="submit">
                {submitting ? '주문 생성 중...' : '주문 생성'}
              </button>
            </form>
          )}
        </SurfaceCard>

        <SurfaceCard>
          <SectionHeader title="제휴 상품 목록" description="받은 포인트 지정 건으로 주문할 수 있는 시드 상품 목록입니다." />
          {isLoading ? (
            <LoadingState title="상품 목록 불러오는 중" message="제휴 상품 정보를 가져오고 있습니다." />
          ) : (
            <div className="catalog-list">
              {products.map((product) => (
                <article className="catalog-item" key={product.id}>
                  <div>
                    <strong>{formatProductName(product.name)}</strong>
                    <p>{formatProductDescription(product.description)}</p>
                  </div>
                  <span>{formatPoints(product.pointCost)}</span>
                </article>
              ))}
            </div>
          )}
        </SurfaceCard>
      </div>

      <SurfaceCard>
        <SectionHeader title="받은 지정 건 목록" description="후원자가 지정한 내역과 잔여 포인트를 보고, 아래에서 전체 흐름을 열 수 있습니다." />
        {isLoading ? (
          <LoadingState title="지정 건 목록 불러오는 중" message="현재 기부처가 받은 지정 건을 가져오고 있습니다." />
        ) : (
          <DataTable
            columns={[
              {
                key: 'allocation',
                header: '지정 건',
                render: (allocation) => `#${allocation.allocationId}`,
              },
              {
                key: 'donorName',
                header: '후원자',
                render: (allocation) => formatActorDisplayName(allocation.donorName),
              },
              {
                key: 'allocatedPoints',
                header: '지정 포인트',
                render: (allocation) => formatPoints(allocation.allocatedPoints),
              },
              {
                key: 'remainingPoints',
                header: '잔여 포인트',
                render: (allocation) => formatPoints(allocation.remainingPoints),
              },
              {
                key: 'fundedOrders',
                header: '연결된 주문 수',
                render: (allocation) => orders.filter((order) => order.allocationId === allocation.allocationId).length,
              },
              {
                key: 'status',
                header: '상태',
                render: (allocation) => <StatusBadge status={allocation.status} />,
              },
              {
                key: 'action',
                header: '동작',
                render: (allocation) => (
                  <button
                    className="secondary-button"
                    onClick={() => setSelectedAllocationId(allocation.allocationId)}
                    type="button"
                  >
                    흐름 보기
                  </button>
                ),
              },
            ]}
            rows={allocations}
            rowKey={(allocation) => allocation.allocationId}
            emptyTitle="표시할 지정 건이 없습니다"
            emptyMessage="이 역할에 연결된 지정 건이 아직 없습니다."
          />
        )}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader title="기부처 주문 이력" description="어떤 지정 건이 어떤 주문을 만들었는지와 주문 사용 포인트를 확인할 수 있습니다." />
        {isLoading ? (
          <LoadingState title="주문 이력 불러오는 중" message="기부처 주문 이력을 가져오고 있습니다." />
        ) : (
          <DataTable
            columns={[
              {
                key: 'allocation',
                header: '사용 지정 건',
                render: (order) => `#${order.allocationId}`,
              },
              {
                key: 'product',
                header: '상품',
                render: (order) => formatProductName(order.partnerProductName),
              },
              {
                key: 'quantity',
                header: '수량',
                render: (order) => order.quantity,
              },
              {
                key: 'points',
                header: '사용 포인트',
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
                key: 'action',
                header: '동작',
                render: (order) => (
                  <button
                    className="secondary-button"
                    onClick={() => setSelectedAllocationId(order.allocationId)}
                    type="button"
                  >
                    지정 건 열기
                  </button>
                ),
              },
            ]}
            rows={orders}
            rowKey={(order) => order.orderId}
            emptyTitle="아직 주문이 없습니다"
            emptyMessage="받은 allocation으로 첫 번째 제휴 상품 주문을 만들어 보세요."
          />
        )}
      </SurfaceCard>

      {detailLoading ? (
        <LoadingState title="전체 흐름 불러오는 중" message="후원자, 기부처, 주문, 감사 이력을 가져오고 있습니다." />
      ) : detail ? (
        <AllocationTraceCard detail={detail} />
      ) : (
        <SurfaceCard>
          <SectionHeader title="지정 상세" description="위에서 지정 건을 선택하면 공통 타임라인과 주문 흐름을 확인할 수 있습니다." />
        </SurfaceCard>
      )}
    </div>
  );
}
