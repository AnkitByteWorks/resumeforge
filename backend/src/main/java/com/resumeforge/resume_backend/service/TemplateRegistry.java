package com.resumeforge.resume_backend.service;

import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class TemplateRegistry {

    public record TemplateInfo(String id, String name, String description, boolean hasPhoto, String category) {
        public TemplateInfo(String id, String name, String description) {
            this(id, name, description, false, "ATS Standard");
        }
    }

    public static final String DEFAULT_TEMPLATE = "modern-02";

    private static final List<TemplateInfo> TEMPLATES = List.of(
            new TemplateInfo("classic-01", "Classic Serif", "Traditional serif, centered header, monochrome ATS format", false, "ATS Standard"),
            new TemplateInfo("modern-02", "Modern Navy", "Clean sans-serif with deep blue accent headings", false, "ATS Standard"),
            new TemplateInfo("emerald-03", "Executive Emerald", "Professional forest emerald accents with clean lines", false, "ATS Standard"),
            new TemplateInfo("slate-04", "Minimalist Slate", "Subtle charcoal slate, refined typography, high whitespace", false, "ATS Standard"),
            new TemplateInfo("violet-05", "Tech Violet", "Modern tech startup style with electric purple accents", false, "ATS Standard"),
            new TemplateInfo("crimson-06", "Ruby Crimson", "Distinguished burgundy ruby accents for executive presence", false, "ATS Standard"),
            new TemplateInfo("photo-sidebar-01", "Foundation Purple (Photo)", "2-column layout with circular headshot & left contact/skills sidebar", true, "Photo & Creative"),
            new TemplateInfo("photo-executive-02", "Executive Emerald (Photo)", "Clean split layout with avatar badge & timeline highlights", true, "Photo & Creative"),
            new TemplateInfo("photo-nordic-03", "Nordic Headshot (Photo)", "Minimalist warm beige sidebar with portrait photo frame", true, "Photo & Creative"),
            new TemplateInfo("split-navy-04", "Navy Split Accent", "Deep navy right sidebar with white text, bold geometry", false, "Split Layout"));

    public List<TemplateInfo> all() { return TEMPLATES; }

    public boolean isTwoColumn(String id) {
        if (id == null) return false;
        String resolved = resolve(id);
        return resolved.startsWith("photo-") || resolved.startsWith("split-");
    }

    public boolean hasPhoto(String id) {
        if (id == null) return false;
        String resolved = resolve(id);
        return resolved.startsWith("photo-");
    }

    public boolean exists(String id) {
        if (id == null || id.isBlank()) return false;
        String s = id.trim().toLowerCase();
        return TEMPLATES.stream().anyMatch(t -> t.id().equalsIgnoreCase(s))
                || s.equals("classic") || s.equals("modern")
                || s.equals("emerald") || s.equals("slate")
                || s.equals("violet") || s.equals("crimson")
                || s.contains("photo") || s.contains("split");
    }

    public String resolve(String id) {
        if (id == null || id.isBlank()) return DEFAULT_TEMPLATE;
        String s = id.trim().toLowerCase();
        if (s.equals("classic") || s.equals("classic-01") || s.contains("classic")) {
            return "classic-01";
        }
        if (s.equals("modern") || s.equals("modern-02") || (s.contains("modern") && !s.contains("photo"))) {
            return "modern-02";
        }
        if (s.equals("emerald") || s.equals("emerald-03") || (s.contains("emerald") && !s.contains("photo"))) {
            return "emerald-03";
        }
        if (s.equals("slate") || s.equals("slate-04") || (s.contains("slate") && !s.contains("photo"))) {
            return "slate-04";
        }
        if (s.equals("violet") || s.equals("violet-05") || s.contains("violet") || s.contains("tech")) {
            return "violet-05";
        }
        if (s.equals("crimson") || s.equals("crimson-06") || s.contains("crimson") || s.contains("ruby")) {
            return "crimson-06";
        }
        if (s.contains("photo-sidebar") || s.equals("photo-sidebar-01") || s.contains("foundation")) {
            return "photo-sidebar-01";
        }
        if (s.contains("photo-executive") || s.equals("photo-executive-02")) {
            return "photo-executive-02";
        }
        if (s.contains("photo-nordic") || s.equals("photo-nordic-03") || s.contains("nordic")) {
            return "photo-nordic-03";
        }
        if (s.contains("split-navy") || s.equals("split-navy-04") || s.contains("split")) {
            return "split-navy-04";
        }
        for (TemplateInfo t : TEMPLATES) {
            if (t.id().equalsIgnoreCase(s)) {
                return t.id();
            }
        }
        return DEFAULT_TEMPLATE;
    }
}
