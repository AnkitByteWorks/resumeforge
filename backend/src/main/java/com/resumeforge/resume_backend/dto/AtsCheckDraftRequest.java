package com.resumeforge.resume_backend.dto;

import com.resumeforge.resume_backend.dto.ai.ResumeDraft;
import jakarta.validation.constraints.NotNull;

public record AtsCheckDraftRequest(
        @NotNull ResumeDraft draft,
        String jobDescription
) {}
