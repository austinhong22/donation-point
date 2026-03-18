package com.fairdonationpointpoc.charity;

import java.time.LocalDateTime;

public record CharityOrderResponse(
    Long orderId,
    Long allocationId,
    Long charityId,
    String charityName,
    Long partnerProductId,
    String partnerProductName,
    int quantity,
    long totalPoints,
    String status,
    LocalDateTime createdAt,
    LocalDateTime fulfilledAt
) {
}
