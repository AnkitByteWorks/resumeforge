package com.resumeforge.resume_backend.service.ai;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class AiSchemas {

    private AiSchemas() {}

    private static final Map<String, Object> STR = Map.of("type", "string");
    private static final Map<String, Object> BOOL = Map.of("type", "boolean");

    static Map<String, Object> draftSchema() {
        var question = object(p("id", STR, "question", STR));
        return object(p("resume", resumeSchema(), "questions", array(question, 5)));
    }

    static Map<String, Object> improveSchema() {
        return object(p("resume", resumeSchema(),
                "changes", array(STR, 8),
                "needsFromYou", array(STR, 6)));
    }

    private static Map<String, Object> resumeSchema() {
        var personal = object(p("fullName", STR, "email", STR, "phone", STR, "location", STR,
                "linkedin", STR, "github", STR, "portfolio", STR, "photoUrl", STR, "headline", STR));
        var experience = object(p("company", STR, "role", STR, "startDate", STR, "endDate", STR,
                "current", BOOL, "bullets", array(STR, null)));
        var project = object(p("name", STR, "techStack", STR, "link", STR, "bullets", array(STR, null)));
        var education = object(p("institution", STR, "degree", STR, "field", STR,
                "startDate", STR, "endDate", STR, "score", STR));
        return object(p("title", STR, "templateId", STR, "personalInfo", personal,
                "summary", STR, "experience", array(experience, null), "projects", array(project, null),
                "education", array(education, null), "skills", array(STR, null),
                "certifications", array(STR, null)));
    }

    private static Map<String, Object> array(Object items, Integer maxItems) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("type", "array");
        m.put("items", items);
        if (maxItems != null) m.put("maxItems", maxItems);
        return m;
    }

    private static Map<String, Object> object(Map<String, Object> props) {
        return Map.of("type", "object", "properties", props,
                "required", List.copyOf(props.keySet()));
    }

    private static Map<String, Object> p(Object... keyValues) {
        Map<String, Object> m = new LinkedHashMap<>();
        for (int i = 0; i < keyValues.length; i += 2) m.put((String) keyValues[i], keyValues[i + 1]);
        return m;
    }
}
