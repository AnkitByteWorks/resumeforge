package com.resumeforge.resume_backend.service;

import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
public class TemplateRegistry {

    public record TemplateInfo(
            String id,
            String name,
            String description,
            boolean hasPhoto,
            String category,
            String viewName,
            String baseCssId,
            String accentColor,
            String baseAccentColor,
            String badge,
            boolean featured,
            int sortOrder) {

        public TemplateInfo(String id, String name, String description, boolean hasPhoto, String category, String viewName) {
            this(id, name, description, hasPhoto, category, viewName, id, null, null, null, false, 999);
        }

        public TemplateInfo(String id, String name, String description, boolean hasPhoto, String category) {
            this(id, name, description, hasPhoto, category, "resume/resume", id, null, null, null, false, 999);
        }
    }

    public static final String DEFAULT_TEMPLATE = "modern-02";

    // Strictly the 17 Reference Templates matching C:\Users\ankit\OneDrive\Pictures\Screenshots\Template
    private static final List<TemplateInfo> RAW_TEMPLATES = List.of(
            // 1. Modern Navy (Classic ATS Standard)
            new TemplateInfo("modern-02", "Modern Navy", "Clean sans-serif with deep blue accent headings, maximum ATS parse score", false, "ATS Standard", "resume/resume", "modern-02", "#1f4e79", null, "🎯 99% ATS", true, 1),

            // 2. Foundation Purple (2.foundation.png)
            new TemplateInfo("foundation-purple", "Foundation Purple", "Royal purple banner box with circular headshot & left skills sidebar", true, "Photo & Creative", "resume/resume-foundation", "foundation-purple", "#4a2c82", null, "⭐ TOP PICK", true, 2),

            // 3. Navy Split Sidebar (Mark Griffin)
            new TemplateInfo("split-navy", "Navy Split Sidebar", "Solid navy right sidebar with white text & left chronological timeline", false, "Split Layout", "resume/resume-split-navy", "split-navy", "#1e3a8a", null, "🔥 MOST POPULAR", true, 3),

            // 4. Bennett Minimalist (college-google-docs-resume-template.png)
            new TemplateInfo("minimalist-bennett", "Bennett Minimalist", "Ultra-clean monochrome ATS with horizontal dividers & bottom bar", false, "ATS Standard", "resume/resume-bennett", "minimalist-bennett", "#27272a", null, "✨ EXECUTIVE", true, 4),

            // 5. Austin Highlighter (Austin Bronson)
            new TemplateInfo("austin-yellow", "Austin Highlighter", "High contrast black sidebar with photo & vibrant yellow highlighter name", true, "Photo & Creative", "resume/resume-austin", "austin-yellow", "#facc15", null, "💼 BEST FOR TECH", true, 5),

            // 6. Natalie Timeline (Natalie Edwards)
            new TemplateInfo("teal-timeline", "Natalie Timeline", "Dark teal sidebar, white photo frame, teal badge pills & timeline dots", true, "Split Layout", "resume/resume-timeline", "teal-timeline", "#0d9488", null, "⭐ TOP PICK", true, 6),

            // 7. Jane Editorial (Jane Smith)
            new TemplateInfo("editorial-smith", "Jane Editorial", "Warm cream background, bold 'Hello! I am...' header & thick rules", false, "Modern Minimalist", "resume/resume-editorial", "editorial-smith", "#09090b", null, "✨ STYLISTIC", true, 7),

            // 8. Watson Creative (Sarah Watson)
            new TemplateInfo("creative-watson", "Watson Creative", "Orange & teal geometric outer border frame with photo & icon badges", true, "Photo & Creative", "resume/resume-watson", "creative-watson", "#ea580c", null, "🎨 DESIGNER PICK", true, 8),

            // 9. Lorna Slate (Lorna Alvarado)
            new TemplateInfo("slate-alvarado", "Lorna Slate", "Diagonal slate-blue header with circular photo & timeline node dots", true, "Photo & Creative", "resume/resume-slate-alvarado", "slate-alvarado", "#2563eb", null, "💎 MODERN ATS", true, 9),

            // 10. Nordic Taupe (Catherine Earnshaw)
            new TemplateInfo("nordic-earnshaw", "Nordic Taupe", "Warm beige/taupe sidebar with rectangular photo & editorial typography", true, "Photo & Creative", "resume/resume-nordic", "nordic-earnshaw", "#78716c", null, "🕊️ MINIMALIST", true, 10),

            // 11. Botanical Green (Catherine Bale)
            new TemplateInfo("botanical-bale", "Botanical Green", "Dark botanical green left border accent with top-right headshot", true, "Photo & Creative", "resume/resume-botanical", "botanical-bale", "#164e63", null, null, false, 11),

            // 12. Franklin Mint (Philip Franklin)
            new TemplateInfo("mint-franklin", "Franklin Mint", "Single-column ATS with pastel mint green banner strips", false, "ATS Standard", "resume/resume-mint", "mint-franklin", "#059669", null, null, false, 12),

            // 13. Nick Coral (Nick Koe)
            new TemplateInfo("coral-koe", "Nick Coral", "Coral framed circular headshot, coral job accents & soft blue pills", true, "Photo & Creative", "resume/resume-coral", "coral-koe", "#f87171", null, null, false, 13),

            // 14. Parvati Bordered (Anaisha Parvati)
            new TemplateInfo("executive-parvati", "Parvati Bordered", "Full-page thin border box, centered uppercase & inline 2-col dates", false, "ATS Standard", "resume/resume-parvati", "executive-parvati", "#18181b", null, null, false, 14),

            // 15. Emaa Sky Blue (Emaa Warner)
            new TemplateInfo("sky-warner", "Emaa Sky Blue", "Pastel sky-blue geometric header block with circular photo & dark footer", true, "Photo & Creative", "resume/resume-sky", "sky-warner", "#0284c7", null, null, false, 15),

            // 16. Priya Sage (Priya Ramanathan)
            new TemplateInfo("sage-ramanathan", "Priya Sage", "Sage green circular icon badges & solid sage rounded banner headers", true, "Photo & Creative", "resume/resume-sage", "sage-ramanathan", "#4a7048", null, null, false, 16),

            // 17. Nelly Seafoam (Nelly Smith)
            new TemplateInfo("seafoam-smith", "Nelly Seafoam", "Seafoam green name box, 3-column contact/summary/skills & banner strips", false, "Modern Minimalist", "resume/resume-seafoam", "seafoam-smith", "#0f5132", null, null, false, 17)
    );

    private static final List<TemplateInfo> TEMPLATES = RAW_TEMPLATES.stream()
            .sorted(Comparator.comparingInt(TemplateInfo::sortOrder))
            .toList();

    public List<TemplateInfo> all() {
        return TEMPLATES;
    }

    public TemplateInfo get(String id) {
        String resolved = resolve(id);
        for (TemplateInfo t : TEMPLATES) {
            if (t.id().equalsIgnoreCase(resolved)) {
                return t;
            }
        }
        return TEMPLATES.get(0);
    }

    public String getViewName(String id) {
        TemplateInfo info = get(id);
        return (info != null && info.viewName() != null) ? info.viewName() : "resume/resume";
    }

    public boolean isTwoColumn(String id) {
        TemplateInfo info = get(id);
        String checkId = (info != null && info.baseCssId() != null) ? info.baseCssId() : resolve(id);
        return checkId.startsWith("photo-")
                || checkId.contains("sidebar")
                || checkId.contains("split")
                || checkId.equals("foundation-purple")
                || checkId.equals("austin-yellow")
                || checkId.equals("sky-warner")
                || checkId.equals("teal-timeline")
                || checkId.equals("nordic-earnshaw")
                || checkId.equals("sage-ramanathan")
                || checkId.equals("slate-alvarado")
                || checkId.equals("seafoam-smith")
                || checkId.equals("coral-koe")
                || checkId.equals("creative-watson")
                || checkId.equals("botanical-bale");
    }

    public boolean isFullBleed(String id) {
        TemplateInfo info = get(id);
        String checkId = (info != null && info.baseCssId() != null) ? info.baseCssId() : resolve(id);
        return checkId.equals("foundation-purple")
                || checkId.equals("austin-yellow")
                || checkId.equals("split-navy")
                || checkId.equals("nordic-earnshaw")
                || checkId.equals("teal-timeline")
                || checkId.equals("sage-ramanathan")
                || checkId.equals("slate-alvarado")
                || checkId.equals("botanical-bale")
                || checkId.startsWith("photo-");
    }

    public boolean hasPhoto(String id) {
        TemplateInfo info = get(id);
        return info != null && info.hasPhoto();
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

        if (s.contains("classic") || s.contains("serif")) return "modern-02";
        if (s.contains("modern") || s.contains("navy")) return "modern-02";

        return DEFAULT_TEMPLATE;
    }
}
