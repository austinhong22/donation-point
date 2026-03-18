package com.fairdonationpointpoc.domain.repository;

import com.fairdonationpointpoc.domain.model.PointAccount;
import com.fairdonationpointpoc.domain.model.PointAccountOwnerType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PointAccountRepository extends JpaRepository<PointAccount, Long> {

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
