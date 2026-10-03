package com.miniats.controller;

import com.miniats.config.ResourceNotFoundException;
import com.miniats.model.Client;
import com.miniats.model.Job;
import com.miniats.repository.ClientRepository;
import com.miniats.repository.JobRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobRepository jobRepository;
    private final ClientRepository clientRepository;

    public JobController(JobRepository jobRepository, ClientRepository clientRepository) {
        this.jobRepository = jobRepository;
        this.clientRepository = clientRepository;
    }

    @GetMapping
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    @GetMapping("/{id}")
    public Job getJobById(@PathVariable Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id " + id));
    }

    @GetMapping("/by-client/{clientId}")
    public List<Job> getJobsByClient(@PathVariable Long clientId) {
        return jobRepository.findByClientId(clientId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Job createJob(@Valid @RequestBody Job job) {
        job.setId(null);
        if (job.getClient() == null || job.getClient().getId() == null) {
            throw new ResourceNotFoundException("A valid client id must be provided for this job");
        }
        Client client = clientRepository.findById(job.getClient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id " + job.getClient().getId()));
        job.setClient(client);
        return jobRepository.save(job);
    }

    @PutMapping("/{id}")
    public Job updateJob(@PathVariable Long id, @Valid @RequestBody Job updated) {
        Job existing = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id " + id));
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setLocation(updated.getLocation());
        existing.setStatus(updated.getStatus());
        if (updated.getClient() != null && updated.getClient().getId() != null) {
            Client client = clientRepository.findById(updated.getClient().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Client not found with id " + updated.getClient().getId()));
            existing.setClient(client);
        }
        return jobRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        if (!jobRepository.existsById(id)) {
            throw new ResourceNotFoundException("Job not found with id " + id);
        }
        jobRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
