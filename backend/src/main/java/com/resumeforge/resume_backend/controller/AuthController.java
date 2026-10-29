package com.resumeforge.resume_backend.controller;

import com.resumeforge.resume_backend.dto.auth.AuthResponse;
import com.resumeforge.resume_backend.dto.auth.LoginRequest;
import com.resumeforge.resume_backend.dto.auth.SignupRequest;
import com.resumeforge.resume_backend.dto.auth.UserInfo;
import com.resumeforge.resume_backend.security.CurrentUserId;
import com.resumeforge.resume_backend.service.auth.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse signup(@Valid @RequestBody SignupRequest req) {
        return service.signup(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req, HttpServletRequest http) {
        return service.login(req, http.getRemoteAddr());
    }

    @GetMapping("/me")
    public UserInfo me(@CurrentUserId String userId) {
        return service.me(userId);
    }
}
