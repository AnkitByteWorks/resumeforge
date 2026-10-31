package com.resumeforge.resume_backend.dto.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TailorDraftRequest(
        @NotNull ResumeDraft draft,
        @NotBlank @Size(max = 10000) String jobDescription
) {}
