package com.fairdonationpointpoc.demo;

import com.fairdonationpointpoc.common.model.Role;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/demo")
public class DemoSummaryController {

    @GetMapping("/summary")
    public DemoSummaryResponse summary() {
        return new DemoSummaryResponse(
            "fair-donation-point-poc",
            List.of(Role.DONOR, Role.CHARITY_MANAGER, Role.ADMIN),
            List.of(
                "donor mock payment",
                "point conversion",
                "charity allocation",
                "partner goods purchase",
                "admin fulfillment completion",
                "balances, history, and timeline"
            )
        );
    }
}
