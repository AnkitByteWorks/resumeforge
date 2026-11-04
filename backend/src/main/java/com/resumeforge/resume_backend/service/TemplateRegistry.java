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

    private static final List<TemplateInfo> RAW_TEMPLATES = List.of(
            // ==========================================
            // TOP PICKS (Rank #1 to #12)
            // ==========================================
            new TemplateInfo("modern-02", "Modern Navy", "Clean sans-serif with deep blue accent headings, high ATS parse rate", false, "ATS Standard", "resume/resume", "modern-02", "#1f4e79", null, "🎯 99% ATS", true, 1),
            new TemplateInfo("foundation-purple", "Foundation Purple", "Royal purple banner box with circular headshot & left skills sidebar", true, "Photo & Creative", "resume/resume-foundation", "foundation-purple", "#4a2c82", null, "⭐ TOP PICK", true, 2),
            new TemplateInfo("split-navy", "Navy Split Sidebar", "Solid navy right sidebar with white text & left chronological timeline", false, "Split Layout", "resume/resume-split-navy", "split-navy", "#1e3a8a", null, "🔥 MOST POPULAR", true, 3),
            new TemplateInfo("minimalist-bennett", "Bennett Minimalist", "Ultra-clean monochrome ATS with horizontal dividers & bottom bar", false, "ATS Standard", "resume/resume-bennett", "minimalist-bennett", "#27272a", null, "✨ EXECUTIVE", true, 4),
            new TemplateInfo("austin-yellow", "Austin Highlighter", "High contrast black sidebar with photo & vibrant yellow highlighter name", true, "Photo & Creative", "resume/resume-austin", "austin-yellow", "#facc15", null, "💼 BEST FOR TECH", true, 5),
            new TemplateInfo("classic-01", "Classic Serif", "Traditional serif, centered header, monochrome standard for finance & law", false, "ATS Standard", "resume/resume", "classic-01", "#111827", null, "📜 TRADITIONAL", true, 6),
            new TemplateInfo("emerald-03", "Executive Emerald", "Professional forest emerald accents with crisp executive dividers", false, "ATS Standard", "resume/resume", "emerald-03", "#047857", null, "🌿 LEADERSHIP", true, 7),
            new TemplateInfo("teal-timeline", "Natalie Timeline", "Dark teal sidebar, white photo frame, teal badge pills & timeline dots", true, "Split Layout", "resume/resume-timeline", "teal-timeline", "#0d9488", null, "⭐ TOP PICK", true, 8),
            new TemplateInfo("editorial-smith", "Jane Editorial", "Warm cream background, bold 'Hello! I am...' header & thick rules", false, "Modern Minimalist", "resume/resume-editorial", "editorial-smith", "#09090b", null, "✨ STYLISTIC", true, 9),
            new TemplateInfo("creative-watson", "Watson Creative", "Orange & teal geometric outer border frame with photo & icon badges", true, "Photo & Creative", "resume/resume-watson", "creative-watson", "#ea580c", null, "🎨 DESIGNER PICK", true, 10),
            new TemplateInfo("slate-alvarado", "Lorna Slate", "Diagonal slate-blue header with circular photo & timeline node dots", true, "Photo & Creative", "resume/resume-slate-alvarado", "slate-alvarado", "#2563eb", null, "💎 MODERN ATS", true, 11),
            new TemplateInfo("nordic-earnshaw", "Nordic Taupe", "Warm beige/taupe sidebar with rectangular photo & editorial typography", true, "Photo & Creative", "resume/resume-nordic", "nordic-earnshaw", "#78716c", null, "🕊️ MINIMALIST", true, 12),

            // ==========================================
            // ARCHETYPE 1: MODERN ATS (Variants 13-17)
            // ==========================================
            new TemplateInfo("modern-emerald", "Modern Forest Emerald", "Clean single-column ATS with deep emerald green accent lines", false, "ATS Standard", "resume/resume", "modern-02", "#047857", "#1f4e79", null, false, 13),
            new TemplateInfo("modern-crimson", "Modern Ruby Crimson", "Clean single-column ATS with distinguished ruby red heading rules", false, "ATS Standard", "resume/resume", "modern-02", "#9f1239", "#1f4e79", null, false, 14),
            new TemplateInfo("modern-charcoal", "Modern Charcoal Noir", "Minimalist single-column ATS with graphite black accent rules", false, "ATS Standard", "resume/resume", "modern-02", "#18181b", "#1f4e79", null, false, 15),
            new TemplateInfo("modern-purple", "Modern Royal Violet", "Contemporary single-column ATS with bold violet purple highlights", false, "ATS Standard", "resume/resume", "modern-02", "#6d28d9", "#1f4e79", null, false, 16),
            new TemplateInfo("modern-amber", "Modern Amber Gold", "Warm professional single-column ATS with amber bronze styling", false, "ATS Standard", "resume/resume", "modern-02", "#d97706", "#1f4e79", null, false, 17),

            // ==========================================
            // ARCHETYPE 2: FOUNDATION (Variants 18-22)
            // ==========================================
            new TemplateInfo("foundation-navy", "Foundation Corporate Navy", "Executive navy top banner with circular avatar and skills sidebar", true, "Photo & Creative", "resume/resume-foundation", "foundation-purple", "#1e3a8a", "#4a2c82", "🔥 POPULAR", false, 18),
            new TemplateInfo("foundation-emerald", "Foundation Forest Emerald", "Forest green top banner with circular avatar and structured sidebar", true, "Photo & Creative", "resume/resume-foundation", "foundation-purple", "#047857", "#4a2c82", null, false, 19),
            new TemplateInfo("foundation-crimson", "Foundation Burgundy Ruby", "Burgundy ruby banner with headshot frame and clean badges", true, "Photo & Creative", "resume/resume-foundation", "foundation-purple", "#9f1239", "#4a2c82", null, false, 20),
            new TemplateInfo("foundation-charcoal", "Foundation Midnight Charcoal", "Pitch-black executive banner with circular headshot and dark accents", true, "Photo & Creative", "resume/resume-foundation", "foundation-purple", "#18181b", "#4a2c82", null, false, 21),
            new TemplateInfo("foundation-teal", "Foundation Ocean Teal", "Deep ocean teal banner with headshot frame and skill badges", true, "Photo & Creative", "resume/resume-foundation", "foundation-purple", "#0d9488", "#4a2c82", null, false, 22),

            // ==========================================
            // ARCHETYPE 3: SPLIT SIDEBAR (Variants 23-27)
            // ==========================================
            new TemplateInfo("split-emerald", "Emerald Split Sidebar", "Solid forest green sidebar with white typography & timeline", false, "Split Layout", "resume/resume-split-navy", "split-navy", "#047857", "#1e3a8a", null, false, 23),
            new TemplateInfo("split-charcoal", "Onyx Split Sidebar", "Solid graphite charcoal sidebar with high-contrast timeline", false, "Split Layout", "resume/resume-split-navy", "split-navy", "#18181b", "#1e3a8a", "✨ EXECUTIVE", false, 24),
            new TemplateInfo("split-purple", "Violet Split Sidebar", "Solid deep violet sidebar with white typography & left timeline", false, "Split Layout", "resume/resume-split-navy", "split-navy", "#581c87", "#1e3a8a", null, false, 25),
            new TemplateInfo("split-crimson", "Crimson Split Sidebar", "Solid burgundy crimson sidebar with clean chronological timeline", false, "Split Layout", "resume/resume-split-navy", "split-navy", "#881337", "#1e3a8a", null, false, 26),
            new TemplateInfo("split-teal", "Teal Split Sidebar", "Solid deep teal sidebar with white text & chronological layout", false, "Split Layout", "resume/resume-split-navy", "split-navy", "#115e59", "#1e3a8a", null, false, 27),

            // ==========================================
            // ARCHETYPE 4: BENNETT MINIMALIST (Variants 28-32)
            // ==========================================
            new TemplateInfo("bennett-navy", "Bennett Corporate Navy", "Minimalist horizontal dividing rules in corporate navy blue", false, "ATS Standard", "resume/resume-bennett", "minimalist-bennett", "#1e3a8a", "#27272a", null, false, 28),
            new TemplateInfo("bennett-emerald", "Bennett Forest Emerald", "Ultra-clean minimalist structure in dark forest emerald", false, "ATS Standard", "resume/resume-bennett", "minimalist-bennett", "#047857", "#27272a", null, false, 29),
            new TemplateInfo("bennett-burgundy", "Bennett Deep Burgundy", "Distinguished minimalist horizontal rules in burgundy crimson", false, "ATS Standard", "resume/resume-bennett", "minimalist-bennett", "#9f1239", "#27272a", null, false, 30),
            new TemplateInfo("bennett-slate", "Bennett Slate Gray", "Soft graphite slate horizontal dividers with clean whitespace", false, "ATS Standard", "resume/resume-bennett", "minimalist-bennett", "#475569", "#27272a", null, false, 31),
            new TemplateInfo("bennett-amber", "Bennett Amber Bronze", "Warm bronze minimalist dividers for consulting & advisory", false, "ATS Standard", "resume/resume-bennett", "minimalist-bennett", "#b45309", "#27272a", null, false, 32),

            // ==========================================
            // ARCHETYPE 5: AUSTIN HIGHLIGHTER (Variants 33-37)
            // ==========================================
            new TemplateInfo("austin-cyan", "Austin Neon Cyan", "Black photo sidebar with vibrant electric cyan highlighter name", true, "Photo & Creative", "resume/resume-austin", "austin-yellow", "#06b6d4", "#facc15", null, false, 33),
            new TemplateInfo("austin-emerald", "Austin Neon Emerald", "High contrast black sidebar with bright lime-emerald highlighter name", true, "Photo & Creative", "resume/resume-austin", "austin-yellow", "#10b981", "#facc15", null, false, 34),
            new TemplateInfo("austin-rose", "Austin Vibrant Coral", "Pitch-black photo sidebar with bright coral rose name header", true, "Photo & Creative", "resume/resume-austin", "austin-yellow", "#f43f5e", "#facc15", null, false, 35),
            new TemplateInfo("austin-violet", "Austin Electric Violet", "Black photo sidebar with neon purple highlighter name accent", true, "Photo & Creative", "resume/resume-austin", "austin-yellow", "#8b5cf6", "#facc15", null, false, 36),
            new TemplateInfo("austin-orange", "Austin Blaze Orange", "High-contrast dark sidebar with vivid blaze orange name accent", true, "Photo & Creative", "resume/resume-austin", "austin-yellow", "#f97316", "#facc15", null, false, 37),

            // ==========================================
            // ARCHETYPE 6: CLASSIC SERIF (Variants 38-42)
            // ==========================================
            new TemplateInfo("classic-navy", "Classic Oxford Navy", "Centered traditional serif format with dignified Oxford navy accents", false, "ATS Standard", "resume/resume", "classic-01", "#1e3a8a", "#111827", null, false, 38),
            new TemplateInfo("classic-emerald", "Classic Cambridge Emerald", "Traditional serif structure with prestigious dark green accents", false, "ATS Standard", "resume/resume", "classic-01", "#065f46", "#111827", null, false, 39),
            new TemplateInfo("classic-burgundy", "Classic Harvard Crimson", "Timeless centered serif resume with deep Harvard crimson rules", false, "ATS Standard", "resume/resume", "classic-01", "#831843", "#111827", null, false, 40),
            new TemplateInfo("classic-slate", "Classic Charcoal Slate", "Elegant serif layout with refined graphite gray typography", false, "ATS Standard", "resume/resume", "classic-01", "#334155", "#111827", null, false, 41),
            new TemplateInfo("classic-gold", "Classic Antique Gold", "Traditional serif layout with distinguished antique bronze accents", false, "ATS Standard", "resume/resume", "classic-01", "#92400e", "#111827", null, false, 42),

            // ==========================================
            // ARCHETYPE 7: EXECUTIVE EMERALD (Variants 43-47)
            // ==========================================
            new TemplateInfo("emerald-navy", "Executive Navy Steel", "Senior executive layout with deep steel navy section borders", false, "ATS Standard", "resume/resume", "emerald-03", "#1e3a8a", "#047857", null, false, 43),
            new TemplateInfo("emerald-ruby", "Executive Deep Ruby", "Leadership ATS format with distinguished dark ruby red accents", false, "ATS Standard", "resume/resume", "emerald-03", "#9f1239", "#047857", null, false, 44),
            new TemplateInfo("emerald-charcoal", "Executive Imperial Onyx", "C-Suite executive layout in crisp, ultra-clean monochrome black", false, "ATS Standard", "resume/resume", "emerald-03", "#18181b", "#047857", null, false, 45),
            new TemplateInfo("emerald-violet", "Executive Royal Purple", "Executive ATS layout with authoritative royal purple divider rules", false, "ATS Standard", "resume/resume", "emerald-03", "#6d28d9", "#047857", null, false, 46),
            new TemplateInfo("emerald-bronze", "Executive Warm Bronze", "Executive format with warm Tuscan bronze accent lines", false, "ATS Standard", "resume/resume", "emerald-03", "#78350f", "#047857", null, false, 47),

            // ==========================================
            // ARCHETYPE 8: NATALIE TIMELINE (Variants 48-52)
            // ==========================================
            new TemplateInfo("timeline-navy", "Timeline Midnight Navy", "Solid midnight navy sidebar with timeline nodes & pill badges", true, "Split Layout", "resume/resume-timeline", "teal-timeline", "#1e3a8a", "#0d9488", null, false, 48),
            new TemplateInfo("timeline-emerald", "Timeline Forest Green", "Deep green sidebar with connected timeline nodes and white photo frame", true, "Split Layout", "resume/resume-timeline", "teal-timeline", "#047857", "#0d9488", null, false, 49),
            new TemplateInfo("timeline-violet", "Timeline Electric Purple", "Rich violet purple sidebar with connected career milestone dots", true, "Split Layout", "resume/resume-timeline", "teal-timeline", "#7c3aed", "#0d9488", null, false, 50),
            new TemplateInfo("timeline-crimson", "Timeline Rose Crimson", "Burgundy sidebar with circular photo frame and timeline badges", true, "Split Layout", "resume/resume-timeline", "teal-timeline", "#be123c", "#0d9488", null, false, 51),
            new TemplateInfo("timeline-slate", "Timeline Graphite", "Charcoal slate sidebar with white avatar frame and clean nodes", true, "Split Layout", "resume/resume-timeline", "teal-timeline", "#334155", "#0d9488", null, false, 52),

            // ==========================================
            // ARCHETYPE 9: JANE EDITORIAL (Variants 53-57)
            // ==========================================
            new TemplateInfo("editorial-navy", "Editorial Deep Navy", "Editorial cream page with bold 'Hello!' in deep nautical navy", false, "Modern Minimalist", "resume/resume-editorial", "editorial-smith", "#1e3a8a", "#09090b", null, false, 53),
            new TemplateInfo("editorial-burgundy", "Editorial Wine Red", "Stylistic editorial format with rich wine red headers and rules", false, "Modern Minimalist", "resume/resume-editorial", "editorial-smith", "#881337", "#09090b", null, false, 54),
            new TemplateInfo("editorial-emerald", "Editorial Dark Pine", "Editorial magazine typography with dark forest pine green lines", false, "Modern Minimalist", "resume/resume-editorial", "editorial-smith", "#064e3b", "#09090b", null, false, 55),
            new TemplateInfo("editorial-taupe", "Editorial Warm Taupe", "Minimalist cream page with warm taupe earth-tone dividers", false, "Modern Minimalist", "resume/resume-editorial", "editorial-smith", "#57534e", "#09090b", null, false, 56),
            new TemplateInfo("editorial-violet", "Editorial Plum Velvet", "Bold editorial serif typography with deep velvet plum headers", false, "Modern Minimalist", "resume/resume-editorial", "editorial-smith", "#581c87", "#09090b", null, false, 57),

            // ==========================================
            // ARCHETYPE 10: WATSON CREATIVE (Variants 58-62)
            // ==========================================
            new TemplateInfo("watson-navy", "Watson Geometric Navy", "Geometric outer frame in deep corporate navy with skill badges", true, "Photo & Creative", "resume/resume-watson", "creative-watson", "#1e3a8a", "#ea580c", null, false, 58),
            new TemplateInfo("watson-purple", "Watson Electric Indigo", "Vibrant indigo geometric outer border frame with photo icon badges", true, "Photo & Creative", "resume/resume-watson", "creative-watson", "#6366f1", "#ea580c", null, false, 59),
            new TemplateInfo("watson-emerald", "Watson Emerald Mint", "Geometric border layout in emerald green with stylish icon badges", true, "Photo & Creative", "resume/resume-watson", "creative-watson", "#059669", "#ea580c", null, false, 60),
            new TemplateInfo("watson-crimson", "Watson Ruby Sunset", "Crimson ruby outer frame with circular avatar & graphic pill tags", true, "Photo & Creative", "resume/resume-watson", "creative-watson", "#e11d48", "#ea580c", null, false, 61),
            new TemplateInfo("watson-charcoal", "Watson Monochrome Bold", "High-contrast monochrome geometric frame with sharp icon tags", true, "Photo & Creative", "resume/resume-watson", "creative-watson", "#18181b", "#ea580c", null, false, 62),

            // ==========================================
            // ARCHETYPE 11: LORNA SLATE (Variants 63-67)
            // ==========================================
            new TemplateInfo("alvarado-purple", "Alvarado Royal Amethyst", "Diagonal royal purple header with avatar & chronological node dots", true, "Photo & Creative", "resume/resume-slate-alvarado", "slate-alvarado", "#7c3aed", "#2563eb", null, false, 63),
            new TemplateInfo("alvarado-emerald", "Alvarado Jade Green", "Diagonal emerald header block with circular avatar & timeline", true, "Photo & Creative", "resume/resume-slate-alvarado", "slate-alvarado", "#059669", "#2563eb", null, false, 64),
            new TemplateInfo("alvarado-crimson", "Alvarado Scarlet Red", "Diagonal scarlet header with photo & chronological milestone line", true, "Photo & Creative", "resume/resume-slate-alvarado", "slate-alvarado", "#dc2626", "#2563eb", null, false, 65),
            new TemplateInfo("alvarado-amber", "Alvarado Golden Sunset", "Warm amber diagonal banner with circular photo & timeline nodes", true, "Photo & Creative", "resume/resume-slate-alvarado", "slate-alvarado", "#d97706", "#2563eb", null, false, 66),
            new TemplateInfo("alvarado-graphite", "Alvarado Pitch Charcoal", "Graphite charcoal diagonal header with professional node layout", true, "Photo & Creative", "resume/resume-slate-alvarado", "slate-alvarado", "#1e293b", "#2563eb", null, false, 67),

            // ==========================================
            // ARCHETYPE 12: NORDIC TAUPE (Variants 68-72)
            // ==========================================
            new TemplateInfo("nordic-navy", "Nordic Fjord Navy", "Scandinavian taupe layout with deep fjord navy accents and photo", true, "Photo & Creative", "resume/resume-nordic", "nordic-earnshaw", "#1e3a8a", "#78716c", null, false, 68),
            new TemplateInfo("nordic-emerald", "Nordic Forest Green", "Minimalist Scandinavian design with evergreen forest sidebar accents", true, "Photo & Creative", "resume/resume-nordic", "nordic-earnshaw", "#065f46", "#78716c", null, false, 69),
            new TemplateInfo("nordic-terracotta", "Nordic Terracotta Clay", "Warm earth-tone terracotta sidebar with rectangular photo frame", true, "Photo & Creative", "resume/resume-nordic", "nordic-earnshaw", "#c2410c", "#78716c", null, false, 70),
            new TemplateInfo("nordic-charcoal", "Nordic Scandinavian Noir", "Ultra-minimalist monochrome sidebar with structured photo layout", true, "Photo & Creative", "resume/resume-nordic", "nordic-earnshaw", "#1c1917", "#78716c", null, false, 71),
            new TemplateInfo("nordic-violet", "Nordic Heather Violet", "Soft Nordic beige aesthetic with muted heather violet accents", true, "Photo & Creative", "resume/resume-nordic", "nordic-earnshaw", "#7e22ce", "#78716c", null, false, 72),

            // ==========================================
            // ARCHETYPE 13: FRANKLIN MINT (Variants 73-78)
            // ==========================================
            new TemplateInfo("mint-franklin", "Franklin Mint", "Single-column ATS with pastel mint green banner strips", false, "ATS Standard", "resume/resume-mint", "mint-franklin", "#059669", null, null, false, 73),
            new TemplateInfo("franklin-navy", "Franklin Pastel Navy", "Single-column ATS with soft pastel blue banner headings", false, "ATS Standard", "resume/resume-mint", "mint-franklin", "#2563eb", "#059669", null, false, 74),
            new TemplateInfo("franklin-purple", "Franklin Lavender Tint", "Clean single-column ATS with soft lavender banner accents", false, "ATS Standard", "resume/resume-mint", "mint-franklin", "#9333ea", "#059669", null, false, 75),
            new TemplateInfo("franklin-rose", "Franklin Pastel Rose", "Pastel rose banner strip headings for clean ATS compliance", false, "ATS Standard", "resume/resume-mint", "mint-franklin", "#e11d48", "#059669", null, false, 76),
            new TemplateInfo("franklin-amber", "Franklin Warm Apricot", "Warm apricot banner strip headings with clean typography", false, "ATS Standard", "resume/resume-mint", "mint-franklin", "#d97706", "#059669", null, false, 77),
            new TemplateInfo("franklin-slate", "Franklin Soft Graphite", "Subtle graphite banner strips with modern sans-serif type", false, "ATS Standard", "resume/resume-mint", "mint-franklin", "#475569", "#059669", null, false, 78),

            // ==========================================
            // ARCHETYPE 14: BOTANICAL BALE (Variants 79-84)
            // ==========================================
            new TemplateInfo("botanical-bale", "Botanical Green", "Dark botanical green left border accent with top-right headshot", true, "Photo & Creative", "resume/resume-botanical", "botanical-bale", "#164e63", null, null, false, 79),
            new TemplateInfo("botanical-navy", "Botanical Deep Sea", "Left ocean navy vertical bar accent with circular top photo", true, "Photo & Creative", "resume/resume-botanical", "botanical-bale", "#1e3a8a", "#164e63", null, false, 80),
            new TemplateInfo("botanical-purple", "Botanical Royal Orchid", "Royal orchid purple vertical bar accent with headshot display", true, "Photo & Creative", "resume/resume-botanical", "botanical-bale", "#581c87", "#164e63", null, false, 81),
            new TemplateInfo("botanical-crimson", "Botanical Red Cedar", "Deep cedar crimson vertical stripe with clean resume structure", true, "Photo & Creative", "resume/resume-botanical", "botanical-bale", "#991b1b", "#164e63", null, false, 82),
            new TemplateInfo("botanical-charcoal", "Botanical Black Olive", "Monochrome black left accent stripe with modern typography", true, "Photo & Creative", "resume/resume-botanical", "botanical-bale", "#18181b", "#164e63", null, false, 83),
            new TemplateInfo("botanical-amber", "Botanical Autumn Amber", "Warm golden amber vertical accent with top headshot frame", true, "Photo & Creative", "resume/resume-botanical", "botanical-bale", "#b45309", "#164e63", null, false, 84),

            // ==========================================
            // ARCHETYPE 15: NICK CORAL (Variants 85-90)
            // ==========================================
            new TemplateInfo("coral-koe", "Nick Coral", "Coral framed circular headshot, coral job accents & soft blue pills", true, "Photo & Creative", "resume/resume-coral", "coral-koe", "#f87171", null, null, false, 85),
            new TemplateInfo("coral-cyan", "Nick Aegean Cyan", "Aegean cyan photo frame with matching pill badges and job accents", true, "Photo & Creative", "resume/resume-coral", "coral-koe", "#0284c7", "#f87171", null, false, 86),
            new TemplateInfo("coral-emerald", "Nick Spring Emerald", "Spring emerald framed avatar with soft green badge tags", true, "Photo & Creative", "resume/resume-coral", "coral-koe", "#10b981", "#f87171", null, false, 87),
            new TemplateInfo("coral-purple", "Nick Pastel Violet", "Soft pastel violet photo border with matching pill tags", true, "Photo & Creative", "resume/resume-coral", "coral-koe", "#8b5cf6", "#f87171", null, false, 88),
            new TemplateInfo("coral-amber", "Nick Marigold Gold", "Vibrant marigold photo frame with gold badge accents", true, "Photo & Creative", "resume/resume-coral", "coral-koe", "#f59e0b", "#f87171", null, false, 89),
            new TemplateInfo("coral-noir", "Nick Monochrome Chic", "Chic charcoal avatar border with subtle graphite pill tags", true, "Photo & Creative", "resume/resume-coral", "coral-koe", "#27272a", "#f87171", null, false, 90),

            // ==========================================
            // ARCHETYPE 16: PARVATI BORDERED (Variants 91-96)
            // ==========================================
            new TemplateInfo("executive-parvati", "Parvati Bordered", "Full-page thin border box, centered uppercase & inline 2-col dates", false, "ATS Standard", "resume/resume-parvati", "executive-parvati", "#18181b", null, null, false, 91),
            new TemplateInfo("parvati-navy", "Parvati Diplomat Navy", "Full-page thin navy framing box with dignified uppercase headings", false, "ATS Standard", "resume/resume-parvati", "executive-parvati", "#1e3a8a", "#18181b", null, false, 92),
            new TemplateInfo("parvati-emerald", "Parvati Sovereign Emerald", "Full-page thin forest emerald border with symmetrical executive type", false, "ATS Standard", "resume/resume-parvati", "executive-parvati", "#065f46", "#18181b", null, false, 93),
            new TemplateInfo("parvati-crimson", "Parvati Royal Crimson", "Full-page thin burgundy border with elegant centered header", false, "ATS Standard", "resume/resume-parvati", "executive-parvati", "#881337", "#18181b", null, false, 94),
            new TemplateInfo("parvati-gold", "Parvati Chancellor Gold", "Full-page antique gold border box with classical centered layout", false, "ATS Standard", "resume/resume-parvati", "executive-parvati", "#92400e", "#18181b", null, false, 95),
            new TemplateInfo("parvati-slate", "Parvati Oxford Slate", "Full-page thin slate border frame with understated legal elegance", false, "ATS Standard", "resume/resume-parvati", "executive-parvati", "#334155", "#18181b", null, false, 96),

            // ==========================================
            // ARCHETYPE 17: EMAA SKY (Variants 97-102)
            // ==========================================
            new TemplateInfo("sky-warner", "Emaa Sky Blue", "Pastel sky-blue geometric header block with circular photo & dark footer", true, "Photo & Creative", "resume/resume-sky", "sky-warner", "#0284c7", null, null, false, 97),
            new TemplateInfo("sky-indigo", "Emaa Midnight Indigo", "Midnight indigo geometric header block with circular photo frame", true, "Photo & Creative", "resume/resume-sky", "sky-warner", "#4338ca", "#0284c7", null, false, 98),
            new TemplateInfo("sky-emerald", "Emaa Jade Wave", "Jade emerald geometric top block with avatar and clean columns", true, "Photo & Creative", "resume/resume-sky", "sky-warner", "#059669", "#0284c7", null, false, 99),
            new TemplateInfo("sky-rose", "Emaa Blushing Rose", "Blush rose geometric header block with circular avatar frame", true, "Photo & Creative", "resume/resume-sky", "sky-warner", "#e11d48", "#0284c7", null, false, 100),
            new TemplateInfo("sky-amber", "Emaa Sunset Gold", "Warm sunset gold header block with headshot display & footer", true, "Photo & Creative", "resume/resume-sky", "sky-warner", "#d97706", "#0284c7", null, false, 101),
            new TemplateInfo("sky-charcoal", "Emaa Carbon Studio", "Graphite carbon geometric top block with modern typography", true, "Photo & Creative", "resume/resume-sky", "sky-warner", "#18181b", "#0284c7", null, false, 102),

            // ==========================================
            // ARCHETYPE 18: PRIYA SAGE & NELLY SEAFOAM (Variants 103-108)
            // ==========================================
            new TemplateInfo("sage-ramanathan", "Priya Sage", "Sage green circular icon badges & solid sage rounded banner headers", true, "Photo & Creative", "resume/resume-sage", "sage-ramanathan", "#4a7048", null, null, false, 103),
            new TemplateInfo("sage-navy", "Priya Twilight Navy", "Twilight navy rounded banner headers with circular icon badges", true, "Photo & Creative", "resume/resume-sage", "sage-ramanathan", "#1e3a8a", "#4a7048", null, false, 104),
            new TemplateInfo("sage-plum", "Priya Deep Plum", "Deep plum rounded banner headers with circular photo and badges", true, "Photo & Creative", "resume/resume-sage", "sage-ramanathan", "#701a75", "#4a7048", null, false, 105),
            new TemplateInfo("sage-crimson", "Priya Velvet Ruby", "Rich velvet ruby rounded headers with matching icon badges", true, "Photo & Creative", "resume/resume-sage", "sage-ramanathan", "#9f1239", "#4a7048", null, false, 106),
            new TemplateInfo("sage-terracotta", "Priya Warm Terracotta", "Warm terracotta rounded banner strips with circular icon tags", true, "Photo & Creative", "resume/resume-sage", "sage-ramanathan", "#c2410c", "#4a7048", null, false, 107),
            new TemplateInfo("seafoam-smith", "Nelly Seafoam", "Seafoam green name box, 3-column contact/summary/skills & banner strips", false, "Modern Minimalist", "resume/resume-seafoam", "seafoam-smith", "#0f5132", null, null, false, 108)
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

        if (s.contains("classic")) return "classic-01";
        if (s.contains("modern")) return "modern-02";
        if (s.contains("emerald")) return "emerald-03";
        if (s.contains("slate")) return "slate-04";
        if (s.contains("violet") || s.contains("tech")) return "violet-05";
        if (s.contains("crimson") || s.contains("ruby")) return "crimson-06";

        return DEFAULT_TEMPLATE;
    }
}
