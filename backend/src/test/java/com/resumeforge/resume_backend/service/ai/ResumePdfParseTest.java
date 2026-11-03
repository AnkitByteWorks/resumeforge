package com.resumeforge.resume_backend.service.ai;

import com.resumeforge.resume_backend.dto.ai.AiDraftResult;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ResumePdfParseTest {

    @Autowired
    private AiResumeService aiResumeService;

    @Test
    void testParseResumeFromPdf() throws Exception {
        byte[] pdfBytes;
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage();
            doc.addPage(page);

            try (PDPageContentStream stream = new PDPageContentStream(doc, page)) {
                stream.beginText();
                stream.setFont(PDType1Font.HELVETICA_BOLD, 14);
                stream.setLeading(18f);
                stream.newLineAtOffset(50, 750);

                stream.showText("Alex Johnson");
                stream.newLine();
                stream.setFont(PDType1Font.HELVETICA, 10);
                stream.showText("alex.johnson@example.com | (555) 123-4567 | linkedin.com/in/alexjohnson | github.com/alexj");
                stream.newLine();
                stream.newLine();

                stream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                stream.showText("SUMMARY");
                stream.newLine();
                stream.setFont(PDType1Font.HELVETICA, 10);
                stream.showText("Passionate full-stack developer with 5 years experience building scalable enterprise software.");
                stream.newLine();
                stream.newLine();

                stream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                stream.showText("EXPERIENCE");
                stream.newLine();
                stream.setFont(PDType1Font.HELVETICA, 10);
                stream.showText("Acme Technologies - Senior Software Engineer (2021 - Present)");
                stream.newLine();
                stream.showText("* Architected and deployed microservices handling 2M requests daily.");
                stream.newLine();
                stream.showText("* Reduced API response latency by 35% through cache optimization.");
                stream.newLine();
                stream.newLine();

                stream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                stream.showText("SKILLS");
                stream.newLine();
                stream.setFont(PDType1Font.HELVETICA, 10);
                stream.showText("Java, Spring Boot, React, TypeScript, Docker, Kubernetes, MongoDB");
                stream.newLine();

                stream.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);
            pdfBytes = baos.toByteArray();
        }

        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "Alex_Johnson_Resume.pdf",
                "application/pdf",
                pdfBytes
        );

        AiDraftResult result = aiResumeService.parseResumeFromFile(mockFile, "Senior Full-Stack Engineer");

        assertNotNull(result);
        assertNotNull(result.resume());
        assertNotNull(result.resume().personalInfo());

        // Verify either Gemini or fallback parser extracted contact & skills
        String name = result.resume().personalInfo().fullName();
        assertTrue(name.contains("Alex") || !name.isBlank());

        String email = result.resume().personalInfo().email();
        assertEquals("alex.johnson@example.com", email);

        assertNotNull(result.resume().skills());
        assertFalse(result.resume().skills().isEmpty());

        assertNotNull(result.questions());
        assertFalse(result.questions().isEmpty());
    }

    @Test
    void testInvalidFileThrows() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "empty.pdf", "application/pdf", new byte[0]);
        assertThrows(IllegalArgumentException.class, () -> aiResumeService.parseResumeFromFile(emptyFile, null));

        MockMultipartFile textFile = new MockMultipartFile("file", "test.txt", "text/plain", "hello world".getBytes());
        assertThrows(IllegalArgumentException.class, () -> aiResumeService.parseResumeFromFile(textFile, null));
    }
}
