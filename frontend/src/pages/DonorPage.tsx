import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  convertDonorPayment,
  createDonationAllocation,
  createMockPayment,
  getAllocationDetail,
  getDonorDashboard,
  listCharities,
  listDonorAllocations,
  listDonorPayments,
} from '../api/client';
import type { AllocationDetail, Charity, DonorAllocation, DonorDashboard, DonorPayment } from '../api/types';
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
  formatCharityDescription,
  formatCharityName,
  formatDateTime,
  formatKrw,
  formatPoints,
} from '../utils/format';

export function DonorPage() {
  const navigate = useNavigate();
  const { currentActor, isLoading: actorLoading, refreshActors } = useActor();
  const [dashboard, setDashboard] = useState<DonorDashboard | null>(null);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [payments, setPayments] = useState<DonorPayment[]>([]);
  const [allocations, setAllocations] = useState<DonorAllocation[]>([]);
  const [selectedCharityId, setSelectedCharityId] = useState<number | null>(null);
  const [paymentAmountKrw, setPaymentAmountKrw] = useState(10000);
  const [allocationPoints, setAllocationPoints] = useState(10000);
  const [activeDetail, setActiveDetail] = useState<AllocationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [submittingAllocation, setSubmittingAllocation] = useState(false);
  const [convertingPaymentId, setConvertingPaymentId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadDonorData() {
    setIsLoading(true);

    try {
      const [nextDashboard, nextCharities, nextPayments, nextAllocations] = await Promise.all([
        getDonorDashboard(),
        listCharities(),
        listDonorPayments(),
        listDonorAllocations(),
      ]);

      setDashboard(nextDashboard);
      setCharities(nextCharities);
      setPayments(nextPayments);
      setAllocations(nextAllocations);
      setSelectedCharityId((current) => current ?? nextCharities[0]?.id ?? null);
      setErrorMessage(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : '후원자 데이터를 불러오지 못했습니다.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshDonorFlow() {
    await loadDonorData();
    await refreshActors();
  }

  useEffect(() => {
    if (actorLoading || currentActor?.role !== 'DONOR') {
      return;
    }

    void loadDonorData();
  }, [actorLoading, currentActor?.role]);

  if (actorLoading) {
    return <LoadingState title="후원자 화면 준비 중" message="선택한 역할 정보를 불러오고 있습니다." />;
  }

  if (!currentActor) {
    return <ErrorState title="선택된 역할이 없습니다" message="계속하려면 상단에서 데모 역할을 선택해 주세요." />;
  }

  if (currentActor.role !== 'DONOR') {
    return (
      <ErrorState
        title="후원자 역할이 필요합니다"
        message="결제 생성과 포인트 지정을 하려면 데모 후원자 역할로 전환해 주세요."
        actionLabel="현재 역할 화면으로 이동"
        onAction={() => navigate(roleToRoute(currentActor.role))}
      />
    );
  }

  const selectedCharity = charities.find((charity) => charity.id === selectedCharityId) ?? null;
  const paymentFormDisabled = submittingPayment || paymentAmountKrw < 1;
  const availableBalance = dashboard?.pointBalance ?? 0;
  const allocationFormDisabled =
    submittingAllocation ||
    !selectedCharityId ||
    allocationPoints < 1 ||
    allocationPoints > availableBalance;

  return (
    <div className="page-stack">
      <SurfaceCard>
        <SectionHeader
          title="후원자 대시보드"
          description="모의 결제를 만들고, 포인트로 전환한 뒤, 기부처에 지정하고, 전체 이력을 확인할 수 있습니다."
        />
        <div className="stat-grid">
          <div className="stat-card">
            <span>현재 역할</span>
            <strong>{formatActorDisplayName(currentActor.displayName)}</strong>
          </div>
          <div className="stat-card">
            <span>현재 보유 포인트</span>
            <strong>{formatPoints(availableBalance)}</strong>
          </div>
          <div className="stat-card">
            <span>누적 전환 포인트</span>
            <strong>{formatPoints(dashboard?.totalConvertedPoints ?? 0)}</strong>
          </div>
          <div className="stat-card">
            <span>누적 지정 포인트</span>
            <strong>{formatPoints(dashboard?.totalAllocatedPoints ?? 0)}</strong>
          </div>
          <div className="stat-card">
            <span>전환 대기 결제</span>
            <strong>{dashboard?.pendingPayments ?? 0}</strong>
          </div>
        </div>
      </SurfaceCard>

      {errorMessage ? <div className="page-banner page-banner-error">{errorMessage}</div> : null}

      <div className="two-column-grid">
        <SurfaceCard>
          <SectionHeader title="모의 결제 생성" description="로컬 데모용 결제를 만들고, 이후 기부 포인트로 전환할 수 있습니다." />
          <form
            className="form-stack"
            onSubmit={async (event) => {
              event.preventDefault();
              setSubmittingPayment(true);

              try {
                await createMockPayment({ amountKrw: paymentAmountKrw });
                await refreshDonorFlow();
                setErrorMessage(null);
              } catch (error) {
                const message = error instanceof Error ? error.message : '모의 결제를 생성하지 못했습니다.';
                setErrorMessage(message);
              } finally {
                setSubmittingPayment(false);
              }
            }}
          >
            <Field label="모의 결제 금액" hint="이 데모에서는 1원이 1포인트로 전환됩니다.">
              <input
                min={1}
                onChange={(event) => setPaymentAmountKrw(Number(event.target.value))}
                type="number"
                value={paymentAmountKrw}
              />
            </Field>
            <div className="form-preview">
              <span>예상 적립 포인트</span>
              <strong>{formatPoints(paymentAmountKrw)}</strong>
            </div>
            <button className="primary-button" disabled={paymentFormDisabled} type="submit">
              {submittingPayment ? '결제 생성 중...' : '모의 결제 생성'}
            </button>
          </form>
        </SurfaceCard>

        <SurfaceCard>
          <SectionHeader
            title="기부처 포인트 지정"
            description="보유 포인트를 원하는 기부처에 지정합니다. 잔액을 초과하는 입력은 제출 전에 막습니다."
          />
          <form
            className="form-stack"
            onSubmit={async (event) => {
              event.preventDefault();

              if (!selectedCharityId) {
                setErrorMessage('지정 건을 만들기 전에 기부처를 먼저 선택해 주세요.');
                return;
              }

              setSubmittingAllocation(true);

              try {
                await createDonationAllocation({
                  charityId: selectedCharityId,
                  points: allocationPoints,
                });
                await refreshDonorFlow();
                setErrorMessage(null);
              } catch (error) {
                const message = error instanceof Error ? error.message : '포인트 지정을 생성하지 못했습니다.';
                setErrorMessage(message);
              } finally {
                setSubmittingAllocation(false);
              }
            }}
          >
            <Field label="기부처" hint="후원 포인트를 지정할 대상을 선택해 주세요.">
              <select value={selectedCharityId ?? ''} onChange={(event) => setSelectedCharityId(Number(event.target.value))}>
                {charities.map((charity) => (
                  <option key={charity.id} value={charity.id}>
                    {formatCharityName(charity.name)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="지정 포인트" hint={`사용 가능한 잔액: ${formatPoints(availableBalance)}`}>
              <input
                max={availableBalance}
                min={1}
                onChange={(event) => setAllocationPoints(Number(event.target.value))}
                type="number"
                value={allocationPoints}
              />
            </Field>
            <div className="form-preview">
              <span>선택한 기부처</span>
              <strong>{selectedCharity ? formatCharityName(selectedCharity.name) : '기부처를 선택해 주세요'}</strong>
            </div>
            <button className="primary-button" disabled={allocationFormDisabled} type="submit">
              {submittingAllocation ? '지정 생성 중...' : '포인트 지정'}
            </button>
          </form>
        </SurfaceCard>
      </div>

      <SurfaceCard>
        <SectionHeader title="결제 목록" description="결제는 접수됨 상태로 시작하며, 한 번만 기부 포인트로 전환할 수 있습니다." />
        {isLoading ? (
          <LoadingState title="결제 내역 불러오는 중" message="후원자 결제 이력을 가져오고 있습니다." />
        ) : (
          <DataTable
            columns={[
              {
                key: 'paymentRef',
                header: '결제 번호',
                render: (payment) => payment.externalPaymentRef,
              },
              {
                key: 'amountKrw',
                header: '금액',
                render: (payment) => formatKrw(payment.amountKrw),
              },
              {
                key: 'status',
                header: '상태',
                render: (payment) => <StatusBadge status={payment.status} />,
              },
              {
                key: 'convertedPoints',
                header: '전환 포인트',
                render: (payment) => formatPoints(payment.convertedPoints ?? 0),
              },
              {
                key: 'createdAt',
                header: '생성 시각',
                render: (payment) => formatDateTime(payment.createdAt),
              },
              {
                key: 'action',
                header: '동작',
                render: (payment) => (
                  <button
                    className="secondary-button"
                    disabled={payment.status !== 'RECEIVED' || convertingPaymentId === payment.paymentId}
                    onClick={async () => {
                      setConvertingPaymentId(payment.paymentId);

                      try {
                        await convertDonorPayment(payment.paymentId);
                        await refreshDonorFlow();
                        setErrorMessage(null);
                      } catch (error) {
                        const message = error instanceof Error ? error.message : '결제를 포인트로 전환하지 못했습니다.';
                        setErrorMessage(message);
                      } finally {
                        setConvertingPaymentId(null);
                      }
                    }}
                    type="button"
                  >
                    {payment.status === 'CONVERTED' ? '전환 완료' : '포인트 전환'}
                  </button>
                ),
              },
            ]}
            rows={payments}
            rowKey={(payment) => payment.paymentId}
            emptyTitle="아직 결제가 없습니다"
            emptyMessage="모의 결제를 생성하면 후원자 흐름을 시작할 수 있습니다."
          />
        )}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader
          title="포인트 지정 이력"
          description="기부처별 지정 내역과 잔여 포인트를 확인하고, 각 지정 건의 전체 이력을 열어볼 수 있습니다."
        />
        {isLoading ? (
          <LoadingState title="지정 이력 불러오는 중" message="후원자의 포인트 지정 이력을 가져오고 있습니다." />
        ) : (
          <DataTable
            columns={[
              {
                key: 'charity',
                header: '기부처',
                render: (allocation) => formatCharityName(allocation.charityName),
              },
              {
                key: 'allocated',
                header: '지정 포인트',
                render: (allocation) => formatPoints(allocation.allocatedPoints),
              },
              {
                key: 'remaining',
                header: '잔여 포인트',
                render: (allocation) => formatPoints(allocation.remainingPoints),
              },
              {
                key: 'status',
                header: '상태',
                render: (allocation) => <StatusBadge status={allocation.status} />,
              },
              {
                key: 'createdAt',
                header: '생성 시각',
                render: (allocation) => formatDateTime(allocation.createdAt),
              },
              {
                key: 'action',
                header: '동작',
                render: (allocation) => (
                  <button
                    className="secondary-button"
                    onClick={async () => {
                      setDetailLoading(true);

                      try {
                        const detail = await getAllocationDetail(allocation.allocationId);
                        setActiveDetail(detail);
                        setErrorMessage(null);
                      } catch (error) {
                        const message = error instanceof Error ? error.message : '지정 상세를 불러오지 못했습니다.';
                        setErrorMessage(message);
                      } finally {
                        setDetailLoading(false);
                      }
                    }}
                    type="button"
                  >
                    상세 보기
                  </button>
                ),
              },
            ]}
            rows={allocations}
            rowKey={(allocation) => allocation.allocationId}
            emptyTitle="아직 포인트 지정이 없습니다"
            emptyMessage="포인트를 전환한 뒤 기부처에 지정하면 이력이 표시됩니다."
          />
        )}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader title="기부처 목록" description="후원자가 포인트 지정 대상을 고를 때 참고할 수 있는 기부처 목록입니다." />
        {isLoading ? (
          <LoadingState title="기부처 목록 불러오는 중" message="선택 가능한 기부처 정보를 가져오고 있습니다." />
        ) : (
          <div className="catalog-list">
            {charities.map((charity) => (
              <article className="catalog-item" key={charity.id}>
                <div>
                  <strong>{formatCharityName(charity.name)}</strong>
                  <p>{formatCharityDescription(charity.description)}</p>
                </div>
                <span>{formatPoints(charity.pointBalance)}</span>
              </article>
            ))}
          </div>
        )}
      </SurfaceCard>

      {activeDetail ? (
        <div className="modal-backdrop" onClick={() => setActiveDetail(null)} role="presentation">
          <div
            aria-label="지정 상세"
            aria-modal="true"
            className="modal-panel"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="modal-header">
              <div>
                <p className="shell-kicker">지정 흐름</p>
                <h2>지정 건 #{activeDetail.allocationId}</h2>
              </div>
              <button className="secondary-button" onClick={() => setActiveDetail(null)} type="button">
                닫기
              </button>
            </div>
            {detailLoading ? (
              <LoadingState title="상세 불러오는 중" message="지정 흐름 정보를 가져오고 있습니다." />
            ) : (
              <AllocationTraceCard detail={activeDetail} />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
