package com.resumeforge.resume_backend.service;

import com.resumeforge.resume_backend.dto.ResumeRequest;
import com.resumeforge.resume_backend.dto.ResumeResponse;
import com.resumeforge.resume_backend.exception.ResourceNotFoundException;
import com.resumeforge.resume_backend.model.Resume;
import com.resumeforge.resume_backend.repository.ResumeRepository;
import com.resumeforge.resume_backend.service.ats.AtsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository repository;
    private final AtsService atsService;

    public ResumeResponse create(String userId, ResumeRequest req) {
        Resume resume = new Resume();
        resume.setUserId(userId);
        apply(resume, req);
        return ResumeResponse.from(repository.save(resume));
    }

    public List<ResumeResponse> list(String userId) {
        return repository.findByUserIdOrderByUpdatedAtDesc(userId)
                .stream().map(r -> {
                    if (r.getAtsScore() == null) {
                        try {
                            r.setAtsScore(atsService.analyze(r, null).score());
                        } catch (Exception ignored) {
                            r.setAtsScore(80);
                        }
                    }
                    return ResumeResponse.from(r);
                }).toList();
    }

    public ResumeResponse get(String userId, String id) {
        return ResumeResponse.from(getEntity(userId, id));
    }

    public ResumeResponse update(String userId, String id, ResumeRequest req) {
        Resume resume = getEntity(userId, id);
        apply(resume, req);
        return ResumeResponse.from(repository.save(resume));
    }

    public void delete(String userId, String id) {
        repository.delete(getEntity(userId, id));
    }

    public Resume getEntity(String userId, String id) {
        return repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found: " + id));
    }

    private void apply(Resume r, ResumeRequest q) {
        r.setTitle(q.title());
        r.setTemplateId(q.templateId());
        var p = q.personalInfo();
        r.setPersonalInfo(new Resume.PersonalInfo(p.fullName(), p.email(), p.phone(),
                p.location(), p.linkedin(), p.github(), p.portfolio(), p.photoUrl(), p.headline()));
        r.setSummary(q.summary());
        r.setExperience(orEmpty(q.experience()).stream().map(e ->
                new Resume.Experience(e.company(), e.role(), e.startDate(), e.endDate(),
                        e.current(), orEmpty(e.bullets()))).toList());
        r.setProjects(orEmpty(q.projects()).stream().map(x ->
                new Resume.Project(x.name(), x.techStack(), x.link(),
                        orEmpty(x.bullets()))).toList());
        r.setEducation(orEmpty(q.education()).stream().map(e ->
                new Resume.Education(e.institution(), e.degree(), e.field(),
                        e.startDate(), e.endDate(), e.score())).toList());
        r.setSkills(orEmpty(q.skills()));
        r.setCertifications(orEmpty(q.certifications()));
        try {
            r.setAtsScore(atsService.analyze(r, null).score());
        } catch (Exception ignored) {
            if (r.getAtsScore() == null) {
                r.setAtsScore(80);
            }
        }
    }

    private static <T> List<T> orEmpty(List<T> list) {
        return list == null ? List.of() : list;
    }
}
