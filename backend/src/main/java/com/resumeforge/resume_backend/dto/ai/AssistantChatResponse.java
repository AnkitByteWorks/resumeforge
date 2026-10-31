package com.resumeforge.resume_backend.dto.ai;

import java.util.List;

public record AssistantChatResponse(
        String reply,
        List<String> suggestedFollowUps,
        String modelUsed
) {}
