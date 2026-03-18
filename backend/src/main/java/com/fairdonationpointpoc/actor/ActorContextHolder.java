package com.fairdonationpointpoc.actor;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Optional;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class ActorContextHolder {

    public Optional<ActorContext> getCurrentActor() {
        ServletRequestAttributes attributes =
            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attributes == null) {
            return Optional.empty();
        }

        HttpServletRequest request = attributes.getRequest();
        return Optional.ofNullable((ActorContext) request.getAttribute(MockActorFilter.ACTOR_CONTEXT_ATTRIBUTE));
    }
}
