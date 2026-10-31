package com.resumeforge.resume_backend.dto.ai;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record AssistantChatRequest(
        @NotBlank(message = "Message cannot be empty") String message,
        List<ChatMessage> history,
        String currentRole,
        String contextSnippet
) {
    public record ChatMessage(String role, String text) {}
}
