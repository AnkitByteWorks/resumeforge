package com.resumeforge.resume_backend.dto;

public record ShareResumeResponse(
        String id,
        boolean isPublic,
        String shareSlug,
        String shareUrl
) {}
