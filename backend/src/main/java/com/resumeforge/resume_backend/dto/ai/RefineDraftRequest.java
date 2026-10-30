package com.resumeforge.resume_backend.dto.ai;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record RefineDraftRequest(
        String text,
        String targetRole,
        String jobDescription,
        @NotNull ResumeDraft draft,
        List<AiAnswer> answers
) {
    public record AiAnswer(String question, String answer) {}
}
