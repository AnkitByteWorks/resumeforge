package com.resumeforge.resume_backend.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document("resumes")
@Getter @Setter @NoArgsConstructor
public class Resume {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String title;
    private String templateId;
    private PersonalInfo personalInfo;
    private String summary;
    private List<Experience> experience = new ArrayList<>();
    private List<Project> projects = new ArrayList<>();
    private List<Education> education = new ArrayList<>();
    private List<String> skills = new ArrayList<>();
    private List<String> certifications = new ArrayList<>();
    private Integer atsScore;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public record PersonalInfo(String fullName, String email, String phone,
                               String location, String linkedin, String github,
                               String portfolio, String photoUrl, String headline) {
        public PersonalInfo(String fullName, String email, String phone,
                            String location, String linkedin, String github,
                            String portfolio) {
            this(fullName, email, phone, location, linkedin, github, portfolio, null, null);
        }
    }

    public record Experience(String company, String role, String startDate,
                             String endDate, boolean current, List<String> bullets) {}

    public record Project(String name, String techStack, String link, List<String> bullets) {}

    public record Education(String institution, String degree, String field,
                            String startDate, String endDate, String score) {}
}
