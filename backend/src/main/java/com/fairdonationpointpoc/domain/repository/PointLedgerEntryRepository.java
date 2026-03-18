package com.fairdonationpointpoc.domain.repository;

import com.fairdonationpointpoc.domain.model.PointLedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PointLedgerEntryRepository extends JpaRepository<PointLedgerEntry, Long> {
}
