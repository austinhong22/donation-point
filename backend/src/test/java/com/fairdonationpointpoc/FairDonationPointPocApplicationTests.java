package com.fairdonationpointpoc;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class FairDonationPointPocApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void contextLoads() {
    }

    @Test
    void listsSeededDemoActors() throws Exception {
        mockMvc.perform(get("/api/v1/demo/actors"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(3)))
            .andExpect(jsonPath("$[0].id", is(101)))
            .andExpect(jsonPath("$[0].role", is("DONOR")))
            .andExpect(jsonPath("$[0].pointBalance", is(30000)))
            .andExpect(jsonPath("$[1].managedCharityId", is(1001)))
            .andExpect(jsonPath("$[2].managedCharityId", nullValue()));
    }

    @Test
    void listsSeededCharities() throws Exception {
        mockMvc.perform(get("/api/v1/charities"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].code", is("GREEN_SHELTER")))
            .andExpect(jsonPath("$[0].pointBalance", is(20000)))
            .andExpect(jsonPath("$[1].code", is("BRIGHT_MEAL")))
            .andExpect(jsonPath("$[1].pointBalance", is(10000)));
    }

    @Test
    void listsSeededPartnerProducts() throws Exception {
        mockMvc.perform(get("/api/v1/partner-products"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(3)))
            .andExpect(jsonPath("$[0].sku", is("HYGIENE-KIT")))
            .andExpect(jsonPath("$[2].pointCost", is(60000)));
    }

    @Test
    void donorListsDashboardPaymentsAndAllocations() throws Exception {
        mockMvc.perform(get("/api/v1/donor/me/dashboard").header("X-Actor-Id", "101"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.pointBalance", is(30000)))
            .andExpect(jsonPath("$.totalConvertedPoints", is(120000)))
            .andExpect(jsonPath("$.totalAllocatedPoints", is(90000)))
            .andExpect(jsonPath("$.pendingPayments", is(0)))
            .andExpect(jsonPath("$.activeAllocations", is(2)));

        mockMvc.perform(get("/api/v1/donor/me/payments").header("X-Actor-Id", "101"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].paymentId", is(6001)))
            .andExpect(jsonPath("$[0].status", is("CONVERTED")))
            .andExpect(jsonPath("$[0].convertedPoints", is(120000)));

        mockMvc.perform(get("/api/v1/donor/me/allocations").header("X-Actor-Id", "101"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].allocationId", is(9002)))
            .andExpect(jsonPath("$[1].allocationId", is(9001)));
    }

    @Test
    void donorCreatesMockPaymentAndConvertsItIntoPoints() throws Exception {
        mockMvc.perform(post("/api/v1/donor/payments")
                .header("X-Actor-Id", "101")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "amountKrw": 50000
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.paymentId", is(6002)))
            .andExpect(jsonPath("$.status", is("RECEIVED")))
            .andExpect(jsonPath("$.amountKrw", is(50000)));

        mockMvc.perform(post("/api/v1/donor/payments/6002/convert")
                .header("X-Actor-Id", "101"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.paymentId", is(6002)))
            .andExpect(jsonPath("$.status", is("CONVERTED")))
            .andExpect(jsonPath("$.convertedPoints", is(50000)));

        mockMvc.perform(get("/api/v1/donor/me/dashboard").header("X-Actor-Id", "101"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.pointBalance", is(80000)))
            .andExpect(jsonPath("$.totalConvertedPoints", is(170000)))
            .andExpect(jsonPath("$.pendingPayments", is(0)));
    }

    @Test
    void donorCreatesAllocationAndItAppearsInHistoryAndTrace() throws Exception {
        mockMvc.perform(post("/api/v1/donor/allocations")
                .header("X-Actor-Id", "101")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "charityId": 1001,
                      "points": 10000
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.allocationId", is(9003)))
            .andExpect(jsonPath("$.charityId", is(1001)))
            .andExpect(jsonPath("$.allocatedPoints", is(10000)))
            .andExpect(jsonPath("$.remainingPoints", is(10000)));

        mockMvc.perform(get("/api/v1/donor/me/dashboard").header("X-Actor-Id", "101"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.pointBalance", is(20000)))
            .andExpect(jsonPath("$.totalAllocatedPoints", is(100000)))
            .andExpect(jsonPath("$.activeAllocations", is(3)));

        mockMvc.perform(get("/api/v1/allocations/9003/detail").header("X-Actor-Id", "101"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.allocationId", is(9003)))
            .andExpect(jsonPath("$.donorId", is(101)))
            .andExpect(jsonPath("$.charityId", is(1001)))
            .andExpect(jsonPath("$.allocatedPoints", is(10000)))
            .andExpect(jsonPath("$.remainingPoints", is(10000)))
            .andExpect(jsonPath("$.auditEvents[0].action", is("PAYMENT_RECEIVED")))
            .andExpect(jsonPath("$.auditEvents[1].action", is("POINTS_CONVERTED")))
            .andExpect(jsonPath("$.auditEvents[2].action", is("ALLOCATION_CREATED")));
    }

    @Test
    void donorCannotAllocateMoreThanAvailableBalance() throws Exception {
        mockMvc.perform(post("/api/v1/donor/allocations")
                .header("X-Actor-Id", "101")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "charityId": 1001,
                      "points": 30001
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errorCode", is("INVALID_REQUEST")))
            .andExpect(jsonPath("$.message", is("Allocation points exceed donor balance.")));
    }

    @Test
    void returnsStructuredErrorForUnknownActorHeader() throws Exception {
        mockMvc.perform(get("/api/v1/charities").header("X-Actor-Id", "999999"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.errorCode", is("RESOURCE_NOT_FOUND")))
            .andExpect(jsonPath("$.message", is("Actor not found for X-Actor-Id header.")))
            .andExpect(jsonPath("$.path", is("/api/v1/charities")));
    }

    @Test
    void charityManagerListsOwnAllocationsAndOrders() throws Exception {
        mockMvc.perform(get("/api/v1/charity/me/allocations").header("X-Actor-Id", "201"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].allocationId", is(9001)))
            .andExpect(jsonPath("$[0].remainingPoints", is(20000)));

        mockMvc.perform(get("/api/v1/charity/me/orders").header("X-Actor-Id", "201"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].orderId", is(10001)))
            .andExpect(jsonPath("$[0].status", is("REQUESTED")));
    }

    @Test
    void charityManagerCreatesOrderAndConsumesAllocationRemainingPoints() throws Exception {
        mockMvc.perform(post("/api/v1/charity/orders")
                .header("X-Actor-Id", "201")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "allocationId": 9001,
                      "partnerProductId": 2001,
                      "quantity": 1
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.allocationId", is(9001)))
            .andExpect(jsonPath("$.partnerProductId", is(2001)))
            .andExpect(jsonPath("$.totalPoints", is(20000)))
            .andExpect(jsonPath("$.status", is("REQUESTED")));

        mockMvc.perform(get("/api/v1/allocations/9001/detail").header("X-Actor-Id", "201"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.remainingPoints", is(0)))
            .andExpect(jsonPath("$.status", is("FULLY_SPENT")))
            .andExpect(jsonPath("$.relatedPartnerOrders", hasSize(2)))
            .andExpect(jsonPath("$.auditEvents", hasSize(5)));
    }

    @Test
    void rejectsOrderWhenRemainingPointsAreInsufficient() throws Exception {
        mockMvc.perform(post("/api/v1/charity/orders")
                .header("X-Actor-Id", "201")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "allocationId": 9001,
                      "partnerProductId": 2002,
                      "quantity": 1
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errorCode", is("INVALID_REQUEST")))
            .andExpect(jsonPath("$.message", is("Order total points exceed allocation remaining points.")));
    }

    @Test
    void rejectsWrongCharityAccessForCharityManagerOrderCreation() throws Exception {
        mockMvc.perform(post("/api/v1/charity/orders")
                .header("X-Actor-Id", "201")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "allocationId": 9002,
                      "partnerProductId": 2001,
                      "quantity": 1
                    }
                    """))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.errorCode", is("ACCESS_DENIED")))
            .andExpect(jsonPath("$.message", is("Charity manager can only order against allocations of their own charity.")));
    }

    @Test
    void adminCompletesOrderAndDashboardReflectsFulfillment() throws Exception {
        mockMvc.perform(patch("/api/v1/admin/orders/10001/complete")
                .header("X-Actor-Id", "301"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.orderId", is(10001)))
            .andExpect(jsonPath("$.status", is("FULFILLED")));

        mockMvc.perform(get("/api/v1/admin/dashboard").header("X-Actor-Id", "301"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.requestedOrders", is(0)))
            .andExpect(jsonPath("$.fulfilledOrders", is(1)))
            .andExpect(jsonPath("$.activeAllocations", is(2)))
            .andExpect(jsonPath("$.totalRequestedPoints", is(0)))
            .andExpect(jsonPath("$.totalFulfilledPoints", is(60000)));

        mockMvc.perform(get("/api/v1/admin/orders").header("X-Actor-Id", "301"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].status", is("FULFILLED")));
    }

    @Test
    void allocationDetailShowsEndToEndTrace() throws Exception {
        mockMvc.perform(get("/api/v1/allocations/9001/detail").header("X-Actor-Id", "101"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.allocationId", is(9001)))
            .andExpect(jsonPath("$.donorId", is(101)))
            .andExpect(jsonPath("$.charityId", is(1001)))
            .andExpect(jsonPath("$.convertedPoints", is(120000)))
            .andExpect(jsonPath("$.allocatedPoints", is(80000)))
            .andExpect(jsonPath("$.remainingPoints", is(20000)))
            .andExpect(jsonPath("$.relatedPartnerOrders", hasSize(1)))
            .andExpect(jsonPath("$.relatedPartnerOrders[0].orderId", is(10001)))
            .andExpect(jsonPath("$.auditEvents", hasSize(4)))
            .andExpect(jsonPath("$.auditEvents[0].action", is("PAYMENT_RECEIVED")))
            .andExpect(jsonPath("$.auditEvents[1].action", is("POINTS_CONVERTED")))
            .andExpect(jsonPath("$.auditEvents[2].action", is("ALLOCATION_CREATED")))
            .andExpect(jsonPath("$.auditEvents[3].action", is("PARTNER_ORDER_REQUESTED")));
    }

    @Test
    void allocationDetailRequiresActorHeader() throws Exception {
        mockMvc.perform(get("/api/v1/allocations/9001/detail"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.errorCode", is("AUTHENTICATION_REQUIRED")))
            .andExpect(jsonPath("$.message", is("X-Actor-Id header is required.")));
    }

    @Test
    void charityManagerCannotInspectAnotherCharitysAllocationDetail() throws Exception {
        mockMvc.perform(get("/api/v1/allocations/9002/detail").header("X-Actor-Id", "201"))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.errorCode", is("ACCESS_DENIED")))
            .andExpect(jsonPath("$.message", is("Actor does not have permission to view this allocation detail.")));
    }
}
