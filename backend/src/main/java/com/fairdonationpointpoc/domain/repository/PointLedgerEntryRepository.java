package com.fairdonationpointpoc.domain.repository;

import com.fairdonationpointpoc.domain.model.PointLedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PointLedgerEntryRepository extends JpaRepository<PointLedgerEntry, Long> {

    @Query("select coalesce(sum(entry.pointsDelta), 0) from PointLedgerEntry entry where entry.pointAccount.id = :pointAccountId")
    long sumBalanceByPointAccountId(@Param("pointAccountId") Long pointAccountId);
}
