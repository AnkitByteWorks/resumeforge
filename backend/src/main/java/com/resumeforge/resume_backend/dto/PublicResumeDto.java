package com.resumeforge.resume_backend.dto;

import com.resumeforge.resume_backend.model.Resume;
import java.time.Instant;
import java.util.List;

public record PublicResumeDto(
        String shareSlug,
        String title,
        String templateId,
        String accentColor,
        String fontFamily,
        Resume.PersonalInfo personalInfo,
        String summary,
        List<Resume.Experience> experience,
        List<Resume.Project> projects,
        List<Resume.Education> education,
        List<String> skills,
        List<String> certifications,
        String renderedHtml,
        Instant updatedAt
) {}
