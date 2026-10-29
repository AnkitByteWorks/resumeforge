package com.resumeforge.resume_backend.service.auth;

import com.resumeforge.resume_backend.exception.RateLimitExceededException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginRateLimiter {

    private final int maxFailures;
    private final long windowMillis;
    private final Map<String, Deque<Long>> failures = new ConcurrentHashMap<>();

    public LoginRateLimiter(@Value("${auth.login.max-failures:5}") int maxFailures,
                            @Value("${auth.login.window-minutes:15}") long windowMinutes) {
        this.maxFailures = maxFailures;
        this.windowMillis = Duration.ofMinutes(windowMinutes).toMillis();
    }

    public void check(String key) {
        Deque<Long> queue = failures.get(key);
        if (queue == null) return;
        synchronized (queue) {
            prune(queue);
            if (queue.size() >= maxFailures) {
                throw new RateLimitExceededException(
                        "Too many failed login attempts. Please try again later.");
            }
        }
    }

    public void recordFailure(String key) {
        Deque<Long> queue = failures.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (queue) {
            prune(queue);
            queue.addLast(System.currentTimeMillis());
        }
    }

    public void reset(String key) {
        failures.remove(key);
    }

    private void prune(Deque<Long> queue) {
        long cutoff = System.currentTimeMillis() - windowMillis;
        while (!queue.isEmpty() && queue.peekFirst() < cutoff) queue.pollFirst();
    }
}
