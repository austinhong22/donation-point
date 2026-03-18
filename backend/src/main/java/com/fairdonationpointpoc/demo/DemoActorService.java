package com.fairdonationpointpoc.demo;

import com.fairdonationpointpoc.domain.model.PointAccountOwnerType;
import com.fairdonationpointpoc.domain.model.User;
import com.fairdonationpointpoc.domain.repository.PointAccountRepository;
import com.fairdonationpointpoc.domain.repository.UserRepository;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class DemoActorService {

    private final UserRepository userRepository;
    private final PointAccountRepository pointAccountRepository;

    public DemoActorService(UserRepository userRepository, PointAccountRepository pointAccountRepository) {
        this.userRepository = userRepository;
        this.pointAccountRepository = pointAccountRepository;
    }

    public List<DemoActorResponse> getDemoActors() {
        Map<Long, Long> pointBalances = pointAccountRepository.findBalancesByOwnerType(PointAccountOwnerType.USER).stream()
            .collect(java.util.stream.Collectors.toMap(
                balance -> balance.ownerReferenceId(),
                balance -> balance.balance()
            ));

        return userRepository.findAllByOrderByIdAsc().stream()
            .map(user -> toResponse(user, pointBalances))
            .toList();
    }

    private DemoActorResponse toResponse(User user, Map<Long, Long> pointBalances) {
        Long managedCharityId = user.getManagedCharity() == null ? null : user.getManagedCharity().getId();
        return new DemoActorResponse(
            user.getId(),
            user.getDisplayName(),
            user.getEmail(),
            user.getRole(),
            managedCharityId,
            pointBalances.getOrDefault(user.getId(), 0L)
        );
    }
}
