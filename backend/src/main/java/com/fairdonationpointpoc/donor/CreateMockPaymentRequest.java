package com.fairdonationpointpoc.donor;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateMockPaymentRequest(
    @NotNull @Min(1) Long amountKrw
) {
}
