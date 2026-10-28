package com.resumeforge.resume_backend.dto.ai;

import java.util.List;

public record GenerateSummaryResponse(
        String primarySummary,
        List<String> alternativeOptions,
        String modelUsed
) {}
