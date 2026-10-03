# Mini ATS/CRM

A portfolio-ready **Applicant Tracking System (ATS) + Client Relationship Management (CRM)** built with **Java 17, Spring Boot, Spring Data JPA, Hibernate, H2/MySQL, and Vanilla JavaScript**.

Mini ATS/CRM helps recruitment teams manage **clients, job openings, candidates, and candidate applications** through a visual **Kanban hiring pipeline**.

---

## 🚀 Project Status

**Status:** Working locally and ready for GitHub

### Current deployment plan

* **Source Code:** GitHub
* **Frontend:** GitHub Pages
* **Backend:** To be deployed on a separate free Java/Spring Boot hosting platform
* **Database:** H2 for local development / MySQL for production

> The backend is not hosted on GitHub Pages because GitHub Pages supports static websites, not Spring Boot server applications.

---

## ✨ Features

* Client management
* Job management with client relationships
* Candidate management
* Candidate-to-job application tracking
* Visual Kanban hiring pipeline
* Pipeline stages:
  `Sourced → Screened → Interview → Offer → Hired / Rejected`
* Drag-and-drop pipeline stage updates
* Dropdown alternative for changing pipeline stages
* RESTful Spring Boot API
* Spring Data JPA and Hibernate
* DTO-based application responses
* Bean Validation
* Centralized exception handling
* Duplicate application protection
* H2 database for zero-setup local development
* MySQL support for production
* Configurable CORS
* Backend health-check endpoint
* Sample demo data
* GitHub Actions workflow for frontend deployment

---

# 🛠️ Tech Stack

## Backend

* Java 17
* Spring Boot 3.2.5
* Spring Web
* Spring Data JPA
* Hibernate
* Spring Validation
* H2 Database
* MySQL
* Maven

## Frontend

* HTML5
* CSS3
* Vanilla JavaScript
* Fetch API
* HTML5 Drag and Drop API

---

# 📁 Project Structure

```text
mini-ats-crm/
│
├── backend/
│   ├── pom.xml
│   │
│   └── src/
│       ├── main/
│       │   ├── java/com/miniats/
│       │   │   ├── config/
│       │   │   ├── controller/
│       │   │   ├── dto/
│       │   │   ├── model/
│       │   │   ├── repository/
│       │   │   └── MiniAtsApplication.java
│       │   │
│       │   └── resources/
│       │       ├── application.properties
│       │       └── application-prod.properties
│       │
│       └── test/
│
├── frontend/
│   ├── index.html
│   │
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       ├── config.js
│       └── app.js
│
├── .github/
│   └── workflows/
│       └── deploy-frontend.yml
│
├── .gitignore
└── README.md
```

---

# 🏗️ Architecture

```text
                  USER
                   │
                   ▼
          ┌─────────────────┐
          │    Frontend     │
          │ HTML/CSS/JS     │
          └────────┬────────┘
                   │
                   │ REST API
                   ▼
          ┌─────────────────┐
          │ Spring Boot API │
          │                 │
          │ Controllers     │
          │ DTOs            │
          │ Repositories    │
          │ JPA / Hibernate │
          └────────┬────────┘
                   │
                   ▼
             ┌───────────┐
             │ Database  │
             │ H2/MySQL  │
             └───────────┘
```

The `Application` entity acts as the bridge between a **Candidate** and a **Job**.

It stores additional application-specific information such as:

* Pipeline stage
* Applied date
* Notes

This allows the system to represent candidate applications independently from the candidate and job records.

---

# 💻 Run Locally

## Prerequisites

Install:

* JDK 17+
* Maven 3.6+
* Python 3.x
* Modern web browser

MySQL is optional for local development because the default configuration uses H2.

---

## 1. Start Backend

Open a terminal in:

```text
backend/
```

Run:

```bash
mvn clean spring-boot:run
```

The backend runs locally on:

```text
http://localhost:8091
```

### Health Check

Open:

```text
http://localhost:8091/api/health
```

Expected response:

```json
{
  "status": "UP"
}
```

---

## 2. Start Frontend

Open another terminal in:

```text
frontend/
```

Run:

```bash
python -m http.server 5500
```

Open:

```text
http://localhost:5500
```

The local frontend communicates with:

```text
http://localhost:8091/api
```

---

# 🔌 API Reference

Base URL:

```text
/api
```

## Health

| Method | Endpoint  | Purpose              |
| ------ | --------- | -------------------- |
| GET    | `/health` | Check backend status |

## Clients

| Method | Endpoint        | Purpose       |
| ------ | --------------- | ------------- |
| GET    | `/clients`      | List clients  |
| GET    | `/clients/{id}` | Get client    |
| POST   | `/clients`      | Create client |
| PUT    | `/clients/{id}` | Update client |
| DELETE | `/clients/{id}` | Delete client |

## Jobs

| Method | Endpoint                     | Purpose           |
| ------ | ---------------------------- | ----------------- |
| GET    | `/jobs`                      | List jobs         |
| GET    | `/jobs/{id}`                 | Get job           |
| GET    | `/jobs/by-client/{clientId}` | Jobs for a client |
| POST   | `/jobs`                      | Create job        |
| PUT    | `/jobs/{id}`                 | Update job        |
| DELETE | `/jobs/{id}`                 | Delete job        |

## Candidates

| Method | Endpoint           | Purpose          |
| ------ | ------------------ | ---------------- |
| GET    | `/candidates`      | List candidates  |
| GET    | `/candidates/{id}` | Get candidate    |
| POST   | `/candidates`      | Create candidate |
| PUT    | `/candidates/{id}` | Update candidate |
| DELETE | `/candidates/{id}` | Delete candidate |

## Applications

| Method | Endpoint                       | Purpose                   |
| ------ | ------------------------------ | ------------------------- |
| GET    | `/applications`                | List applications         |
| GET    | `/applications/{id}`           | Get application           |
| GET    | `/applications/by-job/{jobId}` | Applications for a job    |
| POST   | `/applications`                | Add candidate to pipeline |
| PATCH  | `/applications/{id}/stage`     | Change pipeline stage     |
| PUT    | `/applications/{id}/notes`     | Update application notes  |
| DELETE | `/applications/{id}`           | Remove application        |

---

# 🌐 GitHub Repository

The source code for this project is maintained on GitHub.

Repository:

```text
https://github.com/YOUR-USERNAME/mini-ats-crm
```

Replace `YOUR-USERNAME` with your GitHub username after creating the repository.

---

# 🚀 GitHub Setup

## 1. Create GitHub Repository

Create a new **public** repository named:

```text
mini-ats-crm
```

Do not initialize the repository with:

* README
* `.gitignore`
* License

The local project already contains these files.

---

## 2. Initialize Git Locally

From the project root:

```bash
git init -b main
```

Check:

```bash
git status
```

---

## 3. Add Files

```bash
git add .
```

Check the files before committing:

```bash
git status
```

Make sure files such as these are NOT being uploaded:

```text
target/
.idea/
.env
*.log
```

---

## 4. Create Commit

```bash
git commit -m "Initial commit: Mini ATS CRM"
```

---

## 5. Connect GitHub Repository

Replace `YOUR-USERNAME` with your GitHub username:

```bash
git remote add origin https://github.com/YOUR-USERNAME/mini-ats-crm.git
```

Verify:

```bash
git remote -v
```

---

## 6. Push to GitHub

```bash
git push -u origin main
```

After the push completes, refresh your GitHub repository.

---

# 🌍 Deploy Frontend with GitHub Pages

GitHub Pages can host the static frontend of this project.

The Spring Boot backend must be hosted separately.

GitHub Pages supports static files and can publish an existing repository using a branch or GitHub Actions workflow.

## GitHub Pages URL

After deployment, the frontend will normally be available at:

```text
https://YOUR-USERNAME.github.io/mini-ats-crm/
```

---

## GitHub Pages Using GitHub Actions

This project contains:

```text
.github/workflows/deploy-frontend.yml
```

The workflow is intended to deploy the `frontend/` directory.

### Configure GitHub Pages

1. Open the GitHub repository.
2. Go to **Settings**.
3. Open **Pages**.
4. Under **Build and deployment**.
5. Set **Source** to:

```text
GitHub Actions
```

GitHub documents GitHub Actions as a supported publishing source for Pages.

6. Push your project to `main`.

7. Open the **Actions** tab.

8. Wait for the frontend deployment workflow to complete.

9. Open the published GitHub Pages URL.

GitHub notes that publishing can take several minutes after a push.

---

# ⚠️ Backend Deployment

GitHub Pages **cannot run the Spring Boot backend**.

Therefore, the frontend and backend are deployed separately:

```text
Frontend
GitHub Pages
      │
      │ REST API
      ▼
Backend
Separate Java/Spring Boot hosting
      │
      ▼
MySQL
```

A free hosting provider for the Spring Boot backend will be selected separately.

Until the backend is deployed, the GitHub Pages frontend will not be able to use the production API.

---

# 🔐 Security

Never commit sensitive information to GitHub.

Do not upload:

```text
.env
database passwords
API keys
JWT secrets
private credentials
```

Also avoid uploading personal documents such as:

```text
resume files
identity documents
private certificates
```

---

# 🗄️ Database

### Local Development

The project can use H2 for convenient local development.

### Production

The production configuration is prepared for MySQL.

The final production database and backend hosting provider will be configured separately.

---

# 🧪 Testing Checklist

Before production deployment, verify:

* [ ] Backend starts successfully
* [ ] `/api/health` returns `UP`
* [ ] Clients can be created
* [ ] Jobs can be created
* [ ] Candidates can be created
* [ ] Applications can be created
* [ ] Kanban stages work
* [ ] Drag-and-drop works
* [ ] Stage dropdown works
* [ ] Delete operations work
* [ ] Duplicate applications are prevented
* [ ] Frontend loads correctly
* [ ] GitHub Pages deployment succeeds
* [ ] Production backend URL is configured
* [ ] CORS allows the GitHub Pages origin

---

# 📸 Project Highlights

### Client Management

Manage recruitment clients and their contact information.

### Job Management

Create job openings and associate them with clients.

### Candidate Management

Maintain candidate information, skills, experience, and resume links.

### Kanban Hiring Pipeline

Track candidates visually through:

```text
Sourced
   ↓
Screened
   ↓
Interview
   ↓
Offer
   ↓
Hired
```

Rejected candidates can be moved to:

```text
Rejected
```

---

# 💼 Portfolio Description

> **Mini ATS/CRM** — A full-stack recruitment management application built with Java 17 and Spring Boot. The system provides client, job, candidate, and application management with a visual drag-and-drop Kanban hiring pipeline. The backend uses Spring Data JPA and Hibernate to expose REST APIs, while the frontend uses HTML, CSS, and Vanilla JavaScript.

---

# 📄 Resume Bullet

> Developed a full-stack Applicant Tracking System and CRM using Java 17, Spring Boot, Spring Data JPA, Hibernate, REST APIs, H2/MySQL, HTML, CSS, and JavaScript, implementing client/job/candidate management and a drag-and-drop Kanban recruitment pipeline with validation, DTOs, exception handling, and CORS configuration.

---

# 🔮 Future Enhancements

* Spring Security + JWT authentication
* Recruiter/user roles
* Candidate search and pagination
* Resume upload and parsing
* Advanced candidate filtering
* Email notifications
* Dashboard analytics
* Pipeline history
* Audit logs
* Automated unit and integration tests
* CI/CD quality gates
* Production backend deployment
* Production MySQL database

---

# 📜 License

This project is intended for learning, portfolio demonstration, and further development.
