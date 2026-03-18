package com.fairdonationpointpoc.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "partner_order")
public class PartnerOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "charity_id", nullable = false)
    private Charity charity;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "charity_manager_user_id", nullable = false)
    private User charityManager;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "partner_product_id", nullable = false)
    private PartnerProduct partnerProduct;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "donation_allocation_id", nullable = false)
    private DonationAllocation donationAllocation;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "total_points", nullable = false)
    private long totalPoints;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PartnerOrderStatus status;

    @Column(name = "fulfilled_at")
    private LocalDateTime fulfilledAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected PartnerOrder() {
    }

    public PartnerOrder(
        Charity charity,
        User charityManager,
        PartnerProduct partnerProduct,
        DonationAllocation donationAllocation,
        int quantity,
        long totalPoints,
        PartnerOrderStatus status,
        LocalDateTime createdAt
    ) {
        this.charity = charity;
        this.charityManager = charityManager;
        this.partnerProduct = partnerProduct;
        this.donationAllocation = donationAllocation;
        this.quantity = quantity;
        this.totalPoints = totalPoints;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public Charity getCharity() {
        return charity;
    }

    public User getCharityManager() {
        return charityManager;
    }

    public PartnerProduct getPartnerProduct() {
        return partnerProduct;
    }

    public DonationAllocation getDonationAllocation() {
        return donationAllocation;
    }

    public int getQuantity() {
        return quantity;
    }

    public long getTotalPoints() {
        return totalPoints;
    }

    public PartnerOrderStatus getStatus() {
        return status;
    }

    public LocalDateTime getFulfilledAt() {
        return fulfilledAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void markFulfilled(LocalDateTime fulfilledAt) {
        this.status = PartnerOrderStatus.FULFILLED;
        this.fulfilledAt = fulfilledAt;
    }
}
