package com.fairdonationpointpoc.allocation;

import com.fairdonationpointpoc.common.exception.ResourceNotFoundException;
import com.fairdonationpointpoc.domain.repository.AuditEventRepository;
import com.fairdonationpointpoc.domain.repository.DonationAllocationRepository;
import com.fairdonationpointpoc.domain.repository.PartnerOrderRepository;
import com.fairdonationpointpoc.domain.repository.PointConversionRepository;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AllocationDetailService {

    private final DonationAllocationRepository donationAllocationRepository;
    private final PartnerOrderRepository partnerOrderRepository;
    private final AuditEventRepository auditEventRepository;
    private final PointConversionRepository pointConversionRepository;

    public AllocationDetailService(
        DonationAllocationRepository donationAllocationRepository,
        PartnerOrderRepository partnerOrderRepository,
        AuditEventRepository auditEventRepository,
        PointConversionRepository pointConversionRepository
    ) {
        this.donationAllocationRepository = donationAllocationRepository;
        this.partnerOrderRepository = partnerOrderRepository;
        this.auditEventRepository = auditEventRepository;
        this.pointConversionRepository = pointConversionRepository;
    }

    @Transactional(readOnly = true)
    public AllocationDetailResponse getDetail(Long allocationId) {
        var allocation = donationAllocationRepository.findWithDetailById(allocationId)
            .orElseThrow(() -> new ResourceNotFoundException("Allocation not found."));

        List<AllocationOrderTraceResponse> relatedOrders = partnerOrderRepository
            .findAllByDonationAllocationIdOrderByCreatedAtAsc(allocationId).stream()
            .map(order -> new AllocationOrderTraceResponse(
                order.getId(),
                order.getPartnerProduct().getId(),
                order.getPartnerProduct().getName(),
                order.getQuantity(),
                order.getTotalPoints(),
                order.getStatus().name(),
                order.getCreatedAt(),
                order.getFulfilledAt()
            ))
            .toList();

        Set<Long> partnerOrderIds = relatedOrders.stream()
            .map(AllocationOrderTraceResponse::orderId)
            .collect(Collectors.toSet());

        List<AllocationAuditEventResponse> auditEvents = auditEventRepository.findAllByOrderByCreatedAtAsc().stream()
            .filter(event ->
                ("DONATION_ALLOCATION".equals(event.getTargetType()) && allocationId.equals(event.getTargetId()))
                    || ("PAYMENT".equals(event.getTargetType()) && allocation.getDonor().getId().equals(event.getActorUser() == null ? null : event.getActorUser().getId()))
                    || ("PARTNER_ORDER".equals(event.getTargetType()) && partnerOrderIds.contains(event.getTargetId()))
            )
            .map(event -> new AllocationAuditEventResponse(
                event.getCreatedAt(),
                event.getAction(),
                event.getTargetType(),
                event.getTargetId(),
                event.getActorUser() == null ? null : event.getActorUser().getId(),
                event.getActorUser() == null ? null : event.getActorUser().getDisplayName(),
                event.getEventData()
            ))
            .toList();

        long convertedPoints = pointConversionRepository.sumConvertedPointsByPointAccountId(
            allocation.getDonorPointAccount().getId()
        );

        return new AllocationDetailResponse(
            allocation.getId(),
            allocation.getDonor().getId(),
            allocation.getDonor().getDisplayName(),
            allocation.getCharity().getId(),
            allocation.getCharity().getName(),
            convertedPoints,
            allocation.getAllocatedPoints(),
            allocation.getRemainingPoints(),
            allocation.getStatus().name(),
            relatedOrders,
            auditEvents
        );
    }
}
