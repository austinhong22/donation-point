package com.fairdonationpointpoc.common.api;

import java.time.OffsetDateTime;
import java.util.List;

public record ApiErrorResponse(
    OffsetDateTime timestamp,
    int status,
    String errorCode,
    String message,
    String path,
    List<ApiErrorField> fieldErrors
) {
}
