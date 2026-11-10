package com.resumeforge.resume_backend.dto.ai;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record CoverLetterRequest(
        String candidateName,
        String candidateEmail,
        String candidatePhone,
        String candidateLocation,
        String currentRole,
        @NotBlank String companyName,
        @NotBlank String jobTitle,
        String jobDescription,
        String resumeSummary,
        List<String> skills,
        List<String> experienceHighlights,
        String tone
) {
    public CoverLetterRequest(String companyName, String jobTitle, String jobDescription) {
        this(null, null, null, null, null, companyName, jobTitle, jobDescription, null, null, null, "professional");
    }
}
