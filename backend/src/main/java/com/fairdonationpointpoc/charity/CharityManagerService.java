package com.fairdonationpointpoc.charity;

import com.fairdonationpointpoc.actor.ActorAuthorizationService;
import com.fairdonationpointpoc.common.exception.AccessDeniedException;
import com.fairdonationpointpoc.common.exception.InvalidRequestException;
import com.fairdonationpointpoc.common.exception.ResourceNotFoundException;
import com.fairdonationpointpoc.common.model.Role;
import com.fairdonationpointpoc.domain.model.AuditEvent;
import com.fairdonationpointpoc.domain.model.Charity;
import com.fairdonationpointpoc.domain.model.DonationAllocation;
import com.fairdonationpointpoc.domain.model.PartnerOrder;
import com.fairdonationpointpoc.domain.model.PartnerOrderStatus;
import com.fairdonationpointpoc.domain.model.PartnerProduct;
import com.fairdonationpointpoc.domain.model.PointLedgerEntry;
import com.fairdonationpointpoc.domain.model.PointLedgerEntryType;
import com.fairdonationpointpoc.domain.model.User;
import com.fairdonationpointpoc.domain.repository.AuditEventRepository;
import com.fairdonationpointpoc.domain.repository.DonationAllocationRepository;
import com.fairdonationpointpoc.domain.repository.PartnerOrderRepository;
import com.fairdonationpointpoc.domain.repository.PartnerProductRepository;
import com.fairdonationpointpoc.domain.repository.PointLedgerEntryRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CharityManagerService {

    private final ActorAuthorizationService actorAuthorizationService;
    private final DonationAllocationRepository donationAllocationRepository;
    private final PartnerOrderRepository partnerOrderRepository;
    private final PartnerProductRepository partnerProductRepository;
    private final PointLedgerEntryRepository pointLedgerEntryRepository;
    private final AuditEventRepository auditEventRepository;

    public CharityManagerService(
        ActorAuthorizationService actorAuthorizationService,
        DonationAllocationRepository donationAllocationRepository,
        PartnerOrderRepository partnerOrderRepository,
        PartnerProductRepository partnerProductRepository,
        PointLedgerEntryRepository pointLedgerEntryRepository,
        AuditEventRepository auditEventRepository
    ) {
        this.actorAuthorizationService = actorAuthorizationService;
        this.donationAllocationRepository = donationAllocationRepository;
        this.partnerOrderRepository = partnerOrderRepository;
        this.partnerProductRepository = partnerProductRepository;
        this.pointLedgerEntryRepository = pointLedgerEntryRepository;
        this.auditEventRepository = auditEventRepository;
    }

    @Transactional(readOnly = true)
    public List<CharityAllocationSummaryResponse> getMyAllocations() {
        User manager = requireManager();
        Charity charity = requireManagedCharity(manager);

        return donationAllocationRepository.findAllByCharityIdOrderByCreatedAtDesc(charity.getId()).stream()
            .map(allocation -> new CharityAllocationSummaryResponse(
                allocation.getId(),
                allocation.getDonor().getId(),
                allocation.getDonor().getDisplayName(),
                allocation.getAllocatedPoints(),
                allocation.getRemainingPoints(),
                allocation.getStatus().name(),
                allocation.getCreatedAt()
            ))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<CharityOrderResponse> getMyOrders() {
        User manager = requireManager();
        Charity charity = requireManagedCharity(manager);

        return partnerOrderRepository.findAllByCharityIdOrderByCreatedAtDesc(charity.getId()).stream()
            .map(this::toOrderResponse)
            .toList();
    }

    @Transactional
    public CharityOrderResponse createOrder(CreateCharityOrderRequest request) {
        User manager = requireManager();
        Charity charity = requireManagedCharity(manager);

        DonationAllocation allocation = donationAllocationRepository.findLockedById(request.allocationId())
            .orElseThrow(() -> new ResourceNotFoundException("Allocation not found."));
        PartnerProduct product = partnerProductRepository.findById(request.partnerProductId())
            .filter(PartnerProduct::isActive)
            .orElseThrow(() -> new ResourceNotFoundException("Partner product not found."));

        if (!allocation.getCharity().getId().equals(charity.getId())) {
            throw new AccessDeniedException("Charity manager can only order against allocations of their own charity.");
        }

        long totalPoints = product.getPointCost() * request.quantity();
        if (totalPoints > allocation.getRemainingPoints()) {
            throw new InvalidRequestException("Order total points exceed allocation remaining points.");
        }

        LocalDateTime now = LocalDateTime.now();
        PartnerOrder savedOrder = partnerOrderRepository.saveAndFlush(new PartnerOrder(
            charity,
            manager,
            product,
            allocation,
            request.quantity(),
            totalPoints,
            PartnerOrderStatus.REQUESTED,
            now
        ));

        try {
            allocation.spendPoints(totalPoints);
        } catch (IllegalArgumentException exception) {
            throw new InvalidRequestException(exception.getMessage());
        }

        pointLedgerEntryRepository.save(new PointLedgerEntry(
            allocation.getCharityPointAccount(),
            PointLedgerEntryType.ORDER_DEBIT,
            -totalPoints,
            "PARTNER_ORDER",
            savedOrder.getId(),
            "Charity manager ordered partner goods using allocated points.",
            now
        ));

        auditEventRepository.save(new AuditEvent(
            manager,
            "PARTNER_ORDER",
            savedOrder.getId(),
            "PARTNER_ORDER_REQUESTED",
            "{\"allocationId\":" + allocation.getId()
                + ",\"partnerProductId\":" + product.getId()
                + ",\"quantity\":" + request.quantity()
                + ",\"totalPoints\":" + totalPoints + "}",
            now
        ));

        return toOrderResponse(savedOrder);
    }

    private User requireManager() {
        return actorAuthorizationService.requireActor(Role.CHARITY_MANAGER);
    }

    private Charity requireManagedCharity(User manager) {
        if (manager.getManagedCharity() == null) {
            throw new AccessDeniedException("Charity manager is not linked to a managed charity.");
        }
        return manager.getManagedCharity();
    }

    private CharityOrderResponse toOrderResponse(PartnerOrder order) {
        return new CharityOrderResponse(
            order.getId(),
            order.getDonationAllocation().getId(),
            order.getCharity().getId(),
            order.getCharity().getName(),
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
