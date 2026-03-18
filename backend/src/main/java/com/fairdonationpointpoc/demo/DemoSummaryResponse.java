package com.fairdonationpointpoc.demo;

import com.fairdonationpointpoc.common.model.Role;
import java.util.List;

public record DemoSummaryResponse(
    String project,
    List<Role> roles,
    List<String> flow
) {
}
