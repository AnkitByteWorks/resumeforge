package com.resumeforge.resume_backend.service.ats;

import java.util.Locale;

final class AtsText {

    private AtsText() {}

    /** Lowercase, keep letters/digits and + # . (for c++, c#, node.js), collapse whitespace. */
    static String normalize(String s) {
        if (s == null) return "";
        return s.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9+#.\\s]", " ")
                .replaceAll("\\.+(?=\\s|$)", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    /** Whole-word / whole-phrase match on normalized text. */
    static boolean containsPhrase(String normalizedText, String normalizedPhrase) {
        return (" " + normalizedText + " ").contains(" " + normalizedPhrase + " ");
    }
}
