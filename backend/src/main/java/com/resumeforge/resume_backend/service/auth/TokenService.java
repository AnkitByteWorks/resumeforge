package com.resumeforge.resume_backend.service.auth;

import com.resumeforge.resume_backend.config.JwtConfig;
import com.resumeforge.resume_backend.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
public class TokenService {

    public record Token(String value, long expiresInSeconds) {}

    private final JwtEncoder encoder;
    private final Duration lifetime;

    public TokenService(JwtEncoder encoder, @Value("${app.jwt.expiry-minutes:60}") long expiryMinutes) {
        this.encoder = encoder;
        this.lifetime = Duration.ofMinutes(expiryMinutes);
    }

    public Token issue(User user) {
        Instant now = Instant.now();
        Instant issuedAt = lifetime.isNegative() ? now.plus(lifetime.multipliedBy(2)) : now;
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(JwtConfig.ISSUER)
                .issuedAt(issuedAt)
                .expiresAt(now.plus(lifetime))
                .subject(user.getId())
                .claim("email", user.getEmail())
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String value = encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        return new Token(value, lifetime.toSeconds());
    }
}
