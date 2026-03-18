package com.fairdonationpointpoc.charity;

import com.fairdonationpointpoc.domain.model.PointAccountOwnerType;
import com.fairdonationpointpoc.domain.repository.CharityRepository;
import com.fairdonationpointpoc.domain.repository.PointAccountRepository;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class CharityQueryService {

    private final CharityRepository charityRepository;
    private final PointAccountRepository pointAccountRepository;

    public CharityQueryService(CharityRepository charityRepository, PointAccountRepository pointAccountRepository) {
        this.charityRepository = charityRepository;
        this.pointAccountRepository = pointAccountRepository;
    }

    public List<CharityResponse> getCharities() {
        Map<Long, Long> pointBalances = pointAccountRepository.findBalancesByOwnerType(PointAccountOwnerType.CHARITY).stream()
            .collect(Collectors.toMap(balance -> balance.ownerReferenceId(), balance -> balance.balance()));

        return charityRepository.findAllByActiveTrueOrderByIdAsc().stream()
            .map(charity -> new CharityResponse(
                charity.getId(),
                charity.getCode(),
                charity.getName(),
                charity.getDescription(),
                pointBalances.getOrDefault(charity.getId(), 0L)
            ))
            .toList();
    }
}
