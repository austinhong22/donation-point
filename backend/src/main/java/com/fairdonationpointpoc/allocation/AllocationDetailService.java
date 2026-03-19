package com.fairdonationpointpoc.allocation;

import com.fairdonationpointpoc.actor.ActorContextHolder;
import com.fairdonationpointpoc.common.exception.AccessDeniedException;
import com.fairdonationpointpoc.common.exception.AuthenticationRequiredException;
import com.fairdonationpointpoc.common.exception.ResourceNotFoundException;
import com.fairdonationpointpoc.common.model.Role;
import com.fairdonationpointpoc.domain.repository.AuditEventRepository;
import com.fairdonationpointpoc.domain.repository.DonationAllocationRepository;
import com.fairdonationpointpoc.domain.repository.PartnerOrderRepository;
import com.fairdonationpointpoc.domain.repository.PointConversionRepository;
import com.fairdonationpointpoc.domain.repository.UserRepository;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AllocationDetailService {

    private final ActorContextHolder actorContextHolder;
    private final UserRepository userRepository;
    private final DonationAllocationRepository donationAllocationRepository;
    private final PartnerOrderRepository partnerOrderRepository;
    private final AuditEventRepository auditEventRepository;
    private final PointConversionRepository pointConversionRepository;

    public AllocationDetailService(
        ActorContextHolder actorContextHolder,
        UserRepository userRepository,
        DonationAllocationRepository donationAllocationRepository,
        PartnerOrderRepository partnerOrderRepository,
        AuditEventRepository auditEventRepository,
        PointConversionRepository pointConversionRepository
    ) {
        this.actorContextHolder = actorContextHolder;
        this.userRepository = userRepository;
        this.donationAllocationRepository = donationAllocationRepository;
        this.partnerOrderRepository = partnerOrderRepository;
        this.auditEventRepository = auditEventRepository;
        this.pointConversionRepository = pointConversionRepository;
    }

    @Transactional(readOnly = true)
    public AllocationDetailResponse getDetail(Long allocationId) {
        var allocation = donationAllocationRepository.findWithDetailById(allocationId)
            .orElseThrow(() -> new ResourceNotFoundException("Allocation not found."));
        assertAccess(allocation);

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

        var allAuditEvents = auditEventRepository.findAllByOrderByCreatedAtAsc();

        Map<String, com.fairdonationpointpoc.domain.model.AuditEvent> latestFundingEvents = allAuditEvents.stream()
            .filter(event -> event.getActorUser() != null)
            .filter(event -> allocation.getDonor().getId().equals(event.getActorUser().getId()))
            .filter(event -> event.getCreatedAt().isBefore(allocation.getCreatedAt()) || event.getCreatedAt().isEqual(allocation.getCreatedAt()))
            .filter(event -> "PAYMENT".equals(event.getTargetType()) || "POINT_CONVERSION".equals(event.getTargetType()))
            .collect(Collectors.toMap(
                com.fairdonationpointpoc.domain.model.AuditEvent::getTargetType,
                event -> event,
                (left, right) -> right
            ));

        List<AllocationAuditEventResponse> auditEvents = allAuditEvents.stream()
            .filter(event ->
                ("DONATION_ALLOCATION".equals(event.getTargetType()) && allocationId.equals(event.getTargetId()))
                    || ("PARTNER_ORDER".equals(event.getTargetType()) && partnerOrderIds.contains(event.getTargetId()))
                    || latestFundingEvents.values().stream().anyMatch(fundingEvent -> fundingEvent.getId().equals(event.getId()))
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

    private void assertAccess(com.fairdonationpointpoc.domain.model.DonationAllocation allocation) {
        var actorContext = actorContextHolder.getCurrentActor()
            .orElseThrow(() -> new AuthenticationRequiredException("X-Actor-Id header is required."));

        if (actorContext.role() == Role.ADMIN) {
            return;
        }

        if (actorContext.role() == Role.DONOR && allocation.getDonor().getId().equals(actorContext.actorId())) {
            return;
        }

        if (actorContext.role() == Role.CHARITY_MANAGER) {
            var actor = userRepository.findByIdAndActiveTrue(actorContext.actorId())
                .orElseThrow(() -> new ResourceNotFoundException("Actor not found for X-Actor-Id header."));

            if (
                actor.getManagedCharity() != null
                    && actor.getManagedCharity().getId().equals(allocation.getCharity().getId())
            ) {
                return;
            }
        }

        throw new AccessDeniedException("Actor does not have permission to view this allocation detail.");
    }
}
