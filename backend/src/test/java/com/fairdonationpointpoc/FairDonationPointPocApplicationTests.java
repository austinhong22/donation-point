package com.fairdonationpointpoc;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
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
            .andExpect(jsonPath("$[0].pointBalance", is(40000)))
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
            .andExpect(jsonPath("$[1].pointBalance", is(0)));
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
    void returnsStructuredErrorForUnknownActorHeader() throws Exception {
        mockMvc.perform(get("/api/v1/charities").header("X-Actor-Id", "999999"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.errorCode", is("RESOURCE_NOT_FOUND")))
            .andExpect(jsonPath("$.message", is("Actor not found for X-Actor-Id header.")))
            .andExpect(jsonPath("$.path", is("/api/v1/charities")));
    }
}
