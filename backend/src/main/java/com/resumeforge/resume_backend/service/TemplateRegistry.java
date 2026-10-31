package com.resumeforge.resume_backend.service;

import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class TemplateRegistry {

    public record TemplateInfo(String id, String name, String description) {}

    public static final String DEFAULT_TEMPLATE = "modern-02";

    private static final List<TemplateInfo> TEMPLATES = List.of(
            new TemplateInfo("classic-01", "Classic Serif", "Traditional serif, centered header, monochrome ATS format"),
            new TemplateInfo("modern-02", "Modern Navy", "Clean sans-serif with deep blue accent headings"),
            new TemplateInfo("emerald-03", "Executive Emerald", "Professional forest emerald accents with clean lines"),
            new TemplateInfo("slate-04", "Minimalist Slate", "Subtle charcoal slate, refined typography, high whitespace"),
            new TemplateInfo("violet-05", "Tech Violet", "Modern tech startup style with electric purple accents"),
            new TemplateInfo("crimson-06", "Ruby Crimson", "Distinguished burgundy ruby accents for executive presence"));

    public List<TemplateInfo> all() { return TEMPLATES; }

    public boolean exists(String id) {
        if (id == null || id.isBlank()) return false;
        String s = id.trim().toLowerCase();
        return TEMPLATES.stream().anyMatch(t -> t.id().equalsIgnoreCase(s))
                || s.equals("classic") || s.equals("modern")
                || s.equals("emerald") || s.equals("slate")
                || s.equals("violet") || s.equals("crimson");
    }

    public String resolve(String id) {
        if (id == null || id.isBlank()) return DEFAULT_TEMPLATE;
        String s = id.trim().toLowerCase();
        if (s.equals("classic") || s.equals("classic-01") || s.contains("classic")) {
            return "classic-01";
        }
        if (s.equals("modern") || s.equals("modern-02") || s.contains("modern")) {
            return "modern-02";
        }
        if (s.equals("emerald") || s.equals("emerald-03") || s.contains("emerald") || s.contains("executive")) {
            return "emerald-03";
        }
        if (s.equals("slate") || s.equals("slate-04") || s.contains("slate") || s.contains("minimal")) {
            return "slate-04";
        }
        if (s.equals("violet") || s.equals("violet-05") || s.contains("violet") || s.contains("tech")) {
            return "violet-05";
        }
        if (s.equals("crimson") || s.equals("crimson-06") || s.contains("crimson") || s.contains("ruby")) {
            return "crimson-06";
        }
        for (TemplateInfo t : TEMPLATES) {
            if (t.id().equalsIgnoreCase(s)) {
                return t.id();
            }
        }
        return DEFAULT_TEMPLATE;
    }
}
