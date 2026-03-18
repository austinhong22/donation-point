package com.fairdonationpointpoc.domain.repository;

import com.fairdonationpointpoc.domain.model.Payment;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @EntityGraph(attributePaths = "donor")
    List<Payment> findAllByDonorIdOrderByCreatedAtDesc(Long donorId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select payment from Payment payment where payment.id = :id")
    @EntityGraph(attributePaths = "donor")
    Optional<Payment> findLockedById(@Param("id") Long id);
}
