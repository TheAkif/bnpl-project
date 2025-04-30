# Security Considerations

- **Restrict Admin Access** 
  Limit access to the Django admin panel with IP whitelisting and strong passwords.
- **Use Strong Authentication**
  Enforce strong password policies and consider 2FA for users/admins.
- **Keep Django and Dependencies Updated**
  Regularly patch and update packages to fix vulnerabilities.
- **Authentication & Encryption**  
  All API calls require JWT over HTTPS. Secrets and database credentials are stored in environment variables via `django-environ`.  
- **Input Validation & Permissions**  
  DRF serializers enforce field constraints (amounts, dates, email lookup) and prevent unauthorized access via permission classes.  
- **Rate Limiting & Throttling**  
  DRF throttling limits POSTs on plan creation and payments to mitigate abuse.  
- **Data Protection**  
  No sensitive payment data is stored. In production, a PCI‑compliant payment provider should be used.  
- **Task Security**  
  Celery tasks run in separate workers; message brokers should be secured (e.g. with TLS and credentials).  
  - **Logging & Auditing**  
  Structured logging (using Python’s `logging` module) captures request lifecycles, errors, and background-task activity. In production, logs should be centralized (e.g., ELK stack) and retained for auditing.  
- **Observability & Monitoring**  
  Integrate error‐tracking (e.g., Sentry) and metrics (e.g., Prometheus) to monitor API health and background jobs.  
- **API Gateway & WAF**  
  In production, front APIs behind a gateway (e.g., nginx or cloud API Gateway) and enable a Web Application Firewall for protection against common web attacks.

## Summary

- Enforce HTTPS
- Set DEBUG = False
- Use secure payment gateways (Stripe, PayPal, etc.)
- Store secrets in environment variables
- Enable CSRF protection
- Validate and sanitize all input
- Use SECURE_* settings (`SECURE_SSL_REDIRECT`, `SECURE_HSTS_SECONDS`, etc.)
- Use secure cookies (`SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`)
- Restrict Django admin access
- Use strong authentication and optional 2FA
- Use database field-level encryption for sensitive data
- Implement rate limiting
- Log all payment transactions securely
- Apply least privilege on user permissions
- Keep all dependencies up-to-date
- Disable browsing directory/file listing on server
- Use WAF or API gateway if possible
- Regularly audit logs and perform penetration testing

## Trade‑offs & Future Enhancements

- **Logging**
  I couldn't add application level logging due to time constraints.
- **Dockerization**  
  I would add a Dockerfile and Docker Compose (or Kubernetes manifests) to spin up all services (backend, Celery, database, frontend) with a single command across dev/staging/prod.  
- **RBAC vs. ABAC**  
  I used role‑based access control (RBAC) for simplicity; attribute‑based access control (ABAC) would allow more granular policies but adds complexity.  
- **API Gateway Configuration**  
  I would configure nginx (or a cloud API Gateway) for SSL termination, rate limiting, and request routing.  
- **Toast UI Design**  
  The toast notifications work but the design is slightly off; with more time I'd refine the styling and placement.  
- **Frontend Testing**  
  I haven't written end‑to‑end tests or full unit tests for the React app; adding those would increase confidence in the UI.  
- **Public Cloud Deployment**  
  A real deployment target-AWS EC2/Lambda, GCP Compute Engine, or similar would be added in production.  
- **CI/CD Pipeline**  
  Automate linting, testing, builds, and deployments via GitHub Actions, Circle CI, or Jenkins for continuous integration and delivery.  
- **Background Task Validation**  
  I implemented Celery tasks for marking late installments and sending reminders but lacked time to write reliable integration tests or timezone handling for Riyadh.  
- **Pagination & Filtering**  
  Client‑side pagination is in place; server‑side pagination and filtering for large datasets would improve scalability.  
- **TypeScript Migration**  
  Migrating the frontend to TypeScript would add type safety and reduce runtime errors.  
- **Caching**  
  Integrate Redis or in‑memory caches for frequently computed analytics to improve performance.  
- **Feature Flags**  
  Use a feature‐flag system to roll out changes safely.  
- **Production Gunicorn Deployment**  
  - Use Gunicorn’s pre‑fork worker model to spawn multiple worker processes (e.g., `gunicorn --workers 3 --threads 2`) for both CPU‑bound and I/O work.  
  - Configure graceful reloads (`SIGHUP`) and timeouts to minimize downtime during deployments.  
  - Run behind Nginx (SSL termination, static file offloading, load balancing) for added security and performance.  
  