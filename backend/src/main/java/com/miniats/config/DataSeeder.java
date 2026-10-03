package com.miniats.config;

import com.miniats.model.*;
import com.miniats.repository.ApplicationRepository;
import com.miniats.repository.CandidateRepository;
import com.miniats.repository.ClientRepository;
import com.miniats.repository.JobRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/** Seeds a handful of sample clients, jobs, candidates and pipeline applications on startup, so the UI is populated immediately - purely for demo purposes. */
@Component
public class DataSeeder implements CommandLineRunner {

    private final ClientRepository clientRepository;
    private final JobRepository jobRepository;
    private final CandidateRepository candidateRepository;
    private final ApplicationRepository applicationRepository;

    public DataSeeder(ClientRepository clientRepository, JobRepository jobRepository,
                       CandidateRepository candidateRepository, ApplicationRepository applicationRepository) {
        this.clientRepository = clientRepository;
        this.jobRepository = jobRepository;
        this.candidateRepository = candidateRepository;
        this.applicationRepository = applicationRepository;
    }

    @Override
    public void run(String... args) {
        if (clientRepository.count() > 0) {
            return; // already seeded (e.g. app restarted against a persistent DB)
        }

        Client acme = clientRepository.save(new Client("Acme Robotics", "Priya Nair", "priya@acmerobotics.com", "9820011223", "Manufacturing"));
        Client nova = clientRepository.save(new Client("Nova FinTech", "Rahul Shah", "rahul@novafintech.io", "9911223344", "Finance"));
        Client brightcart = clientRepository.save(new Client("BrightCart", "Aisha Khan", "aisha@brightcart.com", "9877766554", "E-commerce"));

        Job backendJob = jobRepository.save(new Job("Backend Engineer (Java/Spring Boot)",
                "Build and maintain REST APIs for our warehouse robotics platform.", "Remote", acme));
        Job dataJob = jobRepository.save(new Job("Data Analyst",
                "Analyze transaction data and build dashboards for the risk team.", "Bengaluru (Hybrid)", nova));
        Job frontendJob = jobRepository.save(new Job("Frontend Developer (React)",
                "Own the customer-facing storefront and checkout flow.", "Remote", brightcart));

        Candidate c1 = candidateRepository.save(new Candidate("Alex Morgan", "alex.morgan@example.com", "9000000001",
                "Java, Spring Boot, MySQL, JavaScript", "https://example.com/resumes/alex", 0));
        Candidate c2 = candidateRepository.save(new Candidate("Priya Shah", "priya.shah@example.com", "9000000002",
                "Python, SQL, Power BI, Excel", "https://example.com/resumes/priya", 1));
        Candidate c3 = candidateRepository.save(new Candidate("Rohan Mehta", "rohan.mehta@example.com", "9000000003",
                "React, JavaScript, CSS, HTML5", "https://example.com/resumes/rohan", 2));
        Candidate c4 = candidateRepository.save(new Candidate("Ananya Rao", "ananya.rao@example.com", "9000000004",
                "Java, Spring, REST APIs, Git", "https://example.com/resumes/ananya", 1));

        applicationRepository.save(new Application(c1, backendJob, PipelineStage.SCREENED));
        applicationRepository.save(new Application(c4, backendJob, PipelineStage.INTERVIEW));
        applicationRepository.save(new Application(c2, dataJob, PipelineStage.SOURCED));
        applicationRepository.save(new Application(c3, frontendJob, PipelineStage.OFFER));

        System.out.println("=== Mini ATS/CRM: sample data seeded successfully ===");
    }
}
