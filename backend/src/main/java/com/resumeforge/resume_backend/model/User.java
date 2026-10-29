package com.resumeforge.resume_backend.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("users")
@Getter @Setter @NoArgsConstructor
public class User {
    @Id
    private String id;
    private String name;
    private String email;
    private String passwordHash;
    private Instant createdAt;
}
