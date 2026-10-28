package com.resumeforge.resume_backend.dto.ai;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record GenerateSummaryRequest(
        @NotBlank String role,
        String yearsOfExperience,
        List<String> keySkills,
        String backgroundOrAchievements,
        String tone // e.g. "impactful", "technical", "leadership", "entry-level"
) {}
