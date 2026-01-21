# Security Hardening Checklist

## ✅ Pre-Deployment Security Measures (COMPLETED)

### 1. Secrets Management
- [x] **Removed hardcoded database credentials** from `backend/src/main/resources/application.properties`
  - Replaced with environment variables: `${QUARKUS_DATASOURCE_JDBC_URL}`, `${QUARKUS_DATASOURCE_USERNAME}`, `${QUARKUS_DATASOURCE_PASSWORD}`
  
- [x] **Created comprehensive `.env.example`** template
  - Documents all required environment variables
  - Includes security warnings
  - Contains deployment checklist

- [x] **Configured dynamic CORS origins**
  - Changed from hardcoded values to `${CORS_ORIGINS}` environment variable
  - Allows production domain configuration without code changes

### 2. Network Security
- [x] **Removed direct port exposure**
  - Backend (8080): No longer exposed to internet
  - Middleware (3000): No longer exposed to internet
  - Only frontend (80) is publicly accessible
  - All internal communication through Docker network

- [x] **Implemented reverse proxy architecture**
  - Nginx frontend proxies API requests to middleware
  - Middleware communicates with backend via internal network
  - Prevents direct API access bypassing authentication

- [x] **Changed to standard HTTP port**
  - Frontend now uses port 80 instead of 3001
  - Easier for future HTTPS/SSL setup

### 3. Container Security
- [x] **Added restart policies**
  - All services configured with `restart: unless-stopped`
  - Ensures automatic recovery from crashes
  - Maintains availability during updates

- [x] **Health checks configured**
  - Backend has health endpoint monitoring
  - Enables container orchestration

### 4. Configuration Management
- [x] **Centralized environment configuration**
  - Single `.env` file for all services
  - Clear separation of dev and prod configs
  - Environment-specific CORS and URLs

---

## ⚠️ Required Actions Before Deployment

### 1. Generate Strong Secrets
```bash
# Generate SESSION_SECRET (32+ characters)
openssl rand -base64 32

# Store in .env file
SESSION_SECRET=<generated-value>
```

### 2. Configure SMTP Service
Choose one option:

**Option A: Gmail**
- Enable 2FA on Google account
- Generate app-specific password
- Update .env with credentials

**Option B: AWS SES (Recommended)**
- Verify email in SES console
- Generate SMTP credentials
- Free tier: 62,000 emails/month from EC2

### 3. Update Production URLs
```bash
# In .env file:
FRONTEND_URL=http://YOUR-AWS-IP
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://YOUR-AWS-IP
```

### 4. Secure .env File
```bash
# Never commit to git
echo ".env" >> .gitignore

# Set restrictive permissions on server
chmod 600 .env
```

---

## 🛡️ AWS Security Group Configuration

### Inbound Rules (STRICT)
```
Port 22 (SSH):    Your IP only     - Remote access
Port 80 (HTTP):   0.0.0.0/0        - Public web access
```

### Ports to NEVER Open
- ❌ Port 8080 (Backend) - Internal only
- ❌ Port 3000 (Middleware) - Internal only  
- ❌ Port 3001 (Old frontend) - No longer used
- ❌ Port 5432 (Database) - Managed by Neon, not on EC2

### Outbound Rules
```
All traffic:      0.0.0.0/0        - Allow outbound connections
```

---

## 🔐 Additional Security Recommendations

### Immediate (Before Going Live)

1. **Enable HTTPS/SSL**
   ```bash
   # Requires domain name
   sudo certbot --nginx -d yourdomain.com
   ```

2. **Restrict SSH Access**
   ```bash
   # Change from port 22 to custom port
   # Update security group accordingly
   ```

3. **Enable Firewall**
   ```bash
   sudo systemctl start firewalld
   sudo firewall-cmd --permanent --add-service=http
   sudo firewall-cmd --permanent --add-service=ssh
   sudo firewall-cmd --reload
   ```

4. **Setup Automatic Updates**
   ```bash
   sudo yum install -y yum-cron
   sudo systemctl enable yum-cron
   ```

### Future Improvements

1. **Session Persistence**
   - Current: In-memory sessions (lost on restart)
   - Upgrade: Add Redis container for persistent sessions
   - Benefit: Zero-downtime deployments

2. **Database Backups**
   - Neon handles backups automatically
   - Consider additional backup strategy
   - Test restore procedures

3. **Secrets Management**
   - Use AWS Secrets Manager
   - Automatic secret rotation
   - Encrypted storage

4. **Monitoring & Alerting**
   - CloudWatch logs integration
   - CPU/Memory alerts
   - Error rate tracking

5. **Rate Limiting**
   - Add Nginx rate limiting
   - Prevent brute force attacks
   - DDoS protection

6. **WAF (Web Application Firewall)**
   - AWS WAF integration
   - SQL injection prevention
   - XSS protection

---

## 📊 Security Verification Tests

### Post-Deployment Tests

```bash
# 1. Verify port exposure (run from LOCAL machine)
nmap -p 22,80,3000,8080 YOUR-AWS-IP

# Expected result:
# 22/tcp open  ssh
# 80/tcp open  http
# 3000/tcp filtered (blocked)
# 8080/tcp filtered (blocked)

# 2. Test CORS (should only allow configured origins)
curl -H "Origin: http://malicious-site.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS http://YOUR-AWS-IP/api/login

# Expected: No CORS headers returned

# 3. Test direct backend access (should fail)
curl http://YOUR-AWS-IP:8080/api/users/health
# Expected: Connection refused

# 4. Test through frontend proxy (should work)
curl http://YOUR-AWS-IP/api/health
# Expected: Success response
```

### Security Audit Checklist

- [ ] No hardcoded credentials in source code
- [ ] `.env` file has 600 permissions
- [ ] `.env` is in `.gitignore`
- [ ] Only port 80 exposed to internet
- [ ] SSH restricted to specific IP
- [ ] HTTPS enabled (or planned)
- [ ] Strong session secret generated
- [ ] Database uses SSL connection
- [ ] SMTP uses TLS encryption
- [ ] Containers restart automatically
- [ ] Regular security updates enabled
- [ ] Monitoring and alerting configured
- [ ] Backup strategy in place

---

## 🚨 Incident Response

### If Compromised

1. **Immediate Actions**
   ```bash
   # Stop all services
   docker-compose down
   
   # Review logs
   docker-compose logs > incident-logs.txt
   
   # Check for unauthorized access
   sudo lastlog
   sudo grep "Failed password" /var/log/secure
   ```

2. **Rotate Credentials**
   - Change SESSION_SECRET
   - Rotate database password (Neon console)
   - Change SMTP credentials
   - Regenerate SSH keys

3. **Update Security Groups**
   - Review and tighten rules
   - Enable VPC Flow Logs

4. **Investigate**
   - Check container logs
   - Review CloudWatch metrics
   - Analyze access patterns

---

## 📝 Security Compliance Notes

### Data Protection
- **Database**: SSL/TLS encrypted connection to Neon
- **Passwords**: Bcrypt hashed with salt (in backend code)
- **Sessions**: Secure cookies with HttpOnly flag
- **Email**: TLS encryption for SMTP

### Network Security
- **Internal Services**: Isolated in Docker network
- **External Access**: Only through authenticated frontend
- **API Gateway**: Nginx reverse proxy with security headers

### Access Control
- **Authentication**: Session-based
- **Authorization**: Role-based (if implemented)
- **Audit Trail**: Logs all authentication attempts

---

## 🎓 Security Best Practices Applied

1. **Principle of Least Privilege**
   - Minimal port exposure
   - Restrictive security groups
   - Internal service isolation

2. **Defense in Depth**
   - Multiple security layers
   - Network + application + container security
   - Firewalls at AWS and OS level

3. **Secure by Default**
   - Environment variables for secrets
   - HTTPS ready architecture
   - Automatic restarts enabled

4. **Zero Trust**
   - All services isolated
   - No direct backend access
   - Authentication required for all operations

---

**Security Status**: ✅ Pre-deployment hardening complete

**Next Steps**: 
1. Generate production secrets
2. Configure SMTP service
3. Deploy to AWS following DEPLOYMENT.md
4. Complete post-deployment verification tests
