package com.fairdonationpointpoc.donor;

import java.time.LocalDateTime;

public record DonorAllocationResponse(
    Long allocationId,
    Long charityId,
    String charityName,
    long allocatedPoints,
    long remainingPoints,
    String status,
    LocalDateTime createdAt
) {
}
