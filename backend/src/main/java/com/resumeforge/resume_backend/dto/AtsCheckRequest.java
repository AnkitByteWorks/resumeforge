package com.resumeforge.resume_backend.dto;

import jakarta.validation.constraints.Size;

public record AtsCheckRequest(@Size(max = 10000) String jobDescription) {}
