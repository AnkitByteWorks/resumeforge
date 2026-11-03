package com.resumeforge.resume_backend.service.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.resumeforge.resume_backend.dto.ai.*;
import com.resumeforge.resume_backend.model.Resume;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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

    public AiDraftResult parseResumeFromFile(MultipartFile file, String targetRole) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please upload a valid, non-empty PDF file.");
        }
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "resume.pdf";
        if (!originalFilename.toLowerCase().endsWith(".pdf") && !"application/pdf".equalsIgnoreCase(file.getContentType())) {
            throw new IllegalArgumentException("Only PDF files (.pdf) are supported.");
        }
        if (file.getSize() > 15 * 1024 * 1024) {
            throw new IllegalArgumentException("PDF file size must be under 15MB.");
        }

        String rawText;
        try (InputStream is = file.getInputStream();
             PDDocument document = PDDocument.load(is)) {
            if (document.isEncrypted()) {
                throw new IllegalArgumentException("The uploaded PDF is password protected. Please upload an unencrypted PDF.");
            }
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            rawText = stripper.getText(document);
        } catch (IOException e) {
            log.error("Failed to read PDF document: {}", e.getMessage(), e);
            throw new IllegalArgumentException("Failed to read PDF document: " + e.getMessage());
        }

        if (rawText == null || rawText.trim().length() < 30) {
            throw new IllegalArgumentException("We could not extract readable text from this PDF. It may be an image scan or empty. Please copy and paste your resume text instead.");
        }

        String role = (targetRole != null && !targetRole.isBlank()) ? targetRole.trim() : "";

        String systemInstruction = """
                You are an elite ATS resume parser and executive career strategist.
                Your task is to analyze raw text extracted from a candidate's existing resume PDF and extract every detail into a clean, structured, and ATS-optimized resume draft conforming strictly to the provided JSON schema.

                Parsing & Structuring Instructions:
                1. Personal Info:
                   - fullName: Extract accurately from the header/contact block.
                   - email, phone, location (City, State/Country), linkedin, github, portfolio.
                   - headline: Professional headline (e.g. "Senior Software Engineer | Distributed Systems & Cloud").
                2. Title:
                   - A descriptive title like "[FullName] - Resume" or "[Role] Resume".
                3. Template:
                   - Set templateId to "modern-02" by default.
                4. Summary:
                   - Extract the professional summary/profile from the resume. If missing or brief, construct a high-impact 35-50 word professional summary synthesizing their career achievements.
                5. Work Experience:
                   - Extract all roles chronologically.
                   - Extract company name, role/title, startDate (e.g. "Jan 2021" or "2021"), endDate (or "Present"), and current flag.
                   - bullets: Extract accomplishment bullets. Clean up bullet artifacts (like strange bullet characters or trailing broken lines). Reframe each bullet using strong past-tense action verbs (e.g. Engineered, Spearheaded, Architected, Optimized) and keep metrics (%, $, scale, users) intact.
                6. Projects:
                   - Extract key technical projects, tech stack used, links (if present), and outcome bullets.
                7. Education:
                   - Extract institution, degree, field of study, start/end dates, and GPA/score if mentioned.
                8. Skills:
                   - Extract all relevant technical skills, programming languages, frameworks, cloud platforms, and tools as clean individual strings. Deduplicate them.
                9. Certifications:
                   - Extract certifications or licenses.
                10. Follow-up Questions:
                   - Generate 2 to 3 targeted clarifying questions asking the candidate about missing metrics (e.g. team size, latency improvements, dollar impact) or clarifying ambiguities to elevate their resume even further.
                """;

        String userContent = String.format("""
                Target Role Preference: %s
                Filename: %s

                EXTRACTED RESUME RAW TEXT:
                \"\"\"
                %s
                \"\"\"
                """,
                role.isEmpty() ? "Detect from resume experience" : role,
                originalFilename,
                rawText
        );

        try {
            AiDraftResult result = geminiClient.generate(systemInstruction, userContent, AiSchemas.draftSchema(), AiDraftResult.class);
            if (result != null && result.resume() != null) {
                return result;
            }
        } catch (Exception e) {
            log.warn("Gemini resume parsing failed or unavailable: {}. Using heuristic PDF parser fallback.", e.getMessage());
        }

        return fallbackParseResume(rawText, originalFilename, role);
    }

    private AiDraftResult fallbackParseResume(String rawText, String filename, String targetRole) {
        String[] lines = rawText.split("\\R");
        List<String> cleanLines = new ArrayList<>();
        for (String line : lines) {
            String trimmed = line.trim();
            if (!trimmed.isEmpty()) {
                cleanLines.add(trimmed);
            }
        }

        // 1. Extract contact information with regex
        String email = "";
        Matcher emailMatcher = Pattern.compile("(?i)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}").matcher(rawText);
        if (emailMatcher.find()) {
            email = emailMatcher.group().trim();
        }

        String phone = "";
        Matcher phoneMatcher = Pattern.compile("(\\+?\\d{1,3}[-.\\s]?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}").matcher(rawText);
        if (phoneMatcher.find()) {
            phone = phoneMatcher.group().trim();
        }

        String linkedin = "";
        Matcher linkedinMatcher = Pattern.compile("(?i)(https?://)?(www\\.)?linkedin\\.com/in/([a-zA-Z0-9_-]+)").matcher(rawText);
        if (linkedinMatcher.find()) {
            linkedin = linkedinMatcher.group().trim();
        }

        String github = "";
        Matcher githubMatcher = Pattern.compile("(?i)(https?://)?(www\\.)?github\\.com/([a-zA-Z0-9_-]+)").matcher(rawText);
        if (githubMatcher.find()) {
            github = githubMatcher.group().trim();
        }

        // 2. Extract full name (usually first non-contact line)
        String fullName = "";
        for (int i = 0; i < Math.min(cleanLines.size(), 5); i++) {
            String line = cleanLines.get(i);
            if (!line.contains("@") && !line.matches(".*\\d{3}.*") && !line.toLowerCase().contains("http")
                    && !line.toLowerCase().contains("resume") && !line.toLowerCase().contains("curriculum")
                    && line.length() >= 2 && line.length() <= 40) {
                fullName = line;
                break;
            }
        }
        if (fullName.isEmpty()) {
            fullName = "Candidate Name";
        }

        String role = (targetRole != null && !targetRole.isBlank()) ? targetRole.trim() : "Professional";
        String title = fullName + " - Resume";

        // 3. Segment sections
        List<String> skills = new ArrayList<>();
        List<ResumeDraft.Experience> experiences = new ArrayList<>();
        List<ResumeDraft.Education> educationList = new ArrayList<>();
        List<ResumeDraft.Project> projects = new ArrayList<>();
        List<String> certifications = new ArrayList<>();
        StringBuilder summaryBuilder = new StringBuilder();

        String currentSection = "HEADER";
        List<String> currentSectionLines = new ArrayList<>();

        for (String line : cleanLines) {
            String upper = line.toUpperCase().trim();
            String detectedSection = detectSectionHeader(upper);
            if (detectedSection != null) {
                processSection(currentSection, currentSectionLines, summaryBuilder, experiences, educationList, projects, skills, certifications);
                currentSection = detectedSection;
                currentSectionLines.clear();
            } else {
                currentSectionLines.add(line);
            }
        }
        processSection(currentSection, currentSectionLines, summaryBuilder, experiences, educationList, projects, skills, certifications);

        String summary = summaryBuilder.toString().trim();
        if (summary.isEmpty()) {
            summary = String.format("Accomplished %s with a strong track record of success. Adept at driving technical solutions, collaborating with cross-functional teams, and delivering measurable results.", role);
        }

        if (skills.isEmpty()) {
            skills.addAll(List.of("Problem Solving", "Team Collaboration", "Communication", "Project Management"));
        }

        if (experiences.isEmpty()) {
            experiences.add(new ResumeDraft.Experience(
                    "Professional Experience",
                    role,
                    "2022",
                    "Present",
                    true,
                    List.of(
                            "Spearheaded key initiatives resulting in measurable improvements to workflow and system efficiency.",
                            "Collaborated across departments to design, implement, and deliver high-impact deliverables on schedule."
                    )
            ));
        }

        var personalInfo = new ResumeDraft.PersonalInfo(
                fullName,
                email,
                phone,
                "",
                linkedin,
                github,
                "",
                null,
                role
        );

        var draft = new ResumeDraft(
                title,
                "modern-02",
                personalInfo,
                summary,
                experiences,
                projects,
                educationList,
                skills,
                certifications
        );

        var questions = List.of(
                new AiDraftResult.AiQuestion("1", "What was your most notable metric or achievement in your recent position?"),
                new AiDraftResult.AiQuestion("2", "Which specific technologies, tools, or frameworks did you leverage most frequently?"),
                new AiDraftResult.AiQuestion("3", "Are there any additional certifications or projects you'd like to highlight?")
        );

        return new AiDraftResult(draft, questions);
    }

    private String detectSectionHeader(String upper) {
        if (upper.matches("^(WORK\\s+)?EXPERIENCE.*") || upper.matches("^EMPLOYMENT(\\s+HISTORY)?.*") || upper.matches("^CAREER\\s+HISTORY.*")) {
            return "EXPERIENCE";
        }
        if (upper.matches("^EDUCATION.*") || upper.matches("^ACADEMIC(\\s+BACKGROUND)?.*")) {
            return "EDUCATION";
        }
        if (upper.matches("^SKILLS.*") || upper.matches("^TECHNICAL\\s+SKILLS.*") || upper.matches("^CORE\\s+COMPETENCIES.*")) {
            return "SKILLS";
        }
        if (upper.matches("^PROJECTS.*") || upper.matches("^KEY\\s+PROJECTS.*") || upper.matches("^PERSONAL\\s+PROJECTS.*")) {
            return "PROJECTS";
        }
        if (upper.matches("^SUMMARY.*") || upper.matches("^PROFESSIONAL\\s+SUMMARY.*") || upper.matches("^OBJECTIVE.*") || upper.matches("^ABOUT\\s+ME.*")) {
            return "SUMMARY";
        }
        if (upper.matches("^CERTIFICATIONS?.*") || upper.matches("^LICENSES?.*") || upper.matches("^AWARDS.*")) {
            return "CERTIFICATIONS";
        }
        return null;
    }

    private void processSection(String section, List<String> lines, StringBuilder summaryBuilder,
                                List<ResumeDraft.Experience> experiences,
                                List<ResumeDraft.Education> educationList,
                                List<ResumeDraft.Project> projects,
                                List<String> skills,
                                List<String> certifications) {
        if (lines.isEmpty()) return;

        switch (section) {
            case "SUMMARY" -> {
                for (String l : lines) {
                    if (summaryBuilder.length() > 0) summaryBuilder.append(" ");
                    summaryBuilder.append(l);
                }
            }
            case "SKILLS" -> {
                for (String l : lines) {
                    String[] tokens = l.split("[,|•\\-–]");
                    for (String token : tokens) {
                        String s = token.trim();
                        if (!s.isEmpty() && s.length() < 35 && !skills.contains(s)) {
                            skills.add(s);
                        }
                    }
                }
            }
            case "EXPERIENCE" -> {
                String currentCompany = "";
                String currentRole = "";
                String currentStart = "";
                String currentEnd = "";
                List<String> bullets = new ArrayList<>();

                for (String l : lines) {
                    if (l.startsWith("•") || l.startsWith("-") || l.startsWith("*")) {
                        bullets.add(l.replaceFirst("^[•\\-*]\\s*", "").trim());
                    } else if (bullets.isEmpty() && currentCompany.isEmpty()) {
                        currentCompany = l;
                    } else if (bullets.isEmpty() && currentRole.isEmpty()) {
                        currentRole = l;
                    } else {
                        if (l.length() > 20) {
                            bullets.add(l);
                        }
                    }
                }
                if (currentCompany.isEmpty()) currentCompany = "Company Experience";
                if (currentRole.isEmpty()) currentRole = "Role / Title";
                if (bullets.isEmpty()) bullets.add("Contributed to team deliverables and key operational tasks.");

                experiences.add(new ResumeDraft.Experience(
                        currentCompany,
                        currentRole,
                        currentStart.isEmpty() ? "2022" : currentStart,
                        currentEnd.isEmpty() ? "Present" : currentEnd,
                        true,
                        bullets
                ));
            }
            case "EDUCATION" -> {
                String inst = lines.get(0);
                String degree = lines.size() > 1 ? lines.get(1) : "Bachelor's Degree";
                educationList.add(new ResumeDraft.Education(
                        inst,
                        degree,
                        "",
                        "",
                        "",
                        ""
                ));
            }
            case "PROJECTS" -> {
                String name = lines.get(0);
                List<String> pBullets = new ArrayList<>();
                for (int i = 1; i < lines.size(); i++) {
                    pBullets.add(lines.get(i).replaceFirst("^[•\\-*]\\s*", "").trim());
                }
                projects.add(new ResumeDraft.Project(name, "", "", pBullets));
            }
            case "CERTIFICATIONS" -> {
                for (String l : lines) {
                    String cert = l.replaceFirst("^[•\\-*]\\s*", "").trim();
                    if (!cert.isEmpty() && !certifications.contains(cert)) {
                        certifications.add(cert);
                    }
                }
            }
            default -> {
            }
        }
    }
}
