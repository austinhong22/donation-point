package com.fairdonationpointpoc.actor;

import com.fairdonationpointpoc.common.exception.InvalidRequestException;
import com.fairdonationpointpoc.common.exception.ResourceNotFoundException;
import com.fairdonationpointpoc.domain.model.User;
import com.fairdonationpointpoc.domain.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

@Component
public class MockActorFilter extends OncePerRequestFilter {

    public static final String ACTOR_CONTEXT_ATTRIBUTE = "mockActorContext";
    public static final String ACTOR_ID_HEADER = "X-Actor-Id";

    private final UserRepository userRepository;
    private final HandlerExceptionResolver handlerExceptionResolver;

    public MockActorFilter(
        UserRepository userRepository,
        HandlerExceptionResolver handlerExceptionResolver
    ) {
        this.userRepository = userRepository;
        this.handlerExceptionResolver = handlerExceptionResolver;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            String actorIdHeader = request.getHeader(ACTOR_ID_HEADER);

            if (StringUtils.hasText(actorIdHeader)) {
                User actor = userRepository.findByIdAndActiveTrue(parseActorId(actorIdHeader))
                    .orElseThrow(() -> new ResourceNotFoundException("Actor not found for X-Actor-Id header."));

                request.setAttribute(
                    ACTOR_CONTEXT_ATTRIBUTE,
                    new ActorContext(actor.getId(), actor.getDisplayName(), actor.getRole())
                );
            }

            filterChain.doFilter(request, response);
        } catch (RuntimeException exception) {
            handlerExceptionResolver.resolveException(request, response, null, exception);
        }
    }

    private Long parseActorId(String actorIdHeader) {
        try {
            return Long.valueOf(actorIdHeader);
        } catch (NumberFormatException exception) {
            throw new InvalidRequestException("X-Actor-Id header must be a numeric id.");
        }
    }
}
