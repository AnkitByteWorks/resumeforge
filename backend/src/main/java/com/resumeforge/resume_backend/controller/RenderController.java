package com.resumeforge.resume_backend.controller;

import com.resumeforge.resume_backend.dto.ai.ResumeDraft;
import com.resumeforge.resume_backend.model.Resume;
import com.resumeforge.resume_backend.security.CurrentUserId;
import com.resumeforge.resume_backend.service.ResumeRenderService;
import com.resumeforge.resume_backend.service.ResumeService;
import com.resumeforge.resume_backend.service.TemplateRegistry;
import com.resumeforge.resume_backend.service.ai.DraftMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class RenderController {

    private final ResumeService resumeService;
    private final ResumeRenderService renderService;
    private final TemplateRegistry registry;

    @GetMapping("/templates")
    public List<TemplateRegistry.TemplateInfo> templates() {
        return registry.all();
    }

    @PostMapping(value = "/preview", produces = MediaType.TEXT_HTML_VALUE)
    public String previewDraft(@RequestBody ResumeDraft draft) {
        return renderService.renderHtml(DraftMapper.toEntity(draft));
    }

    @GetMapping(value = "/resumes/{id}/preview", produces = MediaType.TEXT_HTML_VALUE)
    public String preview(@CurrentUserId String userId, @PathVariable String id) {
        Resume resume = resumeService.getEntity(userId, id);
        return renderService.renderHtml(resume);
    }

    @GetMapping("/resumes/{id}/pdf")
    public ResponseEntity<byte[]> pdf(@CurrentUserId String userId, @PathVariable String id) {
        Resume resume = resumeService.getEntity(userId, id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename("resume.pdf").build().toString())
                .body(renderService.renderPdf(resume));
    }
}
