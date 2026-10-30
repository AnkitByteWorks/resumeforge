package com.resumeforge.resume_backend.dto.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GenerateDraftRequest(
        @NotBlank(message = "Notes or draft text cannot be blank")
        @Size(max = 10000, message = "Text cannot exceed 10000 characters")
        String text,

        String targetRole,

        String jobDescription
) {}
