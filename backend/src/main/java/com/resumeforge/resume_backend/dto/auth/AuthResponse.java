package com.resumeforge.resume_backend.dto.auth;

public record AuthResponse(String accessToken, String tokenType, long expiresInSeconds, UserInfo user) {}
