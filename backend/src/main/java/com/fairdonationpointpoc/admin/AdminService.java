package com.fairdonationpointpoc.admin;

import com.fairdonationpointpoc.actor.ActorAuthorizationService;
import com.fairdonationpointpoc.common.exception.InvalidRequestException;
import com.fairdonationpointpoc.common.exception.ResourceNotFoundException;
import com.fairdonationpointpoc.common.model.Role;
import com.fairdonationpointpoc.domain.model.AuditEvent;
import com.fairdonationpointpoc.domain.model.DonationAllocationStatus;
import com.fairdonationpointpoc.domain.model.PartnerOrder;
import com.fairdonationpointpoc.domain.model.PartnerOrderStatus;
import com.fairdonationpointpoc.domain.model.User;
import com.fairdonationpointpoc.domain.repository.AuditEventRepository;
import com.fairdonationpointpoc.domain.repository.DonationAllocationRepository;
import com.fairdonationpointpoc.domain.repository.PartnerOrderRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

    private final ActorAuthorizationService actorAuthorizationService;
    private final PartnerOrderRepository partnerOrderRepository;
    private final DonationAllocationRepository donationAllocationRepository;
    private final AuditEventRepository auditEventRepository;

    public AdminService(
        ActorAuthorizationService actorAuthorizationService,
        PartnerOrderRepository partnerOrderRepository,
        DonationAllocationRepository donationAllocationRepository,
        AuditEventRepository auditEventRepository
    ) {
        this.actorAuthorizationService = actorAuthorizationService;
        this.partnerOrderRepository = partnerOrderRepository;
        this.donationAllocationRepository = donationAllocationRepository;
        this.auditEventRepository = auditEventRepository;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        actorAuthorizationService.requireActor(Role.ADMIN);

        List<PartnerOrder> orders = partnerOrderRepository.findAllByOrderByCreatedAtDesc();
        long requestedPoints = orders.stream()
            .filter(order -> order.getStatus() == PartnerOrderStatus.REQUESTED)
            .mapToLong(PartnerOrder::getTotalPoints)
            .sum();
        long fulfilledPoints = orders.stream()
            .filter(order -> order.getStatus() == PartnerOrderStatus.FULFILLED)
            .mapToLong(PartnerOrder::getTotalPoints)
            .sum();

        return new AdminDashboardResponse(
            partnerOrderRepository.countByStatus(PartnerOrderStatus.REQUESTED),
            partnerOrderRepository.countByStatus(PartnerOrderStatus.FULFILLED),
            donationAllocationRepository.countByStatus(DonationAllocationStatus.ACTIVE),
            requestedPoints,
            fulfilledPoints
        );
    }

    @Transactional(readOnly = true)
    public List<AdminOrderResponse> getOrders() {
        actorAuthorizationService.requireActor(Role.ADMIN);
        return partnerOrderRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public AdminOrderResponse completeOrder(Long orderId) {
        User admin = actorAuthorizationService.requireActor(Role.ADMIN);
        PartnerOrder order = partnerOrderRepository.findWithDetailById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Partner order not found."));

        if (order.getStatus() == PartnerOrderStatus.FULFILLED) {
            throw new InvalidRequestException("Partner order is already fulfilled.");
        }

        LocalDateTime now = LocalDateTime.now();
        order.markFulfilled(now);
        auditEventRepository.save(new AuditEvent(
            admin,
            "PARTNER_ORDER",
            order.getId(),
            "PARTNER_ORDER_FULFILLED",
            "{\"fulfilledByAdminId\":" + admin.getId() + "}",
            now
        ));

        return toResponse(order);
    }

    private AdminOrderResponse toResponse(PartnerOrder order) {
        return new AdminOrderResponse(
            order.getId(),
            order.getDonationAllocation().getId(),
            order.getCharity().getId(),
            order.getCharity().getName(),
            order.getCharityManager().getId(),
            order.getCharityManager().getDisplayName(),
            order.getPartnerProduct().getId(),
            order.getPartnerProduct().getName(),
            order.getQuantity(),
            order.getTotalPoints(),
            order.getStatus().name(),
            order.getCreatedAt(),
            order.getFulfilledAt()
        );
    }
}
