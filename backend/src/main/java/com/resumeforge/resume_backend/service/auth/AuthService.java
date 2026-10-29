package com.resumeforge.resume_backend.service.auth;

import com.resumeforge.resume_backend.dto.auth.AuthResponse;
import com.resumeforge.resume_backend.dto.auth.LoginRequest;
import com.resumeforge.resume_backend.dto.auth.SignupRequest;
import com.resumeforge.resume_backend.dto.auth.UserInfo;
import com.resumeforge.resume_backend.exception.BadRequestException;
import com.resumeforge.resume_backend.exception.ConflictException;
import com.resumeforge.resume_backend.exception.InvalidCredentialsException;
import com.resumeforge.resume_backend.model.User;
import com.resumeforge.resume_backend.repository.UserRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Locale;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final TokenService tokens;
    private final LoginRateLimiter limiter;
    private final String dummyHash;

    public AuthService(UserRepository users, PasswordEncoder encoder,
                       TokenService tokens, LoginRateLimiter limiter) {
        this.users = users;
        this.encoder = encoder;
        this.tokens = tokens;
        this.limiter = limiter;
        // Used so that unknown emails take as long to check as wrong passwords.
        this.dummyHash = encoder.encode("not-a-real-password");
    }

    public AuthResponse signup(SignupRequest req) {
        String email = normalize(req.email());
        if (req.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new BadRequestException("Password must be at most 72 bytes long.");
        }
        if (users.existsByEmail(email)) {
            throw new ConflictException("An account with this email already exists.");
        }
        User user = new User();
        user.setName(req.name().trim());
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(req.password()));
        user.setCreatedAt(Instant.now());
        try {
            user = users.save(user);
        } catch (DuplicateKeyException e) {
            throw new ConflictException("An account with this email already exists.");
        }
        return respond(user);
    }

    public AuthResponse login(LoginRequest req, String clientIp) {
        String email = normalize(req.email());
        String key = email + "|" + clientIp;
        limiter.check(key);

        Optional<User> user = users.findByEmail(email);
        String hash = user.map(User::getPasswordHash).orElse(dummyHash);
        boolean ok = encoder.matches(req.password(), hash) && user.isPresent();
        if (!ok) {
            limiter.recordFailure(key);
            throw new InvalidCredentialsException();
        }
        limiter.reset(key);
        return respond(user.get());
    }

    public UserInfo me(String userId) {
        return users.findById(userId).map(UserInfo::from)
                .orElseThrow(() -> new InvalidCredentialsException("Account not found."));
    }

    private AuthResponse respond(User user) {
        TokenService.Token token = tokens.issue(user);
        return new AuthResponse(token.value(), "Bearer", token.expiresInSeconds(), UserInfo.from(user));
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
