package com.miniats.controller;

import com.miniats.config.ResourceNotFoundException;
import com.miniats.dto.ApplicationDTO;
import com.miniats.dto.ApplicationRequest;
import com.miniats.dto.StageUpdateRequest;
import com.miniats.model.*;
import com.miniats.repository.ApplicationRepository;
import com.miniats.repository.CandidateRepository;
import com.miniats.repository.JobRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Drives the Kanban board: every Application is one "card" that sits in exactly
 * one PipelineStage column (Sourced -> Screened -> Interview -> Offer -> Hired),
 * plus a Rejected column for drop-offs at any stage.
 */
@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationRepository applicationRepository;
    private final CandidateRepository candidateRepository;
    private final JobRepository jobRepository;

    public ApplicationController(ApplicationRepository applicationRepository,
                                  CandidateRepository candidateRepository,
                                  JobRepository jobRepository) {
        this.applicationRepository = applicationRepository;
        this.candidateRepository = candidateRepository;
        this.jobRepository = jobRepository;
    }

    /** Returns every application as a flat DTO - this is what the Kanban board renders. */
    @GetMapping
    public List<ApplicationDTO> getAllApplications() {
        return applicationRepository.findAll().stream()
                .map(ApplicationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ApplicationDTO getApplicationById(@PathVariable Long id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id " + id));
        return ApplicationDTO.fromEntity(app);
    }

    @GetMapping("/by-job/{jobId}")
    public List<ApplicationDTO> getApplicationsByJob(@PathVariable Long jobId) {
        return applicationRepository.findByJobId(jobId).stream()
                .map(ApplicationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /** Creates a new Kanban card: a candidate applying to a job, starting at a given stage (default SOURCED). */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationDTO createApplication(@Valid @RequestBody ApplicationRequest request) {
        Candidate candidate = candidateRepository.findById(request.getCandidateId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id " + request.getCandidateId()));
        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id " + request.getJobId()));

        if (applicationRepository.existsByCandidateIdAndJobId(request.getCandidateId(), request.getJobId())) {
            throw new IllegalArgumentException("This candidate is already in the selected job pipeline");
        }

        Application application = new Application();
        application.setCandidate(candidate);
        application.setJob(job);
        application.setStage(request.getStage() != null ? request.getStage() : PipelineStage.SOURCED);
        application.setNotes(request.getNotes());

        return ApplicationDTO.fromEntity(applicationRepository.save(application));
    }

    /** Moves a Kanban card to a new stage - this is what a drag-and-drop (or button click) on the board calls. */
    @PatchMapping("/{id}/stage")
    public ApplicationDTO updateStage(@PathVariable Long id, @Valid @RequestBody StageUpdateRequest request) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id " + id));
        application.setStage(request.getStage());
        return ApplicationDTO.fromEntity(applicationRepository.save(application));
    }

    @PutMapping("/{id}/notes")
    public ApplicationDTO updateNotes(@PathVariable Long id, @RequestBody String notes) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id " + id));
        application.setNotes(notes);
        return ApplicationDTO.fromEntity(applicationRepository.save(application));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        if (!applicationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Application not found with id " + id);
        }
        applicationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
