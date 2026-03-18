package com.fairdonationpointpoc.partner;

public record PartnerProductResponse(
    Long id,
    String sku,
    String name,
    String description,
    long pointCost
) {
}
