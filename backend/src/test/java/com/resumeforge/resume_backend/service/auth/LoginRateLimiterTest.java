package com.resumeforge.resume_backend.service.auth;

import com.resumeforge.resume_backend.exception.RateLimitExceededException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;

class LoginRateLimiterTest {

    @Test
    void blocksAfterTooManyFailuresAndResetsOnSuccess() {
        var limiter = new LoginRateLimiter(2, 15);
        limiter.recordFailure("a|1");
        limiter.recordFailure("a|1");
        assertThrows(RateLimitExceededException.class, () -> limiter.check("a|1"));
        limiter.check("b|1");      // another key is unaffected
        limiter.reset("a|1");
        limiter.check("a|1");      // allowed again
    }
}
