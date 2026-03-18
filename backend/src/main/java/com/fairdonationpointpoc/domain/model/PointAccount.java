package com.fairdonationpointpoc.domain.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "point_account")
public class PointAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "owner_type", nullable = false, length = 30)
    private PointAccountOwnerType ownerType;

    @Column(name = "owner_reference_id", nullable = false)
    private Long ownerReferenceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false, length = 30)
    private PointAccountType accountType;

    @Column(nullable = false, length = 100)
    private String label;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "pointAccount", cascade = CascadeType.ALL)
    private List<PointLedgerEntry> ledgerEntries = new ArrayList<>();

    protected PointAccount() {
    }

    public Long getId() {
        return id;
    }

    public PointAccountOwnerType getOwnerType() {
        return ownerType;
    }

    public Long getOwnerReferenceId() {
        return ownerReferenceId;
    }

    public PointAccountType getAccountType() {
        return accountType;
    }

    public String getLabel() {
        return label;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<PointLedgerEntry> getLedgerEntries() {
        return ledgerEntries;
    }
}
