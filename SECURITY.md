# NUKKAD BEATS Security Implementation Details

This document outlines the security measures implemented in the NUKKAD BEATS application based on the OWASP Top 10 recommendations and enterprise-grade security standards.

## 1. Authentication & Session Management (OWASP A07:2021)
- **HttpOnly Cookies**: JWT tokens are no longer exposed to the frontend JavaScript via LocalStorage. They are stored in `HttpOnly`, `Secure`, and `SameSite` cookies, mitigating XSS attacks where attackers could steal tokens.
- **Account Lockout**: Implemented a lockout mechanism to prevent brute-force attacks. After 5 failed login attempts, the account is locked for 15 minutes.
- **Strict Password Policies**: Enforced strong password validation (minimum 8 characters, requiring uppercase, lowercase, numbers, and special characters) using `zod` schemas.

## 2. Input Validation & Sanitization (OWASP A03:2021)
- **Sanitization Middleware**: Integrated `DOMPurify` combined with `jsdom` to strictly sanitize all incoming HTTP request bodies. This strips out malicious HTML tags or scripts to prevent Cross-Site Scripting (XSS).
- **Zod Validation**: Applied robust schema validation for all endpoints using Zod.

## 3. Rate Limiting & DDoS Protection (OWASP A04:2021)
- **Global Rate Limiting**: General API requests are limited to 100 requests per 15 minutes per IP.
- **Endpoint-Specific Limiting**:
  - `Auth Routes`: Strict limits (e.g., 5-10 requests per 15 minutes) for login, register, and password reset endpoints to mitigate brute forcing.
  - `Booking & Admin Routes`: Limits of 50 requests per 15 minutes to prevent abuse of operational APIs.
- **Slow Down Mitigation**: Integrated `express-slow-down` to gradually increase response time for IPs making rapid requests, effectively frustrating bot networks.

## 4. HTTP Security Headers (OWASP A05:2021)
- **Helmet**: Integrated `helmet` to set a wide array of security-related HTTP headers.
- **Content Security Policy (CSP)**: Added strict directives restricting where scripts, styles, and images can be loaded from.
- **HSTS**: Enforced HTTP Strict Transport Security to ensure the client communicates exclusively over HTTPS.
- **Frameguard**: Prevented Clickjacking by denying iframe embedding.

## 5. Secure File Uploads (OWASP A04:2021)
- **Multer Hardening**: File uploads are strictly validated. Only specific image mimetypes (`image/jpeg`, `image/png`, `image/webp`) are allowed.
- **Extension Validation**: Regex filters out files with double extensions (e.g., `image.png.exe`).
- **Memory Buffer**: Files are processed securely in memory or tightly controlled directories rather than direct disk execution.

## 6. Access Control & Authorization (OWASP A01:2021)
- **Role-Based Access Control (RBAC)**: All Admin routes enforce a strict `requireRole(['ADMIN'])` middleware check, ensuring only users with the `ADMIN` role can access or modify sensitive data.

## 7. Security Logging & Monitoring (OWASP A09:2021)
- **Winston Logger**: Centralized structured logging for backend operations. Errors and critical events are securely logged for audit purposes.
- **Morgan Integration**: Detailed HTTP request logging is active in development and sanitized in production.
- **Error Obfuscation**: The global error handler prevents stack traces and sensitive database errors from being leaked to the client in production mode.

## 8. Cross-Origin Resource Sharing (CORS)
- **Strict Origin Mapping**: Configured CORS to only accept requests from the designated frontend domain, with `credentials: true` to support the new cookie-based auth flow.

---
*Security is an ongoing process. This document should be reviewed periodically alongside regular dependency audits and vulnerability scans.*
