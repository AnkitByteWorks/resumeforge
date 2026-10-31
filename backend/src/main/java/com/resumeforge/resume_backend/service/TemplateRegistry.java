package com.resumeforge.resume_backend.service;

import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class TemplateRegistry {

    public record TemplateInfo(String id, String name, String description) {}

    public static final String DEFAULT_TEMPLATE = "modern-02";

    private static final List<TemplateInfo> TEMPLATES = List.of(
            new TemplateInfo("classic-01", "Classic", "Serif, centered header, traditional"),
            new TemplateInfo("modern-02", "Modern", "Sans-serif with blue accent headings"));

    public List<TemplateInfo> all() { return TEMPLATES; }

    public boolean exists(String id) {
        if (id == null || id.isBlank()) return false;
        String s = id.trim().toLowerCase();
        return s.equals("classic-01") || s.equals("modern-02") || s.equals("classic") || s.equals("modern");
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
        return DEFAULT_TEMPLATE;
    }
}
