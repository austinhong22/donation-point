package com.fairdonationpointpoc.charity;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/charities")
public class CharityController {

    private final CharityQueryService charityQueryService;

    public CharityController(CharityQueryService charityQueryService) {
        this.charityQueryService = charityQueryService;
    }

    @GetMapping
    public List<CharityResponse> listCharities() {
        return charityQueryService.getCharities();
    }
}
