package com.resumeforge.resume_backend.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ResumeDraft(
        String title,
        String templateId,
        PersonalInfo personalInfo,
        String summary,
        List<Experience> experience,
        List<Project> projects,
        List<Education> education,
        List<String> skills,
        List<String> certifications
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PersonalInfo(
            String fullName,
            String email,
            String phone,
            String location,
            String linkedin,
            String github,
            String portfolio,
            String photoUrl,
            String headline
    ) {
        public PersonalInfo(String fullName, String email, String phone,
                            String location, String linkedin, String github,
                            String portfolio) {
            this(fullName, email, phone, location, linkedin, github, portfolio, null, null);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Experience(
            String company,
            String role,
            String startDate,
            String endDate,
            boolean current,
            List<String> bullets
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Project(
            String name,
            String techStack,
            String link,
            List<String> bullets
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Education(
            String institution,
            String degree,
            String field,
            String startDate,
            String endDate,
            String score
    ) {}
}
