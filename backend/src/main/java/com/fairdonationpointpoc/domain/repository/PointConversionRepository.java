package com.fairdonationpointpoc.domain.repository;

import com.fairdonationpointpoc.domain.model.PointConversion;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PointConversionRepository extends JpaRepository<PointConversion, Long> {

    @Query("select coalesce(sum(pc.convertedPoints), 0) from PointConversion pc where pc.pointAccount.id = :pointAccountId")
    long sumConvertedPointsByPointAccountId(@Param("pointAccountId") Long pointAccountId);
}
