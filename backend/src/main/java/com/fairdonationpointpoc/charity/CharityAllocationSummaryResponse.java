package com.fairdonationpointpoc.charity;

import java.time.LocalDateTime;

public record CharityAllocationSummaryResponse(
    Long allocationId,
    Long donorId,
    String donorName,
    long allocatedPoints,
    long remainingPoints,
    String status,
    LocalDateTime createdAt
) {
}
