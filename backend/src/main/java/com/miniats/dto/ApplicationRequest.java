package com.miniats.dto;

import com.miniats.model.PipelineStage;
import jakarta.validation.constraints.NotNull;

/** Request body used to create a new Application (a candidate applying to a job). */
public class ApplicationRequest {

    @NotNull
    private Long candidateId;

    @NotNull
    private Long jobId;

    private PipelineStage stage;

    private String notes;

    public Long getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public PipelineStage getStage() {
        return stage;
    }

    public void setStage(PipelineStage stage) {
        this.stage = stage;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
