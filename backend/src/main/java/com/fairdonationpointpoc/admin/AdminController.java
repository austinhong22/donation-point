package com.fairdonationpointpoc.admin;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public AdminDashboardResponse getDashboard() {
        return adminService.getDashboard();
    }

    @GetMapping("/orders")
    public List<AdminOrderResponse> getOrders() {
        return adminService.getOrders();
    }

    @PatchMapping("/orders/{orderId}/complete")
    public AdminOrderResponse completeOrder(@PathVariable Long orderId) {
        return adminService.completeOrder(orderId);
    }
}
