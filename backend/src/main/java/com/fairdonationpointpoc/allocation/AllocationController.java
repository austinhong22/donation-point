package com.fairdonationpointpoc.allocation;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/allocations")
public class AllocationController {

    private final AllocationDetailService allocationDetailService;

    public AllocationController(AllocationDetailService allocationDetailService) {
        this.allocationDetailService = allocationDetailService;
    }

    @GetMapping("/{allocationId}/detail")
    public AllocationDetailResponse getDetail(@PathVariable Long allocationId) {
        return allocationDetailService.getDetail(allocationId);
    }
}
