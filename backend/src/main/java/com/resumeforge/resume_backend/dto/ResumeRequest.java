package com.resumeforge.resume_backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public record ResumeRequest(
        @NotBlank @Size(max = 100) String title,
        @NotBlank String templateId,
        @NotNull @Valid PersonalInfoDto personalInfo,
        @Size(max = 1000) String summary,
        @Valid List<ExperienceDto> experience,
        @Valid List<ProjectDto> projects,
        @Valid List<EducationDto> education,
        List<@NotBlank String> skills,
        List<@NotBlank String> certifications
) {
    public record PersonalInfoDto(
            @NotBlank @Size(max = 100) String fullName,
            @NotBlank @Email String email,
            @Size(max = 20) String phone,
            @Size(max = 100) String location,
            String linkedin, String github, String portfolio,
            String photoUrl, String headline) {
        public PersonalInfoDto(String fullName, String email, String phone,
                               String location, String linkedin, String github,
                               String portfolio) {
            this(fullName, email, phone, location, linkedin, github, portfolio, null, null);
        }
    }

    public record ExperienceDto(
            @NotBlank String company, @NotBlank String role,
            String startDate, String endDate, boolean current,
            List<@NotBlank @Size(max = 300) String> bullets) {}

    public record ProjectDto(
            @NotBlank String name, String techStack, String link,
            List<@NotBlank @Size(max = 300) String> bullets) {}

    public record EducationDto(
            @NotBlank String institution, @NotBlank String degree,
            String field, String startDate, String endDate, String score) {}
}
