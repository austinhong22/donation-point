package com.fairdonationpointpoc.donor;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/donor")
public class DonorController {

    private final DonorService donorService;

    public DonorController(DonorService donorService) {
        this.donorService = donorService;
    }

    @GetMapping("/me/dashboard")
    public DonorDashboardResponse getMyDashboard() {
        return donorService.getDashboard();
    }

    @GetMapping("/me/payments")
    public List<DonorPaymentResponse> getMyPayments() {
        return donorService.getPayments();
    }

    @PostMapping("/payments")
    public DonorPaymentResponse createMockPayment(@Valid @RequestBody CreateMockPaymentRequest request) {
        return donorService.createMockPayment(request);
    }

    @PostMapping("/payments/{paymentId}/convert")
    public DonorPaymentResponse convertPayment(@PathVariable Long paymentId) {
        return donorService.convertPayment(paymentId);
    }

    @GetMapping("/me/allocations")
    public List<DonorAllocationResponse> getMyAllocations() {
        return donorService.getAllocations();
    }

    @PostMapping("/allocations")
    public DonorAllocationResponse createAllocation(@Valid @RequestBody CreateDonationAllocationRequest request) {
        return donorService.createAllocation(request);
    }
}
