package com.fairdonationpointpoc.admin;

import java.time.LocalDateTime;

public record AdminOrderResponse(
    Long orderId,
    Long allocationId,
    Long charityId,
    String charityName,
    Long charityManagerUserId,
    String charityManagerName,
    Long partnerProductId,
    String partnerProductName,
    int quantity,
    long totalPoints,
    String status,
    LocalDateTime createdAt,
    LocalDateTime fulfilledAt
) {
}
