package com.resumeforge.resume_backend.service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.resumeforge.resume_backend.exception.ResourceNotFoundException;
import com.resumeforge.resume_backend.model.Resume;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ResumeRenderService {

    private final SpringTemplateEngine engine;
    private final TemplateRegistry registry;

    public String renderHtml(Resume resume) {
        String templateId = resume != null ? resume.getTemplateId() : null;
        String id = registry.resolve(templateId);
        TemplateRegistry.TemplateInfo info = registry.get(id);

        Context ctx = new Context();
        ctx.setVariable("resume", resume);
        ctx.setVariable("contacts", contacts(resume != null ? resume.getPersonalInfo() : null));
        
        String css = loadCss(id) + "\n" + buildCustomStyles(resume);
        ctx.setVariable("css", css);
        String view = registry.getViewName(id);
        String html = engine.process(view, ctx);

        String customAccent = (resume != null && resume.getAccentColor() != null && !resume.getAccentColor().isBlank())
                ? resume.getAccentColor().trim()
                : null;
        if (customAccent != null && info != null && info.accentColor() != null) {
            String orig = info.accentColor();
            html = html.replace(orig, customAccent);
            html = html.replace(orig.toUpperCase(), customAccent);
            html = html.replace(orig.toLowerCase(), customAccent);
        } else if (info != null && info.accentColor() != null && info.baseAccentColor() != null) {
            html = html.replace(info.baseAccentColor(), info.accentColor());
            html = html.replace(info.baseAccentColor().toUpperCase(), info.accentColor());
            html = html.replace(info.baseAccentColor().toLowerCase(), info.accentColor());
        }

        return html;
    }

    private String buildCustomStyles(Resume resume) {
        if (resume == null) return "";
        StringBuilder sb = new StringBuilder();

        // Custom Font Family
        if (resume.getFontFamily() != null && !resume.getFontFamily().isBlank()) {
            String font = resolveFontFamily(resume.getFontFamily().trim());
            sb.append("body, p, td, li, span, h1, h2, h3, h4, h5, h6, div { font-family: ")
              .append(font)
              .append(" !important; }\n");
        }

        // Custom Page Density / Spacing
        String density = resume.getPageDensity() != null ? resume.getPageDensity().trim().toLowerCase() : "auto";
        if ("compact".equals(density)) {
            sb.append("""
                .section { margin-bottom: 6pt !important; }
                .entry { margin-bottom: 4pt !important; }
                p, li { line-height: 1.25 !important; font-size: 8pt !important; }
                ul { margin-top: 1pt !important; margin-bottom: 1pt !important; }
                h1 { font-size: 18pt !important; }
                h2 { font-size: 9.5pt !important; margin-bottom: 3pt !important; }
                h3 { font-size: 8.5pt !important; margin-bottom: 2pt !important; }
            """);
        } else if ("spacious".equals(density)) {
            sb.append("""
                .section { margin-bottom: 16pt !important; }
                .entry { margin-bottom: 12pt !important; }
                p, li { line-height: 1.55 !important; font-size: 9.5pt !important; }
                h1 { font-size: 24pt !important; }
                h2 { font-size: 11.5pt !important; margin-bottom: 8pt !important; }
                h3 { font-size: 10.5pt !important; margin-bottom: 6pt !important; }
            """);
        }

        return sb.toString();
    }

    private String resolveFontFamily(String fontKey) {
        return switch (fontKey.toLowerCase()) {
            case "serif", "georgia" -> "'Georgia', 'Times New Roman', serif";
            case "sans", "inter" -> "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            case "modern", "segoe" -> "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
            case "clean", "arial" -> "'Arial', 'Helvetica Neue', sans-serif";
            default -> fontKey;
        };
    }

    public byte[] renderPdf(Resume resume) {
        String html = renderHtml(resume);
        if (html != null) {
            html = html.replace("\uFEFF", "").trim();
        }
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(html, null);
            builder.toStream(out);
            builder.run();
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("PDF generation failed", e);
        }
    }

    private List<String> contacts(Resume.PersonalInfo p) {
        if (p == null) return List.of();
        return Stream.of(p.email(), p.phone(), p.location(), p.linkedin(), p.github(), p.portfolio())
                .filter(s -> s != null && !s.isBlank())
                .toList();
    }

    private String loadCss(String id) {
        try (var in = new ClassPathResource("templates/resume/css/" + id + ".css").getInputStream()) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            TemplateRegistry.TemplateInfo info = registry.get(id);
            if (info != null && info.baseCssId() != null && !info.baseCssId().equals(id)) {
                String baseCss = loadCss(info.baseCssId());
                if (info.accentColor() != null && info.baseAccentColor() != null) {
                    baseCss = baseCss.replace(info.baseAccentColor(), info.accentColor());
                    baseCss = baseCss.replace(info.baseAccentColor().toUpperCase(), info.accentColor());
                    baseCss = baseCss.replace(info.baseAccentColor().toLowerCase(), info.accentColor());
                }
                return baseCss;
            }
            throw new IllegalStateException("Missing CSS for template " + id, e);
        }
    }
}
