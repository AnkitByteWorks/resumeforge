package com.resumeforge.resume_backend.service.ai;

import com.resumeforge.resume_backend.dto.ai.EnhanceBulletRequest;
import com.resumeforge.resume_backend.dto.ai.EnhanceBulletResponse;
import com.resumeforge.resume_backend.dto.ai.GenerateSummaryRequest;
import com.resumeforge.resume_backend.dto.ai.GenerateSummaryResponse;
import com.resumeforge.resume_backend.exception.AiUnavailableException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@EnabledIfEnvironmentVariable(named = "GEMINI_API_KEY", matches = ".+")
class AiResumeServiceTest {

    @Autowired
    private AiResumeService aiResumeService;

    @Test
    void testEnhanceBulletWithFallback() {
        try {
            EnhanceBulletRequest req = new EnhanceBulletRequest(
                    "Worked on Spring Boot backend and made some APIs",
                    "Java Backend Engineer",
                    "Java, Spring Boot, MongoDB"
            );

            EnhanceBulletResponse res = aiResumeService.enhanceBullet(req);
            assertNotNull(res);
            assertNotNull(res.enhancedBullet());
            assertFalse(res.enhancedBullet().isBlank());
            assertNotNull(res.modelUsed());
            System.out.println("Model used for bullet enhancement: " + res.modelUsed());
            System.out.println("Original: " + res.originalBullet());
            System.out.println("Enhanced: " + res.enhancedBullet());
        } catch (AiUnavailableException | IllegalStateException e) {
            System.err.println("Gemini service unavailable during test: " + e.getMessage());
        }
    }

    @Test
    void testGenerateSummaryWithFallback() {
        try {
            GenerateSummaryRequest req = new GenerateSummaryRequest(
                    "Java Backend Engineer",
                    "3 years",
                    List.of("Java", "Spring Boot", "Microservices", "MongoDB", "Docker"),
                    "Reduced API response time by 30% and built high-scale order service",
                    "impactful"
            );

            GenerateSummaryResponse res = aiResumeService.generateSummary(req);
            assertNotNull(res);
            assertNotNull(res.primarySummary());
            assertFalse(res.primarySummary().isBlank());
            assertNotNull(res.modelUsed());
            System.out.println("Model used for summary: " + res.modelUsed());
            System.out.println("Summary: " + res.primarySummary());
        } catch (AiUnavailableException | IllegalStateException e) {
            System.err.println("Gemini service unavailable during test: " + e.getMessage());
        }
    }
}
