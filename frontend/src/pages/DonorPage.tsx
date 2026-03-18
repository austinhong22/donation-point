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
import { formatDateTime, formatPoints } from '../utils/format';

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
      const message = error instanceof Error ? error.message : 'Could not load donor data.';
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
    return <LoadingState title="Preparing donor page" message="Loading actor context." />;
  }

  if (!currentActor) {
    return <ErrorState title="No actor selected" message="Choose a seeded actor to continue." />;
  }

  if (currentActor.role !== 'DONOR') {
    return (
      <ErrorState
        title="Donor actor required"
        message="Switch to the seeded donor actor to create payments and allocations."
        actionLabel="Go to current actor route"
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
        <SectionHeader title="Donor dashboard" description="Create mock payments, convert them into points, allocate them to a charity, and inspect your history." />
        <div className="stat-grid">
          <div className="stat-card">
            <span>Actor</span>
            <strong>{currentActor.displayName}</strong>
          </div>
          <div className="stat-card">
            <span>Current point balance</span>
            <strong>{formatPoints(availableBalance)}</strong>
          </div>
          <div className="stat-card">
            <span>Total converted points</span>
            <strong>{formatPoints(dashboard?.totalConvertedPoints ?? 0)}</strong>
          </div>
          <div className="stat-card">
            <span>Total allocated points</span>
            <strong>{formatPoints(dashboard?.totalAllocatedPoints ?? 0)}</strong>
          </div>
          <div className="stat-card">
            <span>Pending payments</span>
            <strong>{dashboard?.pendingPayments ?? 0}</strong>
          </div>
        </div>
      </SurfaceCard>

      {errorMessage ? <div className="page-banner page-banner-error">{errorMessage}</div> : null}

      <div className="two-column-grid">
        <SurfaceCard>
          <SectionHeader title="Mock payment form" description="Create a local-only payment record that can be converted into donation points." />
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
                const message = error instanceof Error ? error.message : 'Could not create the mock payment.';
                setErrorMessage(message);
              } finally {
                setSubmittingPayment(false);
              }
            }}
          >
            <Field label="Mock payment amount (KRW)" hint="In this PoC, 1 KRW converts to 1 donation point.">
              <input
                min={1}
                onChange={(event) => setPaymentAmountKrw(Number(event.target.value))}
                type="number"
                value={paymentAmountKrw}
              />
            </Field>
            <div className="form-preview">
              <span>Projected point credit</span>
              <strong>{formatPoints(paymentAmountKrw)}</strong>
            </div>
            <button className="primary-button" disabled={paymentFormDisabled} type="submit">
              {submittingPayment ? 'Creating payment...' : 'Create mock payment'}
            </button>
          </form>
        </SurfaceCard>

        <SurfaceCard>
          <SectionHeader title="Charity allocation form" description="Allocate available points to a selected charity. Invalid amounts are blocked before submit." />
          <form
            className="form-stack"
            onSubmit={async (event) => {
              event.preventDefault();

              if (!selectedCharityId) {
                setErrorMessage('Choose a charity before creating an allocation.');
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
                const message = error instanceof Error ? error.message : 'Could not create the allocation.';
                setErrorMessage(message);
              } finally {
                setSubmittingAllocation(false);
              }
            }}
          >
            <Field label="Charity" hint="Choose where the donor points should be allocated.">
              <select
                value={selectedCharityId ?? ''}
                onChange={(event) => setSelectedCharityId(Number(event.target.value))}
              >
                {charities.map((charity) => (
                  <option key={charity.id} value={charity.id}>
                    {charity.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Allocation points" hint={`Available balance: ${formatPoints(availableBalance)}`}>
              <input
                max={availableBalance}
                min={1}
                onChange={(event) => setAllocationPoints(Number(event.target.value))}
                type="number"
                value={allocationPoints}
              />
            </Field>
            <div className="form-preview">
              <span>Selected charity</span>
              <strong>{selectedCharity?.name ?? 'Choose a charity'}</strong>
            </div>
            <button className="primary-button" disabled={allocationFormDisabled} type="submit">
              {submittingAllocation ? 'Creating allocation...' : 'Allocate points'}
            </button>
          </form>
        </SurfaceCard>
      </div>

      <SurfaceCard>
        <SectionHeader title="Payment list" description="Payments start as RECEIVED and can be converted once into donation points." />
        {isLoading ? (
          <LoadingState title="Loading payments" message="Fetching your donor payment history." />
        ) : (
          <DataTable
            columns={[
              {
                key: 'paymentRef',
                header: 'Payment ref',
                render: (payment) => payment.externalPaymentRef,
              },
              {
                key: 'amountKrw',
                header: 'Amount',
                render: (payment) => `${payment.amountKrw.toLocaleString()} KRW`,
              },
              {
                key: 'status',
                header: 'Status',
                render: (payment) => <StatusBadge status={payment.status} />,
              },
              {
                key: 'convertedPoints',
                header: 'Converted points',
                render: (payment) => formatPoints(payment.convertedPoints ?? 0),
              },
              {
                key: 'createdAt',
                header: 'Created',
                render: (payment) => formatDateTime(payment.createdAt),
              },
              {
                key: 'action',
                header: 'Action',
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
                        const message = error instanceof Error ? error.message : 'Could not convert the payment.';
                        setErrorMessage(message);
                      } finally {
                        setConvertingPaymentId(null);
                      }
                    }}
                    type="button"
                  >
                    {payment.status === 'CONVERTED' ? 'Converted' : 'Convert'}
                  </button>
                ),
              },
            ]}
            rows={payments}
            rowKey={(payment) => payment.paymentId}
            emptyTitle="No payments yet"
            emptyMessage="Create a mock payment to start the donor flow."
          />
        )}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader title="Allocation history" description="Inspect charity allocations, remaining points, and open the end-to-end trace for each allocation." />
        {isLoading ? (
          <LoadingState title="Loading allocations" message="Fetching your donor allocation history." />
        ) : (
          <DataTable
            columns={[
              {
                key: 'charity',
                header: 'Charity',
                render: (allocation) => allocation.charityName,
              },
              {
                key: 'allocated',
                header: 'Allocated',
                render: (allocation) => formatPoints(allocation.allocatedPoints),
              },
              {
                key: 'remaining',
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
                    onClick={async () => {
                      setDetailLoading(true);

                      try {
                        const detail = await getAllocationDetail(allocation.allocationId);
                        setActiveDetail(detail);
                        setErrorMessage(null);
                      } catch (error) {
                        const message = error instanceof Error ? error.message : 'Could not load allocation detail.';
                        setErrorMessage(message);
                      } finally {
                        setDetailLoading(false);
                      }
                    }}
                    type="button"
                  >
                    View detail
                  </button>
                ),
              },
            ]}
            rows={allocations}
            rowKey={(allocation) => allocation.allocationId}
            emptyTitle="No allocations yet"
            emptyMessage="Convert some points and allocate them to a charity to populate this history."
          />
        )}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader title="Available charities" description="Reference list to help the donor choose an allocation target." />
        {isLoading ? (
          <LoadingState title="Loading charities" message="Fetching available charities." />
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

      {activeDetail ? (
        <div className="modal-backdrop" onClick={() => setActiveDetail(null)} role="presentation">
          <div
            aria-label="Allocation detail"
            aria-modal="true"
            className="modal-panel"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="modal-header">
              <div>
                <p className="shell-kicker">Allocation Trace</p>
                <h2>Allocation #{activeDetail.allocationId}</h2>
              </div>
              <button className="secondary-button" onClick={() => setActiveDetail(null)} type="button">
                Close
              </button>
            </div>
            {detailLoading ? (
              <LoadingState title="Loading detail" message="Fetching allocation trace." />
            ) : (
              <AllocationTraceCard detail={activeDetail} />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
