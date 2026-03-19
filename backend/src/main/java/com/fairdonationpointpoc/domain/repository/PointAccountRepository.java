package com.fairdonationpointpoc.domain.repository;

import com.fairdonationpointpoc.domain.model.PointAccount;
import com.fairdonationpointpoc.domain.model.PointAccountType;
import com.fairdonationpointpoc.domain.model.PointAccountOwnerType;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PointAccountRepository extends JpaRepository<PointAccount, Long> {

    Optional<PointAccount> findByOwnerTypeAndOwnerReferenceIdAndAccountType(
        PointAccountOwnerType ownerType,
        Long ownerReferenceId,
        PointAccountType accountType
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select account
        from PointAccount account
        where account.ownerType = :ownerType
          and account.ownerReferenceId = :ownerReferenceId
          and account.accountType = :accountType
        """)
    Optional<PointAccount> findLockedByOwnerTypeAndOwnerReferenceIdAndAccountType(
        @Param("ownerType") PointAccountOwnerType ownerType,
        @Param("ownerReferenceId") Long ownerReferenceId,
        @Param("accountType") PointAccountType accountType
    );

    @Query("""
        select new com.fairdonationpointpoc.domain.repository.OwnerPointBalanceView(
            account.ownerReferenceId,
            coalesce(sum(entry.pointsDelta), 0)
        )
        from PointAccount account
        left join account.ledgerEntries entry
        where account.ownerType = :ownerType
        group by account.ownerReferenceId
        """)
    List<OwnerPointBalanceView> findBalancesByOwnerType(@Param("ownerType") PointAccountOwnerType ownerType);
}
