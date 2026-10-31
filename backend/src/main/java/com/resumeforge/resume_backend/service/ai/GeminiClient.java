package com.resumeforge.resume_backend.service.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.resumeforge.resume_backend.exception.AiUnavailableException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import tools.jackson.databind.json.JsonMapper;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Component
public class GeminiClient {

    private static final JsonMapper MAPPER = JsonMapper.builder().build();

    private final RestClient rest;
    private final String apiKey;
    private final List<String> models;

    public GeminiClient(@Value("${gemini.api-key:}") String apiKey,
                        @Value("${gemini.models}") String modelsCsv,
                        @Value("${gemini.base-url}") String baseUrl) {
        var http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
        var factory = new JdkClientHttpRequestFactory(http);
        factory.setReadTimeout(Duration.ofSeconds(20));
        this.rest = RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
        this.apiKey = apiKey;
        this.models = Arrays.stream(modelsCsv.split(","))
                .map(String::trim).filter(s -> !s.isEmpty()).toList();
        if (models.isEmpty()) {
            throw new IllegalStateException("gemini.models must list at least one model");
        }
    }

    /** Tries each configured model in order and returns the first successful result. */
    public <T> T generate(String systemInstruction, String userContent,
                          Map<String, Object> schema, Class<T> type) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new AiUnavailableException("AI is not configured on the server (GEMINI_API_KEY is missing).");
        }

        Map<String, Object> body = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", systemInstruction))),
                "contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", userContent)))),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json",
                        "responseJsonSchema", schema,
                        "maxOutputTokens", 8192));

        AiUnavailableException lastError = null;
        for (int i = 0; i < models.size(); i++) {
            String model = models.get(i);
            try {
                T result = callModel(model, body, type);
                if (i > 0) {
                    log.info("Gemini fallback model '{}' was used", model);
                }
                return result;
            } catch (AiUnavailableException e) {
                lastError = e;
                boolean hasNext = i < models.size() - 1;
                log.warn("Gemini model '{}' failed: {}{}", model, e.getMessage(),
                        hasNext ? " (trying next model)" : " (no more models)");
            }
        }
        throw lastError;
    }

    /** Tries each configured model in order for free-form text responses. */
    public String generateText(String systemInstruction, String userContent) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new AiUnavailableException("AI is not configured on the server (GEMINI_API_KEY is missing).");
        }

        Map<String, Object> body = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", systemInstruction))),
                "contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", userContent)))),
                "generationConfig", Map.of("maxOutputTokens", 2048));

        AiUnavailableException lastError = null;
        for (int i = 0; i < models.size(); i++) {
            String model = models.get(i);
            try {
                String result = callModelForText(model, body);
                if (i > 0) {
                    log.info("Gemini fallback model '{}' was used for text", model);
                }
                return result;
            } catch (AiUnavailableException e) {
                lastError = e;
                boolean hasNext = i < models.size() - 1;
                log.warn("Gemini model '{}' failed: {}{}", model, e.getMessage(),
                        hasNext ? " (trying next model)" : " (no more models)");
            }
        }
        throw lastError;
    }

    private <T> T callModel(String model, Map<String, Object> body, Class<T> type) {
        GeminiResponse response;
        try {
            response = rest.post()
                    .uri("/models/{model}:generateContent", model)
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(GeminiResponse.class);
        } catch (RestClientResponseException e) {
            log.warn("Gemini '{}' returned HTTP {}: {}", model, e.getStatusCode().value(),
                    e.getResponseBodyAsString());
            int code = e.getStatusCode().value();
            if (code == 429) {
                throw new AiUnavailableException("The AI service is busy (HTTP 429).");
            } else if (code == 503) {
                throw new AiUnavailableException("The AI service is temporarily experiencing high demand (HTTP 503).");
            } else if (code == 404) {
                throw new AiUnavailableException("The AI model '" + model + "' is not found or deprecated (HTTP 404).");
            }
            throw new AiUnavailableException("The AI service rejected the request (HTTP " + code + ").");
        } catch (RestClientException e) {
            throw new AiUnavailableException("Could not reach the AI service (" + e.getMessage() + ").");
        }

        String text = extractText(response);
        if (text == null || text.isBlank()) {
            throw new AiUnavailableException("The AI returned no content. Try rephrasing your notes.");
        }
        try {
            return MAPPER.readValue(text, type);
        } catch (Exception e) {
            throw new AiUnavailableException("The AI returned an invalid result. Please try again.");
        }
    }

    private String callModelForText(String model, Map<String, Object> body) {
        GeminiResponse response;
        try {
            response = rest.post()
                    .uri("/models/{model}:generateContent", model)
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(GeminiResponse.class);
        } catch (RestClientResponseException e) {
            log.warn("Gemini '{}' returned HTTP {}: {}", model, e.getStatusCode().value(),
                    e.getResponseBodyAsString());
            int code = e.getStatusCode().value();
            if (code == 429) {
                throw new AiUnavailableException("The AI service is busy (HTTP 429).");
            } else if (code == 503) {
                throw new AiUnavailableException("The AI service is temporarily experiencing high demand (HTTP 503).");
            } else if (code == 404) {
                throw new AiUnavailableException("The AI model '" + model + "' is not found or deprecated (HTTP 404).");
            }
            throw new AiUnavailableException("The AI service rejected the request (HTTP " + code + ").");
        } catch (RestClientException e) {
            throw new AiUnavailableException("Could not reach the AI service (" + e.getMessage() + ").");
        }

        String text = extractText(response);
        if (text == null || text.isBlank()) {
            throw new AiUnavailableException("The AI returned no text.");
        }
        return text;
    }

    private static String extractText(GeminiResponse r) {
        if (r == null || r.candidates() == null || r.candidates().isEmpty()) return null;
        var content = r.candidates().get(0).content();
        if (content == null || content.parts() == null) return null;
        return content.parts().stream()
                .map(Part::text).filter(Objects::nonNull)
                .collect(Collectors.joining());
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record GeminiResponse(List<Candidate> candidates) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Candidate(Content content, String finishReason) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Content(List<Part> parts) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Part(String text) {}
}
