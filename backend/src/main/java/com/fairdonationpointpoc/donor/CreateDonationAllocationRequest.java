package com.fairdonationpointpoc.donor;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateDonationAllocationRequest(
    @NotNull Long charityId,
    @NotNull @Min(1) Long points
) {
}
