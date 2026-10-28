package com.resumeforge.resume_backend.dto.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TailorResumeRequest(
        @NotBlank @Size(max = 10000) String jobDescription
) {}
