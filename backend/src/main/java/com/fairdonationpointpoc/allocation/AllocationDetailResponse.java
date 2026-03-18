package com.fairdonationpointpoc.allocation;

import java.util.List;

public record AllocationDetailResponse(
    Long allocationId,
    Long donorId,
    String donorName,
    Long charityId,
    String charityName,
    long convertedPoints,
    long allocatedPoints,
    long remainingPoints,
    String status,
    List<AllocationOrderTraceResponse> relatedPartnerOrders,
    List<AllocationAuditEventResponse> auditEvents
) {
}
