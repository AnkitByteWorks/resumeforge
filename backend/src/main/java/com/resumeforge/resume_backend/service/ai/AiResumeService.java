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

    public AiDraftResult generateDraft(GenerateDraftRequest request) {
        String role = request.targetRole() != null && !request.targetRole().isBlank()
                ? request.targetRole().trim()
                : "Software Engineer";

        String systemInstruction = String.format("""
                You are an elite ATS resume builder and professional career strategist.
                Your task is to take the user's background notes, experience, skills, and target role,
                and transform them into a comprehensive, ATS-optimized, high-impact resume draft.

                Strict Rules:
                1. Structure the response strictly conforming to the JSON schema.
                2. Extract or infer:
                   - fullName, email, phone, location, linkedin, github, portfolio (use empty string if missing).
                   - title: e.g. "%s Resume" or role-based title.
                   - templateId: "modern".
                   - summary: 35-55 words, professional, active voice, punchy, tailored to the target role.
                   - experience: array of companies with role, startDate, endDate, current flag, and 2-4 strong action-oriented, metric-driven accomplishment bullets (STAR method, starting with action verbs like Spearheaded, Engineered, Architected, Accelerated).
                   - projects: key technical or business projects with techStack and outcome bullets.
                   - education: institution, degree, field, dates, score.
                   - skills: relevant technical and professional skills as a clean list of strings.
                   - certifications: professional certifications.
                3. Generate 2 to 4 high-value follow-up questions ("questions") asking for missing metrics, team size, tools, or scope that would make the resume significantly stronger.
                4. Never invent fake companies or degrees, but polish and professionally elevate the achievements described.
                """, role);

        String userContent = String.format("""
                Target Role: %s
                Target Job Description: %s

                User Provided Experience / Background Notes:
                %s
                """,
                role,
                request.jobDescription() != null ? request.jobDescription() : "Not specified",
                request.text()
        );

        try {
            AiDraftResult result = geminiClient.generate(systemInstruction, userContent, AiSchemas.draftSchema(), AiDraftResult.class);
            if (result != null && result.resume() != null) {
                return result;
            }
        } catch (Exception e) {
            log.warn("Gemini draft generation failed or unavailable: {}. Using structured fallback generator.", e.getMessage());
        }

        return fallbackDraft(request);
    }

    public AiDraftResult refineDraft(RefineDraftRequest request) {
        String systemInstruction = """
                You are an elite ATS resume writer and career coach.
                You are refining an existing resume draft using the candidate's answers to clarifying questions.
                Rules:
                1. Incorporate the new metrics, team details, technologies, and achievements from the candidate's answers into the experience bullets and project bullets.
                2. Strengthen action verbs and ATS keyword alignment.
                3. Keep the resume structure clean and ATS-friendly.
                4. Return the updated draft and an empty or minimal questions list.
                """;

        StringBuilder answersText = new StringBuilder();
        if (request.answers() != null) {
            for (var a : request.answers()) {
                answersText.append("Q: ").append(a.question()).append("\nA: ").append(a.answer()).append("\n\n");
            }
        }

        String userContent = String.format("""
                Target Role: %s
                Job Description: %s

                Existing Resume Draft:
                %s

                Candidate Answers to Clarifying Questions:
                %s
                """,
                request.targetRole() != null ? request.targetRole() : "",
                request.jobDescription() != null ? request.jobDescription() : "",
                request.draft(),
                answersText
        );

        try {
            AiDraftResult result = geminiClient.generate(systemInstruction, userContent, AiSchemas.draftSchema(), AiDraftResult.class);
            if (result != null && result.resume() != null) {
                return result;
            }
        } catch (Exception e) {
            log.warn("Gemini refine failed or unavailable: {}. Using updated local draft.", e.getMessage());
        }

        return new AiDraftResult(request.draft(), List.of());
    }

    private AiDraftResult fallbackDraft(GenerateDraftRequest request) {
        String role = request.targetRole() != null && !request.targetRole().isBlank()
                ? request.targetRole().trim()
                : "Software Engineer";

        String title = role + " Resume";

        String summary = String.format("Results-driven %s with a strong background in developing scalable solutions and solving complex engineering challenges. Proven track record of delivering clean, efficient code and collaborating across cross-functional teams to exceed goals.", role);

        String[] lines = request.text().split("[\\r\\n]+");
        java.util.List<String> bullets = new java.util.ArrayList<>();
        java.util.List<String> skills = new java.util.ArrayList<>(java.util.List.of("Problem Solving", "Git", "Agile", "Team Collaboration"));

        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.length() > 10 && bullets.size() < 4) {
                bullets.add(trimmed.startsWith("-") || trimmed.startsWith("•")
                        ? trimmed.substring(1).trim()
                        : trimmed);
            }
        }

        if (bullets.isEmpty()) {
            bullets.add("Engineered and maintained key application components, improving system performance and reliability.");
            bullets.add("Collaborated with cross-functional teams to architect and deploy production features on schedule.");
        }

        var experience = java.util.List.of(new ResumeDraft.Experience(
                "Tech Solutions Inc.",
                role,
                "2022",
                "Present",
                true,
                bullets
        ));

        var personalInfo = new ResumeDraft.PersonalInfo(
                "Jane Doe",
                "jane.doe@example.com",
                "+1 (555) 019-2834",
                "San Francisco, CA",
                "linkedin.com/in/janedoe",
                "github.com/janedoe",
                ""
        );

        var draft = new ResumeDraft(
                title,
                "modern",
                personalInfo,
                summary,
                experience,
                java.util.List.of(),
                java.util.List.of(),
                skills,
                java.util.List.of()
        );

        var questions = java.util.List.of(
                new AiDraftResult.AiQuestion("1", "What was your biggest technical achievement or metric in your most recent role?"),
                new AiDraftResult.AiQuestion("2", "What specific technologies, libraries, or tools did you use on your key projects?"),
                new AiDraftResult.AiQuestion("3", "How many team members or users did your work support?")
        );

        return new AiDraftResult(draft, questions);
    }

    public AssistantChatResponse chatWithAssistant(AssistantChatRequest request) {
        String role = request.currentRole() != null && !request.currentRole().isBlank()
                ? request.currentRole().trim()
                : "Candidate";

        String systemInstruction = String.format("""
                You are "ForgeAI", an elite, supportive AI resume and career co-pilot powered by Google Gemini.
                The candidate is crafting or refining their resume targeting the role: "%s".

                Your job:
                1. Answer questions clearly with ATS-optimized resume advice.
                2. Suggest or rewrite metric-driven accomplishment bullets using the STAR method.
                3. Recommend high-value keywords, technologies, and certifications.
                4. Keep responses concise, practical, engaging, and formatted in clean GitHub-style Markdown.
                5. Highlight sample bullet points or snippets that the user can directly copy and paste into their resume.
                """, role);

        StringBuilder prompt = new StringBuilder();
        if (request.contextSnippet() != null && !request.contextSnippet().isBlank()) {
            prompt.append("CURRENT RESUME CONTEXT / DRAFT:\n")
                    .append(request.contextSnippet().trim()).append("\n\n");
        }
        if (request.history() != null && !request.history().isEmpty()) {
            prompt.append("CONVERSATION HISTORY:\n");
            for (var msg : request.history()) {
                if (msg != null && msg.text() != null && !msg.text().isBlank()) {
                    String sender = "user".equalsIgnoreCase(msg.role()) ? "Candidate" : "ForgeAI";
                    prompt.append(sender).append(": ").append(msg.text().trim()).append("\n");
                }
            }
            prompt.append("\n");
        }
        prompt.append("CANDIDATE QUESTION / REQUEST:\n").append(request.message().trim());

        try {
            String reply = geminiClient.generateText(systemInstruction, prompt.toString());
            List<String> suggestions = List.of(
                    "Can you suggest 3 strong bullets for my experience?",
                    "What ATS keywords am I missing?",
                    "How can I quantify my achievements?"
            );
            return new AssistantChatResponse(reply, suggestions, "gemini");
        } catch (Exception e) {
            log.warn("Gemini assistant chat failed: {}. Falling back to smart assistant response.", e.getMessage());
            String fallback = String.format("""
                    ### ATS Tip for %s
                    Focus on **quantifiable business impact** using the STAR framework:
                    - **Action Verb**: Begin with *Architected*, *Spearheaded*, *Engineered*, or *Streamlined*.
                    - **Metric**: Include numbers (e.g., *improved latency by 35%%*, *scaled to 50k DAU*, *reduced build times by 12 mins*).
                    - **Tech Stack**: Explicitly name the tools and libraries you used.
                    """, role);
            return new AssistantChatResponse(fallback, List.of(
                    "Give me an example bullet for " + role,
                    "How to write a punchy 50-word summary"
            ), "fallback");
        }
    }
}
