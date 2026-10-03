package com.miniats.dto;

import com.miniats.model.Application;
import com.miniats.model.PipelineStage;

import java.time.LocalDate;

/**
 * Flat, frontend-friendly representation of an Application (a Kanban card).
 * Avoids sending nested Candidate/Job/Client object graphs (and lazy-loading
 * issues) straight from JPA entities to the browser.
 */
public class ApplicationDTO {

    private Long id;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private Long jobId;
    private String jobTitle;
    private String clientName;
    private PipelineStage stage;
    private LocalDate appliedDate;
    private String notes;

    public static ApplicationDTO fromEntity(Application app) {
        ApplicationDTO dto = new ApplicationDTO();
        dto.id = app.getId();
        dto.stage = app.getStage();
        dto.appliedDate = app.getAppliedDate();
        dto.notes = app.getNotes();

        if (app.getCandidate() != null) {
            dto.candidateId = app.getCandidate().getId();
            dto.candidateName = app.getCandidate().getName();
            dto.candidateEmail = app.getCandidate().getEmail();
        }
        if (app.getJob() != null) {
            dto.jobId = app.getJob().getId();
            dto.jobTitle = app.getJob().getTitle();
            if (app.getJob().getClient() != null) {
                dto.clientName = app.getJob().getClient().getCompanyName();
            }
        }
        return dto;
    }

    public Long getId() {
        return id;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public String getCandidateEmail() {
        return candidateEmail;
    }

    public Long getJobId() {
        return jobId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public String getClientName() {
        return clientName;
    }

    public PipelineStage getStage() {
        return stage;
    }

    public LocalDate getAppliedDate() {
        return appliedDate;
    }

    public String getNotes() {
        return notes;
    }
}
