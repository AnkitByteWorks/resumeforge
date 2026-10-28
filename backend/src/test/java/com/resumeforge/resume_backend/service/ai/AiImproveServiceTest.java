package com.resumeforge.resume_backend.service.ai;

import com.resumeforge.resume_backend.dto.ai.ResumeDraft;
import com.resumeforge.resume_backend.service.ats.SkillDictionary;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AiImproveServiceTest {

    private ResumeDraft draft(List<String> bullets, List<String> skills) {
        var person = new ResumeDraft.PersonalInfo("A", "a@b.com", "", "", "", "", "");
        var project = new ResumeDraft.Project("App", "Java", "", bullets);
        return new ResumeDraft("t", "classic-01", person, "Student.",
                List.of(), List.of(project), List.of(), skills, List.of());
    }

    @Test
    void flagsNewNumbersAndNewSkills() {
        var before = draft(List.of("Built a REST API."), List.of("Java"));
        var after = draft(List.of("Built a REST API cutting latency by 42%."), List.of("Java", "Kafka"));

        var warnings = AiImproveService.unsupportedClaims(before, after);

        assertTrue(warnings.stream().anyMatch(w -> w.contains("42")));
        assertTrue(warnings.stream().anyMatch(w -> w.contains("Kafka")));
    }

    @Test
    void noWarningsWhenNothingNewIsAdded() {
        var before = draft(List.of("Built a REST API for 200 users."), List.of("Java"));
        var after = draft(List.of("Developed a REST API serving 200 users."), List.of("Java"));

        assertTrue(AiImproveService.unsupportedClaims(before, after).isEmpty());
    }

    @Test
    void flagsBulletsThatMentionNewTechnologies() {
        var before = draft(List.of("made a website for resumes"), List.of("Java"));
        var after = draft(List.of("Wrote unit tests using JUnit.", "Built a website for resumes."), List.of("Java"));

        var flagged = AiImproveService.flaggedBullets(before, after, new SkillDictionary());

        assertEquals(1, flagged.size());
        assertTrue(flagged.values().iterator().next().contains("JUnit"));
    }

    @Test
    void gitIsNotSupportedJustBecauseAGithubFieldExists() {
        var before = draft(List.of("Built an app."), List.of("Java"));
        var after = draft(List.of("Built an app."), List.of("Java", "Git"));

        assertEquals(List.of("Git"), AiImproveService.unsupportedSkills(before, after));
    }
}
