import type { AllocationDetail } from '../../api/types';
import { formatDateTime, formatPoints } from '../../utils/format';
import { DataTable } from '../ui/DataTable';
import { EmptyState } from '../ui/EmptyState';
import { SectionHeader } from '../ui/SectionHeader';
import { StatusBadge } from '../ui/StatusBadge';
import { SurfaceCard } from '../ui/SurfaceCard';

interface AllocationTraceCardProps {
  detail: AllocationDetail;
}

export function AllocationTraceCard({ detail }: AllocationTraceCardProps) {
  return (
    <SurfaceCard>
      <SectionHeader
        title="Allocation detail"
        description="Track the donor allocation through partner order usage and audit events."
      />

      <div className="detail-summary-grid">
        <div className="detail-summary-item">
          <span>Donor</span>
          <strong>{detail.donorName}</strong>
        </div>
        <div className="detail-summary-item">
          <span>Charity</span>
          <strong>{detail.charityName}</strong>
        </div>
        <div className="detail-summary-item">
          <span>Converted points</span>
          <strong>{formatPoints(detail.convertedPoints)}</strong>
        </div>
        <div className="detail-summary-item">
          <span>Allocated points</span>
          <strong>{formatPoints(detail.allocatedPoints)}</strong>
        </div>
        <div className="detail-summary-item">
          <span>Remaining points</span>
          <strong>{formatPoints(detail.remainingPoints)}</strong>
        </div>
        <div className="detail-summary-item">
          <span>Status</span>
          <strong>
            <StatusBadge status={detail.status} />
          </strong>
        </div>
      </div>

      <div className="detail-section">
        <SectionHeader title="Related partner orders" description="Each order consumes points from this allocation only." compact />
        {detail.relatedPartnerOrders.length === 0 ? (
          <EmptyState title="No partner orders yet" message="This allocation has not been spent on a partner product yet." />
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
                header: 'Quantity',
                render: (order) => order.quantity,
              },
              {
                key: 'total',
                header: 'Total points',
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
            rows={detail.relatedPartnerOrders}
            rowKey={(order) => order.orderId}
          />
        )}
      </div>

      <div className="detail-section">
        <SectionHeader title="Audit timeline" description="Chronological view of actor actions recorded for this allocation." compact />
        {detail.auditEvents.length === 0 ? (
          <EmptyState title="No audit events" message="The backend has not recorded any events for this allocation." />
        ) : (
          <div className="timeline-list">
            {detail.auditEvents.map((event) => (
              <article className="timeline-entry" key={`${event.createdAt}-${event.action}-${event.targetId}`}>
                <div className="timeline-entry-meta">
                  <StatusBadge status={event.targetType} tone="neutral" />
                  <span>{formatDateTime(event.createdAt)}</span>
                </div>
                <strong>{event.action}</strong>
                <p>
                  {event.actorDisplayName ? `${event.actorDisplayName} performed this action.` : 'System recorded this action.'}
                </p>
                <p className="timeline-entry-note">
                  Target #{event.targetId}
                  {event.eventData ? ` • ${event.eventData}` : ''}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </SurfaceCard>
  );
}
