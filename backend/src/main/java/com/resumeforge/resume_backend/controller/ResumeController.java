package com.resumeforge.resume_backend.controller;

import com.resumeforge.resume_backend.dto.ResumeRequest;
import com.resumeforge.resume_backend.dto.ResumeResponse;
import com.resumeforge.resume_backend.service.ResumeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResumeResponse create(@RequestHeader("X-User-Id") String userId,
                                 @Valid @RequestBody ResumeRequest req) {
        return service.create(userId, req);
    }

    @GetMapping
    public List<ResumeResponse> list(@RequestHeader("X-User-Id") String userId) {
        return service.list(userId);
    }

    @GetMapping("/{id}")
    public ResumeResponse get(@RequestHeader("X-User-Id") String userId,
                              @PathVariable String id) {
        return service.get(userId, id);
    }

    @PutMapping("/{id}")
    public ResumeResponse update(@RequestHeader("X-User-Id") String userId,
                                 @PathVariable String id,
                                 @Valid @RequestBody ResumeRequest req) {
        return service.update(userId, id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestHeader("X-User-Id") String userId,
                       @PathVariable String id) {
        service.delete(userId, id);
    }
}
