package com.resumeforge.resume_backend.controller;

import com.resumeforge.resume_backend.dto.AtsCheckRequest;
import com.resumeforge.resume_backend.dto.ai.AiImproveResult;
import com.resumeforge.resume_backend.service.ai.AiImproveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/resumes")
@RequiredArgsConstructor
public class ResumeImproveController {

    private final AiImproveService service;

    @PostMapping("/{id}/ai-improve")
    public AiImproveResult improve(@RequestHeader("X-User-Id") String userId,
                                   @PathVariable String id,
                                   @Valid @RequestBody(required = false) AtsCheckRequest body) {
        return service.improve(userId, id, body == null ? null : body.jobDescription());
    }
}
