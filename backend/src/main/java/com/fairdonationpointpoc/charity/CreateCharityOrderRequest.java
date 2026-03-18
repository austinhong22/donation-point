package com.fairdonationpointpoc.charity;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateCharityOrderRequest(
    @NotNull Long allocationId,
    @NotNull Long partnerProductId,
    @NotNull @Min(1) Integer quantity
) {
}
