/* ==========================================================================
   Mini ATS/CRM - frontend logic
   Talks to the Spring Boot backend REST API (default: http://localhost:8080)
   No frameworks - plain fetch() + DOM manipulation, kept intentionally simple.
   ========================================================================== */

const configuredApiBase = window.ATS_API_BASE || "";
const API_BASE =
  configuredApiBase && !configuredApiBase.includes("__API_BASE_URL__")
    ? configuredApiBase.replace(/\/$/, "")
    : "http://localhost:8091/api";

const STAGES = ["SOURCED", "SCREENED", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];
const STAGE_LABELS = {
  SOURCED: "Sourced",
  SCREENED: "Screened",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

// In-memory caches so dropdowns (e.g. "which client is this job for") don't
// need a fresh fetch every time a modal opens.
let cache = { clients: [], jobs: [], candidates: [], applications: [] };

/* ---------------------------- generic fetch helper ---------------------------- */

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.message || JSON.stringify(body.fieldErrors || body);
    } catch (_) {}
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

const api = {
  getClients: () => apiRequest("/clients"),
  createClient: (data) => apiRequest("/clients", { method: "POST", body: JSON.stringify(data) }),
  deleteClient: (id) => apiRequest(`/clients/${id}`, { method: "DELETE" }),

  getJobs: () => apiRequest("/jobs"),
  createJob: (data) => apiRequest("/jobs", { method: "POST", body: JSON.stringify(data) }),
  deleteJob: (id) => apiRequest(`/jobs/${id}`, { method: "DELETE" }),

  getCandidates: () => apiRequest("/candidates"),
  createCandidate: (data) => apiRequest("/candidates", { method: "POST", body: JSON.stringify(data) }),
  deleteCandidate: (id) => apiRequest(`/candidates/${id}`, { method: "DELETE" }),

  getApplications: () => apiRequest("/applications"),
  createApplication: (data) => apiRequest("/applications", { method: "POST", body: JSON.stringify(data) }),
  updateStage: (id, stage) => apiRequest(`/applications/${id}/stage`, { method: "PATCH", body: JSON.stringify({ stage }) }),
  deleteApplication: (id) => apiRequest(`/applications/${id}`, { method: "DELETE" }),
};

/* ---------------------------- toast + modal helpers ---------------------------- */

function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.toggle("error", isError);
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}

function openModal(title, bodyHtml, onMount) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalBody").innerHTML = bodyHtml;
  document.getElementById("modalOverlay").classList.add("active");
  if (onMount) onMount();
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("active");
}

document.getElementById("modalCloseBtn").addEventListener("click", closeModal);
document.getElementById("modalOverlay").addEventListener("click", (e) => {
  if (e.target.id === "modalOverlay") closeModal();
});

/* ---------------------------- tabs ---------------------------- */

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

/* ---------------------------- backend health check ---------------------------- */

async function checkApiStatus() {
  const dot = document.getElementById("apiDot");
  const text = document.getElementById("apiStatusText");
  try {
    await apiRequest("/clients");
    dot.className = "dot online";
    text.textContent = "Backend connected";
  } catch (e) {
    dot.className = "dot offline";
    text.textContent = "Backend not reachable (start it on :8091)";
  }
}

/* ============================================================
   CLIENTS
   ============================================================ */

async function loadClients() {
  cache.clients = await api.getClients();
  const tbody = document.querySelector("#clientsTable tbody");
  tbody.innerHTML = "";

  if (cache.clients.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="5">No clients yet. Add your first client to get started.</td></tr>`;
    return;
  }

  cache.clients.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(c.companyName)}</td>
      <td>${escapeHtml(c.contactPerson || "-")}</td>
      <td>${escapeHtml(c.email || "-")}</td>
      <td>${escapeHtml(c.industry || "-")}</td>
      <td class="row-actions">
        <button class="btn btn-danger btn-small" data-delete-client="${c.id}">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("[data-delete-client]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this client? Its jobs will be deleted too.")) return;
      try {
        await api.deleteClient(btn.dataset.deleteClient);
        showToast("Client deleted");
        await refreshAll();
      } catch (e) {
        showToast(e.message, true);
      }
    });
  });
}

function openAddClientModal() {
  openModal("New Client", `
    <div class="form-group"><label>Company name *</label><input id="f_companyName" required /></div>
    <div class="form-group"><label>Contact person</label><input id="f_contactPerson" /></div>
    <div class="form-group"><label>Email</label><input id="f_email" type="email" /></div>
    <div class="form-group"><label>Phone</label><input id="f_phone" /></div>
    <div class="form-group"><label>Industry</label><input id="f_industry" /></div>
    <div class="form-actions">
      <button class="btn btn-secondary" id="cancelBtn">Cancel</button>
      <button class="btn btn-primary" id="saveBtn">Save Client</button>
    </div>
  `, () => {
    document.getElementById("cancelBtn").addEventListener("click", closeModal);
    document.getElementById("saveBtn").addEventListener("click", async () => {
      const companyName = document.getElementById("f_companyName").value.trim();
      if (!companyName) return showToast("Company name is required", true);
      try {
        await api.createClient({
          companyName,
          contactPerson: document.getElementById("f_contactPerson").value.trim(),
          email: document.getElementById("f_email").value.trim(),
          phone: document.getElementById("f_phone").value.trim(),
          industry: document.getElementById("f_industry").value.trim(),
        });
        showToast("Client added");
        closeModal();
        await refreshAll();
      } catch (e) {
        showToast(e.message, true);
      }
    });
  });
}

/* ============================================================
   JOBS
   ============================================================ */

async function loadJobs() {
  cache.jobs = await api.getJobs();
  const tbody = document.querySelector("#jobsTable tbody");
  tbody.innerHTML = "";

  if (cache.jobs.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">No jobs yet. Add a client first, then create a job.</td></tr>`;
    return;
  }

  cache.jobs.forEach((j) => {
    const tr = document.createElement("tr");
    const statusClass = `badge-${(j.status || "OPEN").toLowerCase()}`;
    tr.innerHTML = `
      <td>${escapeHtml(j.title)}</td>
      <td>${escapeHtml(j.client ? j.client.companyName : "-")}</td>
      <td>${escapeHtml(j.location || "-")}</td>
      <td><span class="badge ${statusClass}">${escapeHtml(j.status || "OPEN")}</span></td>
      <td>${escapeHtml(j.postedDate || "-")}</td>
      <td class="row-actions">
        <button class="btn btn-danger btn-small" data-delete-job="${j.id}">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("[data-delete-job]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this job? Its applications will be deleted too.")) return;
      try {
        await api.deleteJob(btn.dataset.deleteJob);
        showToast("Job deleted");
        await refreshAll();
      } catch (e) {
        showToast(e.message, true);
      }
    });
  });
}

function openAddJobModal() {
  if (cache.clients.length === 0) {
    return showToast("Add a client first before creating a job", true);
  }
  const clientOptions = cache.clients.map((c) => `<option value="${c.id}">${escapeHtml(c.companyName)}</option>`).join("");

  openModal("New Job", `
    <div class="form-group"><label>Job title *</label><input id="f_title" required /></div>
    <div class="form-group"><label>Client *</label><select id="f_clientId">${clientOptions}</select></div>
    <div class="form-group"><label>Location</label><input id="f_location" placeholder="e.g. Remote" /></div>
    <div class="form-group"><label>Status</label>
      <select id="f_status">
        <option value="OPEN">Open</option>
        <option value="ON_HOLD">On hold</option>
        <option value="CLOSED">Closed</option>
      </select>
    </div>
    <div class="form-group"><label>Description</label><textarea id="f_description"></textarea></div>
    <div class="form-actions">
      <button class="btn btn-secondary" id="cancelBtn">Cancel</button>
      <button class="btn btn-primary" id="saveBtn">Save Job</button>
    </div>
  `, () => {
    document.getElementById("cancelBtn").addEventListener("click", closeModal);
    document.getElementById("saveBtn").addEventListener("click", async () => {
      const title = document.getElementById("f_title").value.trim();
      if (!title) return showToast("Job title is required", true);
      try {
        await api.createJob({
          title,
          description: document.getElementById("f_description").value.trim(),
          location: document.getElementById("f_location").value.trim(),
          status: document.getElementById("f_status").value,
          client: { id: parseInt(document.getElementById("f_clientId").value, 10) },
        });
        showToast("Job added");
        closeModal();
        await refreshAll();
      } catch (e) {
        showToast(e.message, true);
      }
    });
  });
}

/* ============================================================
   CANDIDATES
   ============================================================ */

async function loadCandidates() {
  cache.candidates = await api.getCandidates();
  const tbody = document.querySelector("#candidatesTable tbody");
  tbody.innerHTML = "";

  if (cache.candidates.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="5">No candidates yet. Add your first candidate.</td></tr>`;
    return;
  }

  cache.candidates.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(c.name)}</td>
      <td>${escapeHtml(c.email || "-")}</td>
      <td>${escapeHtml(c.skills || "-")}</td>
      <td>${c.experienceYears != null ? c.experienceYears + " yr" : "-"}</td>
      <td class="row-actions">
        <button class="btn btn-danger btn-small" data-delete-candidate="${c.id}">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("[data-delete-candidate]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this candidate? Their applications will be deleted too.")) return;
      try {
        await api.deleteCandidate(btn.dataset.deleteCandidate);
        showToast("Candidate deleted");
        await refreshAll();
      } catch (e) {
        showToast(e.message, true);
      }
    });
  });
}

function openAddCandidateModal() {
  openModal("New Candidate", `
    <div class="form-group"><label>Full name *</label><input id="f_name" required /></div>
    <div class="form-group"><label>Email</label><input id="f_email" type="email" /></div>
    <div class="form-group"><label>Phone</label><input id="f_phone" /></div>
    <div class="form-group"><label>Skills (comma-separated)</label><input id="f_skills" placeholder="Java, Spring Boot, MySQL" /></div>
    <div class="form-group"><label>Experience (years)</label><input id="f_experienceYears" type="number" min="0" /></div>
    <div class="form-group"><label>Resume link</label><input id="f_resumeLink" placeholder="https://..." /></div>
    <div class="form-actions">
      <button class="btn btn-secondary" id="cancelBtn">Cancel</button>
      <button class="btn btn-primary" id="saveBtn">Save Candidate</button>
    </div>
  `, () => {
    document.getElementById("cancelBtn").addEventListener("click", closeModal);
    document.getElementById("saveBtn").addEventListener("click", async () => {
      const name = document.getElementById("f_name").value.trim();
      if (!name) return showToast("Candidate name is required", true);
      try {
        const expVal = document.getElementById("f_experienceYears").value;
        await api.createCandidate({
          name,
          email: document.getElementById("f_email").value.trim(),
          phone: document.getElementById("f_phone").value.trim(),
          skills: document.getElementById("f_skills").value.trim(),
          resumeLink: document.getElementById("f_resumeLink").value.trim(),
          experienceYears: expVal ? parseInt(expVal, 10) : null,
        });
        showToast("Candidate added");
        closeModal();
        await refreshAll();
      } catch (e) {
        showToast(e.message, true);
      }
    });
  });
}

/* ============================================================
   PIPELINE / KANBAN BOARD
   ============================================================ */

async function loadPipeline() {
  cache.applications = await api.getApplications();
  renderKanban();
}

function renderKanban() {
  const board = document.getElementById("kanbanBoard");
  board.innerHTML = "";

  STAGES.forEach((stage) => {
    const cardsInStage = cache.applications.filter((a) => a.stage === stage);

    const column = document.createElement("div");
    column.className = `kanban-column col-${stage}`;
    column.dataset.stage = stage;

    column.innerHTML = `
      <div class="kanban-column-header">
        <span>${STAGE_LABELS[stage]}</span>
        <span class="kanban-count">${cardsInStage.length}</span>
      </div>
      <div class="kanban-cards" data-stage="${stage}"></div>
    `;

    const cardsContainer = column.querySelector(".kanban-cards");

    cardsInStage.forEach((app) => {
      const card = document.createElement("div");
      card.className = "kanban-card";
      card.draggable = true;
      card.dataset.appId = app.id;

      const stageOptions = STAGES.map(
        (s) => `<option value="${s}" ${s === app.stage ? "selected" : ""}>${STAGE_LABELS[s]}</option>`
      ).join("");

      card.innerHTML = `
        <div class="card-name">${escapeHtml(app.candidateName || "Unknown candidate")}</div>
        <div class="card-job">${escapeHtml(app.jobTitle || "Unknown job")}</div>
        <div class="card-client">${escapeHtml(app.clientName || "")}</div>
        <div class="card-actions">
          <select data-move-app="${app.id}">${stageOptions}</select>
          <button class="btn btn-danger btn-small" data-delete-app="${app.id}">Remove</button>
        </div>
      `;

      card.addEventListener("dragstart", () => {
        card.classList.add("dragging");
        card.dataset.dragging = "true";
      });
      card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
      });

      cardsContainer.appendChild(card);
    });

    // Drag-and-drop target behaviour
    column.addEventListener("dragover", (e) => {
      e.preventDefault();
      column.classList.add("dragover");
    });
    column.addEventListener("dragleave", () => column.classList.remove("dragover"));
    column.addEventListener("drop", async (e) => {
      e.preventDefault();
      column.classList.remove("dragover");
      const draggingCard = document.querySelector(".kanban-card.dragging");
      if (!draggingCard) return;
      const appId = draggingCard.dataset.appId;
      const newStage = column.dataset.stage;
      try {
        await api.updateStage(appId, newStage);
        showToast(`Moved to ${STAGE_LABELS[newStage]}`);
        await loadPipeline();
      } catch (err) {
        showToast(err.message, true);
      }
    });

    board.appendChild(column);
  });

  // Dropdown-based stage change (accessible alternative to drag & drop)
  board.querySelectorAll("[data-move-app]").forEach((select) => {
    select.addEventListener("change", async () => {
      try {
        await api.updateStage(select.dataset.moveApp, select.value);
        showToast(`Moved to ${STAGE_LABELS[select.value]}`);
        await loadPipeline();
      } catch (e) {
        showToast(e.message, true);
      }
    });
  });

  board.querySelectorAll("[data-delete-app]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Remove this application from the pipeline?")) return;
      try {
        await api.deleteApplication(btn.dataset.deleteApp);
        showToast("Removed from pipeline");
        await loadPipeline();
      } catch (e) {
        showToast(e.message, true);
      }
    });
  });
}

function openAddApplicationModal() {
  if (cache.candidates.length === 0 || cache.jobs.length === 0) {
    return showToast("Add at least one candidate and one job first", true);
  }
  const candidateOptions = cache.candidates.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
  const jobOptions = cache.jobs.map((j) => `<option value="${j.id}">${escapeHtml(j.title)} — ${escapeHtml(j.client ? j.client.companyName : "")}</option>`).join("");
  const stageOptions = STAGES.filter((s) => s !== "REJECTED").map((s) => `<option value="${s}">${STAGE_LABELS[s]}</option>`).join("");

  openModal("Add to Pipeline", `
    <div class="form-group"><label>Candidate *</label><select id="f_candidateId">${candidateOptions}</select></div>
    <div class="form-group"><label>Job *</label><select id="f_jobId">${jobOptions}</select></div>
    <div class="form-group"><label>Starting stage</label><select id="f_stage">${stageOptions}</select></div>
    <div class="form-group"><label>Notes</label><textarea id="f_notes" placeholder="Optional recruiter notes"></textarea></div>
    <div class="form-actions">
      <button class="btn btn-secondary" id="cancelBtn">Cancel</button>
      <button class="btn btn-primary" id="saveBtn">Add to Pipeline</button>
    </div>
  `, () => {
    document.getElementById("cancelBtn").addEventListener("click", closeModal);
    document.getElementById("saveBtn").addEventListener("click", async () => {
      try {
        await api.createApplication({
          candidateId: parseInt(document.getElementById("f_candidateId").value, 10),
          jobId: parseInt(document.getElementById("f_jobId").value, 10),
          stage: document.getElementById("f_stage").value,
          notes: document.getElementById("f_notes").value.trim(),
        });
        showToast("Added to pipeline");
        closeModal();
        await loadPipeline();
      } catch (e) {
        showToast(e.message, true);
      }
    });
  });
}

/* ---------------------------- utilities ---------------------------- */

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ---------------------------- wiring + init ---------------------------- */

document.getElementById("openAddClientBtn").addEventListener("click", openAddClientModal);
document.getElementById("openAddJobBtn").addEventListener("click", openAddJobModal);
document.getElementById("openAddCandidateBtn").addEventListener("click", openAddCandidateModal);
document.getElementById("openAddApplicationBtn").addEventListener("click", openAddApplicationModal);

async function refreshAll() {
  await loadClients();
  await loadJobs();
  await loadCandidates();
  await loadPipeline();
}

(async function init() {
  await checkApiStatus();
  await refreshAll();
})();
