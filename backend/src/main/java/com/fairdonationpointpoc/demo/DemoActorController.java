package com.fairdonationpointpoc.demo;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/demo")
public class DemoActorController {

    private final DemoActorService demoActorService;

    public DemoActorController(DemoActorService demoActorService) {
        this.demoActorService = demoActorService;
    }

    @GetMapping("/actors")
    public List<DemoActorResponse> listActors() {
        return demoActorService.getDemoActors();
    }
}
