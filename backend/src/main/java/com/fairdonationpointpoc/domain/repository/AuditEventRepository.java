package com.fairdonationpointpoc.domain.repository;

import com.fairdonationpointpoc.domain.model.AuditEvent;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {

    @EntityGraph(attributePaths = "actorUser")
    List<AuditEvent> findAllByOrderByCreatedAtAsc();
}
