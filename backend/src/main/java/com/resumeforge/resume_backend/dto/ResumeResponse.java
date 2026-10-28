package com.resumeforge.resume_backend.dto;

import com.resumeforge.resume_backend.model.Resume;

import java.time.Instant;
import java.util.List;

public record ResumeResponse(
        String id, String title, String templateId,
        Resume.PersonalInfo personalInfo, String summary,
        List<Resume.Experience> experience, List<Resume.Project> projects,
        List<Resume.Education> education, List<String> skills,
        List<String> certifications, Instant createdAt, Instant updatedAt) {

    public static ResumeResponse from(Resume r) {
        return new ResumeResponse(r.getId(), r.getTitle(), r.getTemplateId(),
                r.getPersonalInfo(), r.getSummary(), r.getExperience(),
                r.getProjects(), r.getEducation(), r.getSkills(),
                r.getCertifications(), r.getCreatedAt(), r.getUpdatedAt());
    }
}
