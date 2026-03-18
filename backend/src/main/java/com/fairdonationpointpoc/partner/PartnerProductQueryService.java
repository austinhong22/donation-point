package com.fairdonationpointpoc.partner;

import com.fairdonationpointpoc.domain.repository.PartnerProductRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PartnerProductQueryService {

    private final PartnerProductRepository partnerProductRepository;

    public PartnerProductQueryService(PartnerProductRepository partnerProductRepository) {
        this.partnerProductRepository = partnerProductRepository;
    }

    public List<PartnerProductResponse> getPartnerProducts() {
        return partnerProductRepository.findAllByActiveTrueOrderByIdAsc().stream()
            .map(product -> new PartnerProductResponse(
                product.getId(),
                product.getSku(),
                product.getName(),
                product.getDescription(),
                product.getPointCost()
            ))
            .toList();
    }
}
