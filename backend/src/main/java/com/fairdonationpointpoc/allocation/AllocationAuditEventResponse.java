package com.fairdonationpointpoc.allocation;

import java.time.LocalDateTime;

public record AllocationAuditEventResponse(
    LocalDateTime createdAt,
    String action,
    String targetType,
    Long targetId,
    Long actorUserId,
    String actorDisplayName,
    String eventData
) {
}
