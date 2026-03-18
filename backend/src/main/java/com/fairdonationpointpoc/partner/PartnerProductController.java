package com.fairdonationpointpoc.partner;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/partner-products")
public class PartnerProductController {

    private final PartnerProductQueryService partnerProductQueryService;

    public PartnerProductController(PartnerProductQueryService partnerProductQueryService) {
        this.partnerProductQueryService = partnerProductQueryService;
    }

    @GetMapping
    public List<PartnerProductResponse> listPartnerProducts() {
        return partnerProductQueryService.getPartnerProducts();
    }
}
