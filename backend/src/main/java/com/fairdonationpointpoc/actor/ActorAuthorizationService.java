package com.fairdonationpointpoc.actor;

import com.fairdonationpointpoc.common.exception.AccessDeniedException;
import com.fairdonationpointpoc.common.exception.AuthenticationRequiredException;
import com.fairdonationpointpoc.common.exception.ResourceNotFoundException;
import com.fairdonationpointpoc.common.model.Role;
import com.fairdonationpointpoc.domain.model.User;
import com.fairdonationpointpoc.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class ActorAuthorizationService {

    private final ActorContextHolder actorContextHolder;
    private final UserRepository userRepository;

    public ActorAuthorizationService(ActorContextHolder actorContextHolder, UserRepository userRepository) {
        this.actorContextHolder = actorContextHolder;
        this.userRepository = userRepository;
    }

    public User requireActor(Role role) {
        ActorContext actorContext = actorContextHolder.getCurrentActor()
            .orElseThrow(() -> new AuthenticationRequiredException("X-Actor-Id header is required."));

        if (actorContext.role() != role) {
            throw new AccessDeniedException("Actor does not have permission for this operation.");
        }

        return userRepository.findByIdAndActiveTrue(actorContext.actorId())
            .orElseThrow(() -> new ResourceNotFoundException("Actor not found for X-Actor-Id header."));
    }
}
