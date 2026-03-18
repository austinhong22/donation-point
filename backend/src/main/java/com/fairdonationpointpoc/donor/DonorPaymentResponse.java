package com.fairdonationpointpoc.donor;

import java.time.LocalDateTime;

public record DonorPaymentResponse(
    Long paymentId,
    String externalPaymentRef,
    long amountKrw,
    String status,
    Long convertedPoints,
    LocalDateTime createdAt
) {
}
