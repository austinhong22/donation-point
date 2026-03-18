package com.fairdonationpointpoc.admin;

public record AdminDashboardResponse(
    long requestedOrders,
    long fulfilledOrders,
    long activeAllocations,
    long totalRequestedPoints,
    long totalFulfilledPoints
) {
}
