package com.fairdonationpointpoc.donor;

public record DonorDashboardResponse(
    long pointBalance,
    long totalConvertedPoints,
    long totalAllocatedPoints,
    long pendingPayments,
    long activeAllocations
) {
}
