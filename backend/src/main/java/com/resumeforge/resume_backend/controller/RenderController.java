package com.resumeforge.resume_backend.controller;

import com.resumeforge.resume_backend.model.Resume;
import com.resumeforge.resume_backend.service.ResumeRenderService;
import com.resumeforge.resume_backend.service.ResumeService;
import com.resumeforge.resume_backend.service.TemplateRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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

    @GetMapping(value = "/resumes/{id}/preview", produces = MediaType.TEXT_HTML_VALUE)
    public String preview(@RequestHeader(value = "X-User-Id", required = false) String header,
                          @RequestParam(value = "userId", required = false) String param,
                          @PathVariable String id) {
        Resume r = resumeService.getEntity(resolve(header, param), id);
        return renderService.renderHtml(r);
    }

    @GetMapping("/resumes/{id}/pdf")
    public ResponseEntity<byte[]> pdf(@RequestHeader(value = "X-User-Id", required = false) String header,
                                      @RequestParam(value = "userId", required = false) String param,
                                      @PathVariable String id) {
        Resume r = resumeService.getEntity(resolve(header, param), id);
        byte[] pdf = renderService.renderPdf(r);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename("resume.pdf").build().toString())
                .body(pdf);
    }

    // TEMPORARY: lets the browser open preview/PDF with ?userId=user1. Removed when JWT auth arrives.
    private String resolve(String header, String param) {
        String uid = header != null ? header : param;
        if (uid == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing X-User-Id or userId");
        }
        return uid;
    }
}
