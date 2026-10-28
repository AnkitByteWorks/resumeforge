package com.resumeforge.resume_backend.dto.ai;

import java.util.List;

public record EnhanceBulletResponse(
        String originalBullet,
        String enhancedBullet,
        List<String> alternativeOptions,
        String actionVerbUsed,
        String explanation,
        String modelUsed
) {}
