package com.fairdonationpointpoc.actor;

import com.fairdonationpointpoc.common.model.Role;

public record ActorContext(
    Long actorId,
    String displayName,
    Role role
) {
}
