package com.resumeforge.resume_backend.dto;

import java.util.List;

public record AtsReport(
        int score,
        String grade,
        boolean keywordsAnalyzed,
        List<CategoryScore> categories,
        KeywordResult keywords,
        List<String> suggestions) {

    public record CategoryScore(String name, int score, int maxScore, List<String> issues) {}

    public record KeywordResult(int matchPercent, List<String> matched, List<String> missing) {}
}
