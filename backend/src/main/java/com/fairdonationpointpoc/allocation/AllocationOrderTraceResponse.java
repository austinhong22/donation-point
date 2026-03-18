package com.fairdonationpointpoc.allocation;

import java.time.LocalDateTime;

public record AllocationOrderTraceResponse(
    Long orderId,
    Long partnerProductId,
    String partnerProductName,
    int quantity,
    long totalPoints,
    String status,
    LocalDateTime createdAt,
    LocalDateTime fulfilledAt
) {
}
