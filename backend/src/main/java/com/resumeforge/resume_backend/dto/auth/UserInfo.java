package com.resumeforge.resume_backend.dto.auth;

import com.resumeforge.resume_backend.model.User;

public record UserInfo(String id, String name, String email) {
    public static UserInfo from(User u) {
        return new UserInfo(u.getId(), u.getName(), u.getEmail());
    }
}
