package com.resumeforge.resume_backend.controller;

import com.resumeforge.resume_backend.dto.PublicResumeDto;
import com.resumeforge.resume_backend.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/resumes")
@RequiredArgsConstructor
public class PublicResumeController {

    private final ResumeService resumeService;

    @GetMapping("/{shareSlug}")
    public PublicResumeDto getPublicResume(@PathVariable String shareSlug) {
        return resumeService.getPublicResume(shareSlug);
    }

    @GetMapping("/{shareSlug}/pdf")
    public ResponseEntity<byte[]> downloadPublicPdf(@PathVariable String shareSlug) {
        byte[] pdf = resumeService.renderPublicPdf(shareSlug);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + shareSlug + ".pdf\"")
                .body(pdf);
    }
}
