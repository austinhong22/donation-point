package com.fairdonationpointpoc.domain.repository;

import com.fairdonationpointpoc.domain.model.DonationAllocationStatus;
import com.fairdonationpointpoc.domain.model.DonationAllocation;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DonationAllocationRepository extends JpaRepository<DonationAllocation, Long> {

    @EntityGraph(attributePaths = {"donor", "charity", "donorPointAccount", "charityPointAccount"})
    List<DonationAllocation> findAllByCharityIdOrderByCreatedAtDesc(Long charityId);

    @Query("select allocation from DonationAllocation allocation where allocation.id = :id")
    @EntityGraph(attributePaths = {"donor", "charity", "donorPointAccount", "charityPointAccount"})
    Optional<DonationAllocation> findWithDetailById(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select allocation from DonationAllocation allocation where allocation.id = :id")
    @EntityGraph(attributePaths = {"donor", "charity", "donorPointAccount", "charityPointAccount"})
    Optional<DonationAllocation> findLockedById(@Param("id") Long id);

    long countByStatus(DonationAllocationStatus status);
}
