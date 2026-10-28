package com.resumeforge.resume_backend.controller;

import com.resumeforge.resume_backend.dto.AtsCheckRequest;
import com.resumeforge.resume_backend.dto.AtsReport;
import com.resumeforge.resume_backend.model.Resume;
import com.resumeforge.resume_backend.service.ResumeService;
import com.resumeforge.resume_backend.service.ats.AtsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/resumes")
@RequiredArgsConstructor
public class AtsController {

    private final ResumeService resumeService;
    private final AtsService atsService;

    @PostMapping("/{id}/ats-check")
    public AtsReport check(@RequestHeader("X-User-Id") String userId,
                           @PathVariable String id,
                           @Valid @RequestBody(required = false) AtsCheckRequest body) {
        Resume resume = resumeService.getEntity(userId, id);
        return atsService.analyze(resume, body == null ? null : body.jobDescription());
    }
}
