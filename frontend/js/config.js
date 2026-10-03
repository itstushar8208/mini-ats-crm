// Deployment configuration.
// GitHub Actions replaces __API_BASE_URL__ with the API_BASE_URL repository variable.
// For local development, the fallback in app.js uses http://localhost:8080/api.
window.ATS_API_BASE = "__API_BASE_URL__";
