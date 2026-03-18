package com.fairdonationpointpoc.demo;

import com.fairdonationpointpoc.common.model.Role;

public record DemoActorResponse(
    Long id,
    String displayName,
    String email,
    Role role,
    Long managedCharityId,
    Long pointBalance
) {
}
