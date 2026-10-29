package com.resumeforge.resume_backend.controller;

import com.resumeforge.resume_backend.security.CurrentUserId;

import com.resumeforge.resume_backend.dto.ai.*;
import com.resumeforge.resume_backend.model.Resume;
import com.resumeforge.resume_backend.service.ResumeService;
import com.resumeforge.resume_backend.service.ai.AiResumeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiResumeService aiResumeService;
    private final ResumeService resumeService;

    @PostMapping("/enhance-bullet")
    public EnhanceBulletResponse enhanceBullet(@Valid @RequestBody EnhanceBulletRequest request) {
        return aiResumeService.enhanceBullet(request);
    }

    @PostMapping("/generate-summary")
    public GenerateSummaryResponse generateSummary(@Valid @RequestBody GenerateSummaryRequest request) {
        return aiResumeService.generateSummary(request);
    }

    @PostMapping("/resumes/{id}/tailor")
    public TailorResumeResponse tailorResume(
            @CurrentUserId String userId,
            @PathVariable String id,
            @Valid @RequestBody TailorResumeRequest request) {
        Resume resume = resumeService.getEntity(userId, id);
        return aiResumeService.tailorResume(resume, request.jobDescription());
    }
}
