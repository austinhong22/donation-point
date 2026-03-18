package com.fairdonationpointpoc.domain.repository;

public record OwnerPointBalanceView(
    Long ownerReferenceId,
    long balance
) {
}
