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
        String id = resume.getTemplateId();
        if (!registry.exists(id)) {
            throw new ResourceNotFoundException("Unknown template: " + id);
        }
        Context ctx = new Context();
        ctx.setVariable("resume", resume);
        ctx.setVariable("contacts", contacts(resume.getPersonalInfo()));
        ctx.setVariable("css", loadCss(id));
        return engine.process("resume/resume", ctx);
    }

    public byte[] renderPdf(Resume resume) {
        String html = renderHtml(resume);
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
        return Stream.of(p.email(), p.phone(), p.location(), p.linkedin(), p.github(), p.portfolio())
                .filter(s -> s != null && !s.isBlank())
                .toList();
    }

    private String loadCss(String id) {
        try (var in = new ClassPathResource("templates/resume/css/" + id + ".css").getInputStream()) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Missing CSS for template " + id, e);
        }
    }
}
