package com.fairdonationpointpoc.charity;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class CharityController {

    private final CharityQueryService charityQueryService;
    private final CharityManagerService charityManagerService;

    public CharityController(
        CharityQueryService charityQueryService,
        CharityManagerService charityManagerService
    ) {
        this.charityQueryService = charityQueryService;
        this.charityManagerService = charityManagerService;
    }

    @GetMapping("/charities")
    public List<CharityResponse> listCharities() {
        return charityQueryService.getCharities();
    }

    @GetMapping("/charity/me/allocations")
    public List<CharityAllocationSummaryResponse> listMyAllocations() {
        return charityManagerService.getMyAllocations();
    }

    @GetMapping("/charity/me/orders")
    public List<CharityOrderResponse> listMyOrders() {
        return charityManagerService.getMyOrders();
    }

    @PostMapping("/charity/orders")
    public CharityOrderResponse createOrder(@Valid @RequestBody CreateCharityOrderRequest request) {
        return charityManagerService.createOrder(request);
    }
}
