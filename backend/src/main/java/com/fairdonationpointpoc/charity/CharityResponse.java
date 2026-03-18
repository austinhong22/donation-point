package com.fairdonationpointpoc.charity;

public record CharityResponse(
    Long id,
    String code,
    String name,
    String description,
    Long pointBalance
) {
}
