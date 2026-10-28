package com.resumeforge.resume_backend.service.ai;

import com.resumeforge.resume_backend.exception.AiUnavailableException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AiRateLimiter {

    private final int maxRequests;
    private final Duration windowDuration;
    private final Map<String, Deque<Instant>> userRequests = new ConcurrentHashMap<>();

    public AiRateLimiter(
            @Value("${ai.rate-limit.max-requests:30}") int maxRequests,
            @Value("${ai.rate-limit.window-minutes:60}") int windowMinutes) {
        this.maxRequests = maxRequests;
        this.windowDuration = Duration.ofMinutes(windowMinutes);
    }

    public void check(String userId) {
        if (userId == null || userId.isBlank()) {
            return;
        }

        Instant now = Instant.now();
        Instant cutoff = now.minus(windowDuration);

        Deque<Instant> timestamps = userRequests.computeIfAbsent(userId, k -> new ArrayDeque<>());
        synchronized (timestamps) {
            while (!timestamps.isEmpty() && timestamps.peekFirst().isBefore(cutoff)) {
                timestamps.pollFirst();
            }

            if (timestamps.size() >= maxRequests) {
                throw new AiUnavailableException("Rate limit reached. You can make at most "
                        + maxRequests + " AI requests per " + windowDuration.toMinutes() + " minutes.");
            }

            timestamps.addLast(now);
        }
    }
}
