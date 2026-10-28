package com.resumeforge.resume_backend.dto.ai;

import java.util.List;

public record TailorResumeResponse(
        List<String> matchedSkills,
        List<String> missingSkills,
        String tailoredSummary,
        List<BulletImprovement> suggestedBulletImprovements,
        String overallAdvice,
        String modelUsed
) {
    public record BulletImprovement(
            String originalBullet,
            String suggestedBullet,
            String reason
    ) {}
}
