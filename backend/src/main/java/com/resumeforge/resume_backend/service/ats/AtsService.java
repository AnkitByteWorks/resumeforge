package com.resumeforge.resume_backend.service.ats;

import com.resumeforge.resume_backend.dto.AtsReport;
import com.resumeforge.resume_backend.model.Resume;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AtsService {

    private static final Set<String> ACTION_VERBS = Set.copyOf(List.of(
            "achieved", "administered", "analyzed", "applied", "architected", "automated", "built",
            "collaborated", "completed", "conducted", "configured", "containerized", "coordinated",
            "created", "debugged", "delivered", "deployed", "designed", "developed", "devised",
            "documented", "drove", "engineered", "enhanced", "established", "executed", "formulated",
            "generated", "implemented", "improved", "increased", "integrated", "launched", "led",
            "maintained", "managed", "mentored", "migrated", "modernized", "monitored", "negotiated",
            "optimized", "orchestrated", "organized", "owned", "partnered", "performed", "planned",
            "presented", "produced", "programmed", "published", "reduced", "refactored", "released",
            "researched", "resolved", "restructured", "reviewed", "scaled", "secured", "simplified",
            "solved", "spearheaded", "streamlined", "supervised", "supported", "tested", "trained",
            "transformed", "troubleshot", "upgraded", "validated", "wrote"));

    /** Generic job-description words that should never count as keywords. */
    private static final Set<String> IGNORED_TERMS = Set.copyOf(Arrays.asList((
            "ability,able,about,across,also,applicant,applicants,application,applications,based,build,"
            + "building,business,candidate,candidates,clients,collaborate,company,customers,design,"
            + "develop,developer,developers,development,ensure,environment,etc,excellent,experience,"
            + "experiences,from,good,great,have,help,hiring,include,including,includes,into,join,job,"
            + "knowledge,like,looking,make,more,must,need,needs,opportunity,other,part,plus,position,"
            + "preferred,product,products,project,projects,provide,qualifications,related,required,"
            + "requirements,responsibilities,responsible,role,services,should,skill,skills,software,"
            + "solutions,strong,such,support,system,systems,team,teams,technologies,technology,than,"
            + "that,their,them,they,this,time,tools,understanding,using,well,will,with,within,work,"
            + "working,works,write,year,years,your,what,when,where,which,while,would,these,those,"
            + "being,both,each,every,many,much,some,very,were,been,does,done,just,only,then,there")
            .split(",")));

    private final SkillDictionary dictionary;

    public AtsReport analyze(Resume r, String jobDescription) {
        Tally structure = checkStructure(r);
        Tally content = checkContent(r);
        Tally profile = checkProfile(r);

        KeywordMatch kw = hasText(jobDescription) ? matchKeywords(r, jobDescription) : null;
        boolean useKeywords = kw != null && kw.found();

        List<AtsReport.CategoryScore> categories = new ArrayList<>();
        categories.add(structure.toScore());
        categories.add(content.toScore());
        categories.add(profile.toScore());

        double raw = structure.capped() + content.capped() + profile.capped();
        List<String> suggestions = new ArrayList<>();
        AtsReport.KeywordResult keywordResult = null;
        int score;

        if (useKeywords) {
            double kwPoints = 30 * kw.ratio();
            raw += kwPoints;
            score = (int) Math.round(raw);
            categories.add(new AtsReport.CategoryScore("Keyword match", (int) Math.round(kwPoints), 30, List.of()));
            keywordResult = new AtsReport.KeywordResult(
                    (int) Math.round(kw.ratio() * 100), kw.matched(), kw.missing());
            if (!kw.missing().isEmpty()) {
                suggestions.add("Missing from your resume: "
                        + String.join(", ", kw.missing().stream().limit(10).toList())
                        + ". Add them only if you genuinely have the skill, in your skills section or project bullets.");
            }
        } else {
            score = (int) Math.round(raw / 70.0 * 100);
            suggestions.add(hasText(jobDescription)
                    ? "No clear keywords were found in the job description. Paste the full text of the posting."
                    : "Paste a job description to see how well your resume matches a specific job.");
        }

        categories.forEach(c -> suggestions.addAll(c.issues()));
        score = Math.min(score, 100);

        return new AtsReport(score, grade(score), useKeywords, categories, keywordResult, suggestions);
    }

    // ---------- keyword matching ----------

    private record KeywordMatch(List<String> matched, List<String> missing, double ratio, boolean found) {}

    private KeywordMatch matchKeywords(Resume r, String jobDescription) {
        String resumeNorm = AtsText.normalize(resumeText(r));
        String jdNorm = AtsText.normalize(jobDescription);
        Set<String> resumeTokens = new HashSet<>(Arrays.asList(resumeNorm.split(" ")));

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        Set<String> coveredTokens = new HashSet<>();
        double total = 0;
        double hit = 0;

        // 1) known skills from the dictionary (weight 2)
        for (SkillDictionary.Skill s : dictionary.all()) {
            boolean inJd = s.aliases().stream().anyMatch(a -> AtsText.containsPhrase(jdNorm, a));
            if (!inJd) continue;
            s.aliases().forEach(a -> coveredTokens.addAll(Arrays.asList(a.split(" "))));
            total += 2;
            boolean inResume = s.aliases().stream().anyMatch(a -> AtsText.containsPhrase(resumeNorm, a));
            if (inResume) {
                hit += 2;
                matched.add(s.name());
            } else {
                missing.add(s.name());
            }
        }

        // 2) other terms repeated in the job description (weight 1)
        Map<String, Integer> counts = new HashMap<>();
        for (String t : jdNorm.split(" ")) {
            if (t.matches("[a-z][a-z0-9+#.]{3,}") && !IGNORED_TERMS.contains(t) && !coveredTokens.contains(t)) {
                counts.merge(t, 1, Integer::sum);
            }
        }
        List<String> frequent = counts.entrySet().stream()
                .filter(e -> e.getValue() >= 2)
                .sorted((a, b) -> {
                    int c = Integer.compare(b.getValue(), a.getValue());
                    return c != 0 ? c : a.getKey().compareTo(b.getKey());
                })
                .limit(10)
                .map(Map.Entry::getKey)
                .toList();
        for (String t : frequent) {
            total += 1;
            if (resumeTokens.contains(t)) {
                hit += 1;
                matched.add(t);
            } else {
                missing.add(t);
            }
        }

        return new KeywordMatch(matched, missing, total == 0 ? 0 : hit / total, total > 0);
    }

    private String resumeText(Resume r) {
        List<String> parts = new ArrayList<>();
        parts.add(r.getSummary());
        parts.addAll(safe(r.getSkills()));
        parts.addAll(safe(r.getCertifications()));
        for (var e : safe(r.getExperience())) {
            parts.add(e.role());
            parts.add(e.company());
            parts.addAll(safe(e.bullets()));
        }
        for (var p : safe(r.getProjects())) {
            parts.add(p.name());
            parts.add(p.techStack());
            parts.addAll(safe(p.bullets()));
        }
        for (var e : safe(r.getEducation())) {
            parts.add(e.institution());
            parts.add(e.degree());
            parts.add(e.field());
        }
        return parts.stream().filter(Objects::nonNull).collect(Collectors.joining(" "));
    }

    // ---------- scoring categories ----------

    private Tally checkStructure(Resume r) {
        Tally t = new Tally("Structure & completeness", 30);
        var p = r.getPersonalInfo();

        if (p != null && hasText(p.email())) t.add(5); else t.issue("Add an email address.");
        if (p != null && hasText(p.phone())) t.add(5); else t.issue("Add a phone number.");
        if (p != null && hasText(p.location())) t.add(2); else t.issue("Add your city and country.");
        if (hasText(r.getSummary())) t.add(5); else t.issue("Add a short professional summary.");

        int skills = (int) safe(r.getSkills()).stream().filter(AtsService::hasText).count();
        if (skills >= 8) {
            t.add(5);
        } else if (skills >= 4) {
            t.add(3);
            t.issue("List at least 8 relevant skills (you have " + skills + ").");
        } else {
            t.issue("Add a skills section with at least 8 relevant skills.");
        }

        if (!safe(r.getExperience()).isEmpty() || !safe(r.getProjects()).isEmpty()) t.add(5);
        else t.issue("Add work experience, internships or projects.");

        if (!safe(r.getEducation()).isEmpty()) t.add(3); else t.issue("Add your education.");
        return t;
    }

    private Tally checkContent(Resume r) {
        Tally t = new Tally("Content quality", 30);
        List<String> bullets = bullets(r);
        int n = bullets.size();

        if (n == 0) {
            t.issue("Add bullet points under experience or projects describing what you built and achieved.");
        } else {
            List<String> weak = bullets.stream()
                    .filter(b -> !ACTION_VERBS.contains(firstWord(b))).toList();
            double verbRatio = (n - weak.size()) / (double) n;
            t.add(12 * verbRatio);
            if (verbRatio < 0.8) {
                t.issue(weak.size() + " of " + n + " bullets do not start with a strong action verb "
                        + "(Built, Designed, Implemented...). Example: \"" + shorten(weak.get(0)) + "\"");
            }

            long withNumbers = bullets.stream()
                    .filter(b -> b.chars().anyMatch(Character::isDigit) || b.contains("%")).count();
            double numRatio = withNumbers / (double) n;
            t.add(10 * Math.min(1.0, numRatio / 0.4));
            if (numRatio < 0.4) {
                t.issue("Add measurable results (numbers, percentages, users, time saved) to more bullets.");
            }

            long goodLength = bullets.stream().filter(b -> {
                int w = wordCount(b);
                return w >= 6 && w <= 30;
            }).count();
            double lenRatio = goodLength / (double) n;
            t.add(4 * lenRatio);
            if (lenRatio < 0.8) {
                t.issue("Keep each bullet between 6 and 30 words: one clear achievement per bullet.");
            }
        }

        if (hasText(r.getSummary())) {
            int w = wordCount(r.getSummary());
            if (w >= 20 && w <= 60) {
                t.add(4);
            } else {
                t.add(2);
                t.issue("Keep the summary between 20 and 60 words (currently " + w + ").");
            }
        }
        return t;
    }

    private Tally checkProfile(Resume r) {
        Tally t = new Tally("Profile & links", 10);
        var p = r.getPersonalInfo();
        if (p != null && hasText(p.linkedin())) t.add(4); else t.issue("Add your LinkedIn URL.");
        if (p != null && hasText(p.github())) t.add(3); else t.issue("Add your GitHub URL (important for developer roles).");
        if (bullets(r).size() >= 6) t.add(3);
        else t.issue("Aim for at least 6 bullet points across experience and projects.");
        return t;
    }

    // ---------- helpers ----------

    private static final class Tally {
        private final String name;
        private final int max;
        private double points;
        private final List<String> issues = new ArrayList<>();

        Tally(String name, int max) {
            this.name = name;
            this.max = max;
        }

        void add(double p) { points += p; }
        void issue(String s) { issues.add(s); }
        double capped() { return Math.min(points, max); }

        AtsReport.CategoryScore toScore() {
            return new AtsReport.CategoryScore(name, (int) Math.round(capped()), max, issues);
        }
    }

    private List<String> bullets(Resume r) {
        List<String> out = new ArrayList<>();
        for (var e : safe(r.getExperience())) out.addAll(safe(e.bullets()));
        for (var p : safe(r.getProjects())) out.addAll(safe(p.bullets()));
        return out.stream().filter(AtsService::hasText).toList();
    }

    private static String firstWord(String bullet) {
        String s = bullet.trim().replaceFirst("^[^A-Za-z]+", "");
        int end = 0;
        while (end < s.length() && Character.isLetter(s.charAt(end))) end++;
        return s.substring(0, end).toLowerCase(Locale.ROOT);
    }

    private static int wordCount(String s) {
        String t = s == null ? "" : s.trim();
        return t.isEmpty() ? 0 : t.split("\\s+").length;
    }

    private static String shorten(String s) {
        return s.length() > 70 ? s.substring(0, 67) + "..." : s;
    }

    private static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

    private static <T> List<T> safe(List<T> list) {
        return list == null ? List.of() : list;
    }

    private static String grade(int score) {
        if (score >= 85) return "Excellent";
        if (score >= 70) return "Good";
        if (score >= 50) return "Needs work";
        return "Poor";
    }
}
