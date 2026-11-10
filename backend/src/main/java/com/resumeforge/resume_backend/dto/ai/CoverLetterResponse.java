package com.resumeforge.resume_backend.dto.ai;

public record CoverLetterResponse(
        String salutation,
        String openingParagraph,
        String bodyParagraph1,
        String bodyParagraph2,
        String closingParagraph,
        String signOff,
        String fullLetter
) {}
