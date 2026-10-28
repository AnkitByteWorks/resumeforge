package com.resumeforge.resume_backend.dto.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EnhanceBulletRequest(
        @NotBlank @Size(max = 1000) String bullet,
        String role,
        String techStack
) {}
