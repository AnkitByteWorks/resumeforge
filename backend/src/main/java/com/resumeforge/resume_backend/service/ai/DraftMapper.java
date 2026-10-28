package com.resumeforge.resume_backend.service.ai;

import com.resumeforge.resume_backend.dto.ai.ResumeDraft;
import com.resumeforge.resume_backend.model.Resume;

import java.util.List;

final class DraftMapper {

    private DraftMapper() {}

    static ResumeDraft toDraft(Resume r) {
        var p = r.getPersonalInfo();
        var personal = p == null
                ? new ResumeDraft.PersonalInfo("", "", "", "", "", "", "")
                : new ResumeDraft.PersonalInfo(n(p.fullName()), n(p.email()), n(p.phone()),
                        n(p.location()), n(p.linkedin()), n(p.github()), n(p.portfolio()));
        return new ResumeDraft(n(r.getTitle()), n(r.getTemplateId()), personal, n(r.getSummary()),
                safe(r.getExperience()).stream().map(e -> new ResumeDraft.Experience(n(e.company()),
                        n(e.role()), n(e.startDate()), n(e.endDate()), e.current(), safe(e.bullets()))).toList(),
                safe(r.getProjects()).stream().map(x -> new ResumeDraft.Project(n(x.name()),
                        n(x.techStack()), n(x.link()), safe(x.bullets()))).toList(),
                safe(r.getEducation()).stream().map(e -> new ResumeDraft.Education(n(e.institution()),
                        n(e.degree()), n(e.field()), n(e.startDate()), n(e.endDate()), n(e.score()))).toList(),
                safe(r.getSkills()), safe(r.getCertifications()));
    }

    static Resume toEntity(ResumeDraft d) {
        Resume r = new Resume();
        r.setTitle(d.title());
        r.setTemplateId(d.templateId());
        var p = d.personalInfo();
        if (p != null) {
            r.setPersonalInfo(new Resume.PersonalInfo(p.fullName(), p.email(), p.phone(),
                    p.location(), p.linkedin(), p.github(), p.portfolio()));
        }
        r.setSummary(d.summary());
        r.setExperience(safe(d.experience()).stream().map(e -> new Resume.Experience(e.company(),
                e.role(), e.startDate(), e.endDate(), e.current(), safe(e.bullets()))).toList());
        r.setProjects(safe(d.projects()).stream().map(x -> new Resume.Project(x.name(),
                x.techStack(), x.link(), safe(x.bullets()))).toList());
        r.setEducation(safe(d.education()).stream().map(e -> new Resume.Education(e.institution(),
                e.degree(), e.field(), e.startDate(), e.endDate(), e.score())).toList());
        r.setSkills(safe(d.skills()));
        r.setCertifications(safe(d.certifications()));
        return r;
    }

    private static String n(String s) { return s == null ? "" : s; }

    private static <T> List<T> safe(List<T> list) { return list == null ? List.of() : list; }
}
