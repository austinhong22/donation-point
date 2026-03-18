package com.fairdonationpointpoc.domain.repository;

import com.fairdonationpointpoc.domain.model.PartnerOrder;
import com.fairdonationpointpoc.domain.model.PartnerOrderStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PartnerOrderRepository extends JpaRepository<PartnerOrder, Long> {

    @EntityGraph(attributePaths = {"charity", "charityManager", "partnerProduct", "donationAllocation"})
    List<PartnerOrder> findAllByCharityIdOrderByCreatedAtDesc(Long charityId);

    @EntityGraph(attributePaths = {"charity", "charityManager", "partnerProduct", "donationAllocation"})
    List<PartnerOrder> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"charity", "charityManager", "partnerProduct", "donationAllocation"})
    List<PartnerOrder> findAllByDonationAllocationIdOrderByCreatedAtAsc(Long donationAllocationId);

    @Query("select partnerOrder from PartnerOrder partnerOrder where partnerOrder.id = :id")
    @EntityGraph(attributePaths = {"charity", "charityManager", "partnerProduct", "donationAllocation"})
    Optional<PartnerOrder> findWithDetailById(@Param("id") Long id);

    long countByStatus(PartnerOrderStatus status);
}
