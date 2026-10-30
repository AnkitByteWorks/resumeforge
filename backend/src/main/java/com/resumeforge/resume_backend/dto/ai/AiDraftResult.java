package com.resumeforge.resume_backend.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiDraftResult(
        ResumeDraft resume,
        List<AiQuestion> questions
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AiQuestion(String id, String question) {}
}
