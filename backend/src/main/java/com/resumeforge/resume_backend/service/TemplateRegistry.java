package com.resumeforge.resume_backend.service;

import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class TemplateRegistry {

    public record TemplateInfo(
            String id,
            String name,
            String description,
            boolean hasPhoto,
            String category,
            String viewName) {
        public TemplateInfo(String id, String name, String description, boolean hasPhoto, String category) {
            this(id, name, description, hasPhoto, category, "resume/resume");
        }
    }

    public static final String DEFAULT_TEMPLATE = "modern-02";

    private static final List<TemplateInfo> TEMPLATES = List.of(
            // ATS Standard Single Column
            new TemplateInfo("modern-02", "Modern Navy", "Clean sans-serif with deep blue accent headings", false, "ATS Standard", "resume/resume"),
            new TemplateInfo("classic-01", "Classic Serif", "Traditional serif, centered header, monochrome ATS format", false, "ATS Standard", "resume/resume"),
            new TemplateInfo("emerald-03", "Executive Emerald", "Professional forest emerald accents with clean lines", false, "ATS Standard", "resume/resume"),
            new TemplateInfo("slate-04", "Minimalist Slate", "Subtle charcoal slate, refined typography, high whitespace", false, "ATS Standard", "resume/resume"),
            new TemplateInfo("violet-05", "Tech Violet", "Modern tech startup style with electric purple accents", false, "ATS Standard", "resume/resume"),
            new TemplateInfo("crimson-06", "Ruby Crimson", "Distinguished burgundy ruby accents for executive presence", false, "ATS Standard", "resume/resume"),

            // Exact Templates from user's Template screenshots
            new TemplateInfo("foundation-purple", "Foundation Purple", "Royal purple banner box with circular headshot & left skills sidebar", true, "Photo & Creative", "resume/resume-foundation"),
            new TemplateInfo("split-navy", "Navy Split Sidebar", "Solid navy right sidebar with white text & left timeline", false, "Split Layout", "resume/resume-split-navy"),
            new TemplateInfo("austin-yellow", "Austin Highlighter", "High contrast black sidebar with photo & yellow highlighter name", true, "Photo & Creative", "resume/resume-austin"),
            new TemplateInfo("minimalist-bennett", "Bennett Minimalist", "Ultra-clean monochrome ATS with horizontal dividers & bottom bar", false, "ATS Standard", "resume/resume-bennett"),
            new TemplateInfo("botanical-bale", "Botanical Green", "Dark botanical green left border accent with top-right headshot", true, "Photo & Creative", "resume/resume-botanical"),
            new TemplateInfo("mint-franklin", "Franklin Mint", "Single-column ATS with pastel mint green banner strips", false, "ATS Standard", "resume/resume-mint"),
            new TemplateInfo("creative-watson", "Watson Creative", "Orange & teal geometric outer border frame with photo & icon badges", true, "Photo & Creative", "resume/resume-watson"),
            new TemplateInfo("editorial-smith", "Jane Editorial", "Warm cream background, bold 'Hello! I am...' header & thick rules", false, "Modern Minimalist", "resume/resume-editorial"),
            new TemplateInfo("coral-koe", "Nick Coral", "Coral framed circular headshot, coral job accents & soft blue pills", true, "Photo & Creative", "resume/resume-coral"),
            new TemplateInfo("executive-parvati", "Parvati Bordered", "Full-page thin border box, centered uppercase & inline 2-col dates", false, "ATS Standard", "resume/resume-parvati"),
            new TemplateInfo("sky-warner", "Emaa Sky Blue", "Pastel sky-blue geometric header block with circular photo & dark footer", true, "Photo & Creative", "resume/resume-sky"),
            new TemplateInfo("teal-timeline", "Natalie Timeline", "Dark teal sidebar, white photo frame, teal badge pills & timeline dots", true, "Photo & Creative", "resume/resume-timeline"),
            new TemplateInfo("nordic-earnshaw", "Nordic Taupe", "Warm beige/taupe sidebar with rectangular photo & editorial typography", true, "Photo & Creative", "resume/resume-nordic"),
            new TemplateInfo("sage-ramanathan", "Priya Sage", "Sage green circular icon badges & solid sage rounded banner headers", true, "Photo & Creative", "resume/resume-sage"),
            new TemplateInfo("slate-alvarado", "Lorna Slate", "Diagonal slate-blue header with circular photo & timeline node dots", true, "Photo & Creative", "resume/resume-slate-alvarado"),
            new TemplateInfo("seafoam-smith", "Nelly Seafoam", "Seafoam green name box, 3-column contact/summary/skills & banner strips", false, "Modern Minimalist", "resume/resume-seafoam")
    );

    public List<TemplateInfo> all() { return TEMPLATES; }

    public String getViewName(String id) {
        String resolved = resolve(id);
        for (TemplateInfo t : TEMPLATES) {
            if (t.id().equalsIgnoreCase(resolved)) {
                return t.viewName();
            }
        }
        return "resume/resume";
    }

    public boolean isTwoColumn(String id) {
        String resolved = resolve(id);
        return resolved.startsWith("photo-")
                || resolved.contains("sidebar")
                || resolved.contains("split")
                || resolved.equals("foundation-purple")
                || resolved.equals("austin-yellow")
                || resolved.equals("sky-warner")
                || resolved.equals("teal-timeline")
                || resolved.equals("nordic-earnshaw")
                || resolved.equals("sage-ramanathan")
                || resolved.equals("slate-alvarado");
    }

    public boolean hasPhoto(String id) {
        String resolved = resolve(id);
        for (TemplateInfo t : TEMPLATES) {
            if (t.id().equalsIgnoreCase(resolved)) {
                return t.hasPhoto();
            }
        }
        return false;
    }

    public boolean exists(String id) {
        if (id == null || id.isBlank()) return false;
        String s = id.trim().toLowerCase();
        return TEMPLATES.stream().anyMatch(t -> t.id().equalsIgnoreCase(s))
                || s.contains("classic") || s.contains("modern")
                || s.contains("emerald") || s.contains("slate")
                || s.contains("violet") || s.contains("crimson")
                || s.contains("photo") || s.contains("split")
                || s.contains("foundation") || s.contains("austin")
                || s.contains("bennett") || s.contains("bale")
                || s.contains("franklin") || s.contains("watson")
                || s.contains("editorial") || s.contains("koe")
                || s.contains("parvati") || s.contains("warner")
                || s.contains("timeline") || s.contains("nordic")
                || s.contains("sage") || s.contains("seafoam");
    }

    public String resolve(String id) {
        if (id == null || id.isBlank()) return DEFAULT_TEMPLATE;
        String s = id.trim().toLowerCase();

        // Exact matches
        for (TemplateInfo t : TEMPLATES) {
            if (t.id().equalsIgnoreCase(s)) {
                return t.id();
            }
        }

        // Aliases & smart keyword resolution
        if (s.contains("foundation") || s.equals("photo-sidebar-01")) return "foundation-purple";
        if (s.contains("split") || s.equals("split-navy-04")) return "split-navy";
        if (s.contains("austin") || s.contains("yellow")) return "austin-yellow";
        if (s.contains("bennett") || s.contains("minimalist-bennett")) return "minimalist-bennett";
        if (s.contains("botanical") || s.contains("bale")) return "botanical-bale";
        if (s.contains("franklin") || s.contains("mint")) return "mint-franklin";
        if (s.contains("watson") || s.contains("creative")) return "creative-watson";
        if (s.contains("editorial") || s.contains("smith-editorial") || s.contains("jane")) return "editorial-smith";
        if (s.contains("coral") || s.contains("koe")) return "coral-koe";
        if (s.contains("parvati") || s.contains("anaisha")) return "executive-parvati";
        if (s.contains("sky") || s.contains("warner")) return "sky-warner";
        if (s.contains("timeline") || s.contains("edwards") || s.equals("photo-executive-02")) return "teal-timeline";
        if (s.contains("nordic") || s.contains("earnshaw") || s.equals("photo-nordic-03")) return "nordic-earnshaw";
        if (s.contains("sage") || s.contains("ramanathan") || s.contains("priya")) return "sage-ramanathan";
        if (s.contains("alvarado") || s.contains("lorna")) return "slate-alvarado";
        if (s.contains("seafoam") || s.contains("nelly")) return "seafoam-smith";

        if (s.contains("classic")) return "classic-01";
        if (s.contains("modern")) return "modern-02";
        if (s.contains("emerald")) return "emerald-03";
        if (s.contains("slate")) return "slate-04";
        if (s.contains("violet") || s.contains("tech")) return "violet-05";
        if (s.contains("crimson") || s.contains("ruby")) return "crimson-06";

        return DEFAULT_TEMPLATE;
    }
}
