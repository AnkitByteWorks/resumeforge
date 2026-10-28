package com.resumeforge.resume_backend.dto.ai;

import java.util.List;

public record AiImproveResult(
        ResumeDraft resume,
        List<String> changes,
        List<String> needsFromYou,
        List<String> warnings,
        ScoreChange score,
        List<String> remainingIssues) {

    public record ScoreChange(int before, int after, String gradeBefore, String gradeAfter) {}
}
