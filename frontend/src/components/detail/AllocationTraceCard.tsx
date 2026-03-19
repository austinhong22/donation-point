import type { AllocationDetail } from '../../api/types';
import {
  formatActorDisplayName,
  formatAuditAction,
  formatAuditEventData,
  formatAuditTargetType,
  formatCharityName,
  formatDateTime,
  formatPoints,
  formatProductName,
} from '../../utils/format';
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
        title="지정 상세"
        description="후원자의 포인트 지정이 제휴 주문과 감사 이력으로 어떻게 이어졌는지 한눈에 확인합니다."
      />

      <div className="detail-summary-grid">
        <div className="detail-summary-item">
          <span>후원자</span>
          <strong>{formatActorDisplayName(detail.donorName)}</strong>
        </div>
        <div className="detail-summary-item">
          <span>기부처</span>
          <strong>{formatCharityName(detail.charityName)}</strong>
        </div>
        <div className="detail-summary-item">
          <span>전환 포인트</span>
          <strong>{formatPoints(detail.convertedPoints)}</strong>
        </div>
        <div className="detail-summary-item">
          <span>지정 포인트</span>
          <strong>{formatPoints(detail.allocatedPoints)}</strong>
        </div>
        <div className="detail-summary-item">
          <span>잔여 포인트</span>
          <strong>{formatPoints(detail.remainingPoints)}</strong>
        </div>
        <div className="detail-summary-item">
          <span>상태</span>
          <strong>
            <StatusBadge status={detail.status} />
          </strong>
        </div>
      </div>

      <div className="detail-section">
        <SectionHeader title="연결된 제휴 주문" description="각 주문은 이 지정 건 하나의 포인트만 사용합니다." compact />
        {detail.relatedPartnerOrders.length === 0 ? (
          <EmptyState title="아직 생성된 제휴 주문이 없습니다" message="이 지정 건은 아직 제휴 상품 주문에 사용되지 않았습니다." />
        ) : (
          <DataTable
            columns={[
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
                key: 'total',
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
            ]}
            rows={detail.relatedPartnerOrders}
            rowKey={(order) => order.orderId}
          />
        )}
      </div>

      <div className="detail-section">
        <SectionHeader title="감사 타임라인" description="이 지정 건에 대해 기록된 작업 흐름을 시간순으로 보여줍니다." compact />
        {detail.auditEvents.length === 0 ? (
          <EmptyState title="감사 이벤트가 없습니다" message="이 지정 건에 대해 기록된 이벤트가 아직 없습니다." />
        ) : (
          <div className="timeline-list">
            {detail.auditEvents.map((event) => (
              <article className="timeline-entry" key={`${event.createdAt}-${event.action}-${event.targetId}`}>
                <div className="timeline-entry-meta">
                  <StatusBadge status={event.targetType} tone="neutral" />
                  <span>{formatDateTime(event.createdAt)}</span>
                </div>
                <strong>{formatAuditAction(event.action)}</strong>
                <p>
                  {event.actorDisplayName
                    ? `${formatActorDisplayName(event.actorDisplayName)} 님이 이 작업을 수행했습니다.`
                    : '시스템이 이 작업을 기록했습니다.'}
                </p>
                <p className="timeline-entry-note">
                  {formatAuditTargetType(event.targetType)} #{event.targetId}
                  {formatAuditEventData(event.eventData) ? ` • ${formatAuditEventData(event.eventData)}` : ''}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </SurfaceCard>
  );
}
