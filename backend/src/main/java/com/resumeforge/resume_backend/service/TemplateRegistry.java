package com.resumeforge.resume_backend.service;

import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class TemplateRegistry {

    public record TemplateInfo(String id, String name, String description) {}

    private static final List<TemplateInfo> TEMPLATES = List.of(
            new TemplateInfo("classic-01", "Classic", "Serif, centered header, traditional"),
            new TemplateInfo("modern-02", "Modern", "Sans-serif with blue accent headings"));

    public List<TemplateInfo> all() { return TEMPLATES; }

    public boolean exists(String id) {
        return TEMPLATES.stream().anyMatch(t -> t.id().equals(id));
    }
}
