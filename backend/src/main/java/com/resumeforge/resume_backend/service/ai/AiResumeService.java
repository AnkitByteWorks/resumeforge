package com.resumeforge.resume_backend.service.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.resumeforge.resume_backend.dto.ai.*;
import com.resumeforge.resume_backend.model.Resume;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiResumeService {

    private final GeminiClient geminiClient;

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record BulletAiResult(
            String enhancedBullet,
            List<String> alternativeOptions,
            String actionVerbUsed,
            String explanation
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record SummaryAiResult(
            String primarySummary,
            List<String> alternativeOptions
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TailorAiResult(
            List<String> matchedSkills,
            List<String> missingSkills,
            String tailoredSummary,
            List<TailorResumeResponse.BulletImprovement> suggestedBulletImprovements,
            String overallAdvice
    ) {}

    public EnhanceBulletResponse enhanceBullet(EnhanceBulletRequest request) {
        String systemInstruction = """
                You are an elite technical resume writer and ATS optimization specialist.
                Transform a weak or ordinary resume bullet point into a compelling, metric-driven accomplishment using the STAR (Situation, Task, Action, Result) method.
                Rules:
                1. Always begin with a strong, past-tense action verb (e.g., Architected, Spearheaded, Engineered, Streamlined, Automated).
                2. Quantify results with realistic metrics (e.g., percentages, latency reduction, user scale, hours saved).
                3. Keep the length between 15 and 28 words.
                4. Never use first person ('I', 'we', 'my').
                """;

        String userContent = String.format("""
                Candidate Role: %s
                Technologies / Stack: %s
                Original Bullet: "%s"
                """,
                request.role() != null ? request.role() : "Software Engineer",
                request.techStack() != null ? request.techStack() : "Relevant technologies",
                request.bullet()
        );

        Map<String, Object> schema = Map.of(
                "type", "object",
                "properties", Map.of(
                        "enhancedBullet", Map.of("type", "string"),
                        "alternativeOptions", Map.of("type", "array", "items", Map.of("type", "string")),
                        "actionVerbUsed", Map.of("type", "string"),
                        "explanation", Map.of("type", "string")
                ),
                "required", List.of("enhancedBullet", "alternativeOptions", "actionVerbUsed", "explanation")
        );

        BulletAiResult result = geminiClient.generate(systemInstruction, userContent, schema, BulletAiResult.class);

        return new EnhanceBulletResponse(
                request.bullet(),
                result.enhancedBullet() != null ? result.enhancedBullet() : request.bullet(),
                result.alternativeOptions() != null ? result.alternativeOptions() : List.of(),
                result.actionVerbUsed() != null ? result.actionVerbUsed() : "",
                result.explanation() != null ? result.explanation() : "",
                "gemini"
        );
    }

    public GenerateSummaryResponse generateSummary(GenerateSummaryRequest request) {
        String systemInstruction = """
                You are an executive resume strategist.
                Generate a punchy, ATS-optimized professional summary for a candidate's resume.
                Rules:
                1. Length must be strictly between 35 and 55 words.
                2. Highlight core expertise, tech stack, and quantifiable career impact.
                3. Do not use buzzwords like 'hardworking', 'go-getter', or first-person pronouns ('I', 'me').
                4. Tone should be confident, professional, and tailored to the requested tone.
                """;

        String userContent = String.format("""
                Target Role: %s
                Experience: %s
                Key Skills: %s
                Background / Key Wins: %s
                Desired Tone: %s
                """,
                request.role(),
                request.yearsOfExperience() != null ? request.yearsOfExperience() : "Not specified",
                request.keySkills() != null ? String.join(", ", request.keySkills()) : "General software engineering",
                request.backgroundOrAchievements() != null ? request.backgroundOrAchievements() : "Standard industry background",
                request.tone() != null ? request.tone() : "impactful"
        );

        Map<String, Object> schema = Map.of(
                "type", "object",
                "properties", Map.of(
                        "primarySummary", Map.of("type", "string"),
                        "alternativeOptions", Map.of("type", "array", "items", Map.of("type", "string"))
                ),
                "required", List.of("primarySummary", "alternativeOptions")
        );

        SummaryAiResult result = geminiClient.generate(systemInstruction, userContent, schema, SummaryAiResult.class);

        return new GenerateSummaryResponse(
                result.primarySummary(),
                result.alternativeOptions() != null ? result.alternativeOptions() : List.of(),
                "gemini"
        );
    }

    public TailorResumeResponse tailorResume(Resume resume, String jobDescription) {
        String systemInstruction = """
                You are an expert ATS screening system and senior tech hiring manager.
                Analyze the candidate's current resume against the provided Job Description.
                Deliver actionable optimization suggestions to maximize interview callback rates.
                Rules:
                1. Identify which skills from the Job Description are already present in the resume ("matchedSkills").
                2. Identify high-priority skills/keywords from the Job Description that the candidate is missing ("missingSkills").
                3. Rewrite the candidate's summary so it aligns directly with this job opening ("tailoredSummary").
                4. Choose up to 3 bullets from the candidate's existing experience/projects and rewrite them to highlight relevant keywords ("suggestedBulletImprovements").
                5. Provide a brief 2-sentence overall coaching advice ("overallAdvice").
                """;

        StringBuilder resumeSummary = new StringBuilder();
        resumeSummary.append("Title: ").append(resume.getTitle()).append("\n");
        resumeSummary.append("Summary: ").append(resume.getSummary()).append("\n");
        resumeSummary.append("Skills: ").append(String.join(", ", resume.getSkills() != null ? resume.getSkills() : List.of())).append("\n");

        if (resume.getExperience() != null) {
            resumeSummary.append("Experience Bullets:\n");
            for (var exp : resume.getExperience()) {
                if (exp.bullets() != null) {
                    for (String b : exp.bullets()) {
                        resumeSummary.append("- ").append(b).append("\n");
                    }
                }
            }
        }
        if (resume.getProjects() != null) {
            resumeSummary.append("Project Bullets:\n");
            for (var proj : resume.getProjects()) {
                if (proj.bullets() != null) {
                    for (String b : proj.bullets()) {
                        resumeSummary.append("- ").append(b).append("\n");
                    }
                }
            }
        }

        String userContent = String.format("""
                TARGET JOB DESCRIPTION:
                %s

                CURRENT CANDIDATE RESUME:
                %s
                """,
                jobDescription,
                resumeSummary
        );

        Map<String, Object> schema = Map.of(
                "type", "object",
                "properties", Map.of(
                        "matchedSkills", Map.of("type", "array", "items", Map.of("type", "string")),
                        "missingSkills", Map.of("type", "array", "items", Map.of("type", "string")),
                        "tailoredSummary", Map.of("type", "string"),
                        "suggestedBulletImprovements", Map.of(
                                "type", "array",
                                "items", Map.of(
                                        "type", "object",
                                        "properties", Map.of(
                                                "originalBullet", Map.of("type", "string"),
                                                "suggestedBullet", Map.of("type", "string"),
                                                "reason", Map.of("type", "string")
                                        ),
                                        "required", List.of("originalBullet", "suggestedBullet", "reason")
                                )
                        ),
                        "overallAdvice", Map.of("type", "string")
                ),
                "required", List.of("matchedSkills", "missingSkills", "tailoredSummary", "suggestedBulletImprovements", "overallAdvice")
        );

        TailorAiResult result = geminiClient.generate(systemInstruction, userContent, schema, TailorAiResult.class);

        return new TailorResumeResponse(
                result.matchedSkills() != null ? result.matchedSkills() : List.of(),
                result.missingSkills() != null ? result.missingSkills() : List.of(),
                result.tailoredSummary() != null ? result.tailoredSummary() : "",
                result.suggestedBulletImprovements() != null ? result.suggestedBulletImprovements() : List.of(),
                result.overallAdvice() != null ? result.overallAdvice() : "",
                "gemini"
        );
    }
}
