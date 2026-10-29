package com.resumeforge.resume_backend.config;

import com.resumeforge.resume_backend.model.User;
import com.resumeforge.resume_backend.service.auth.TokenService;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;

import javax.crypto.SecretKey;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtRoundTripTest {

    private final JwtConfig config = new JwtConfig();

    private User user() {
        User u = new User();
        u.setId("user-123");
        u.setEmail("a@b.com");
        return u;
    }

    @Test
    void tokenFromEncoderIsAcceptedByDecoder() {
        SecretKey key = config.jwtSecretKey("0123456789abcdef0123456789abcdef");
        var tokens = new TokenService(config.jwtEncoder(key), 60);

        Jwt jwt = config.jwtDecoder(key).decode(tokens.issue(user()).value());

        assertEquals("user-123", jwt.getSubject());
        assertEquals("a@b.com", jwt.getClaimAsString("email"));
    }

    @Test
    void tokenSignedWithAnotherKeyIsRejected() {
        SecretKey real = config.jwtSecretKey("0123456789abcdef0123456789abcdef");
        SecretKey attacker = config.jwtSecretKey("ffffffffffffffffffffffffffffffff");
        var forged = new TokenService(config.jwtEncoder(attacker), 60).issue(user()).value();

        assertThrows(JwtException.class, () -> config.jwtDecoder(real).decode(forged));
    }

    @Test
    void expiredTokenIsRejected() {
        SecretKey key = config.jwtSecretKey("0123456789abcdef0123456789abcdef");
        var expired = new TokenService(config.jwtEncoder(key), -5).issue(user()).value();

        assertThrows(JwtException.class, () -> config.jwtDecoder(key).decode(expired));
    }
}
