package com.resumeforge.resume_backend.service.ats;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Component
public class SkillDictionary {

    public record Skill(String name, Set<String> aliases) {}

    private final List<Skill> skills = new ArrayList<>();

    public SkillDictionary() {
        try (var reader = new BufferedReader(new InputStreamReader(
                new ClassPathResource("ats/skills.txt").getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) continue;
                String[] parts = line.split("\\|");
                Set<String> aliases = new LinkedHashSet<>();
                for (String p : parts) {
                    String n = AtsText.normalize(p);
                    if (!n.isEmpty()) aliases.add(n);
                }
                skills.add(new Skill(parts[0].trim(), aliases));
            }
        } catch (IOException e) {
            throw new UncheckedIOException("Cannot load ats/skills.txt", e);
        }
    }

    public List<Skill> all() {
        return skills;
    }
}
