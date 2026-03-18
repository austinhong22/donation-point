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
@Table(name = "donation_allocation")
public class DonationAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "donor_user_id", nullable = false)
    private User donor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "charity_id", nullable = false)
    private Charity charity;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "donor_point_account_id", nullable = false)
    private PointAccount donorPointAccount;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "charity_point_account_id", nullable = false)
    private PointAccount charityPointAccount;

    @Column(name = "allocated_points", nullable = false)
    private long allocatedPoints;

    @Column(name = "remaining_points", nullable = false)
    private long remainingPoints;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DonationAllocationStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected DonationAllocation() {
    }

    public DonationAllocation(
        User donor,
        Charity charity,
        PointAccount donorPointAccount,
        PointAccount charityPointAccount,
        long allocatedPoints,
        long remainingPoints,
        DonationAllocationStatus status,
        LocalDateTime createdAt
    ) {
        this.donor = donor;
        this.charity = charity;
        this.donorPointAccount = donorPointAccount;
        this.charityPointAccount = charityPointAccount;
        this.allocatedPoints = allocatedPoints;
        this.remainingPoints = remainingPoints;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public User getDonor() {
        return donor;
    }

    public Charity getCharity() {
        return charity;
    }

    public PointAccount getDonorPointAccount() {
        return donorPointAccount;
    }

    public PointAccount getCharityPointAccount() {
        return charityPointAccount;
    }

    public long getAllocatedPoints() {
        return allocatedPoints;
    }

    public long getRemainingPoints() {
        return remainingPoints;
    }

    public DonationAllocationStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void spendPoints(long pointsToSpend) {
        if (pointsToSpend <= 0) {
            throw new IllegalArgumentException("Points to spend must be positive.");
        }
        if (pointsToSpend > remainingPoints) {
            throw new IllegalArgumentException("Order points exceed allocation remaining points.");
        }

        remainingPoints -= pointsToSpend;
        if (remainingPoints == 0) {
            status = DonationAllocationStatus.FULLY_SPENT;
        }
    }
}
