# 🔐 Security Implementation Checklist

## IMMEDIATE ACTIONS (Complete Today)

### 1. Generate New Secrets
```bash
cd backend
node scripts/generateSecrets.js
```
Copy the output and update your `.env` file:
- [ ] Update `JWT_SECRET`
- [ ] Update `SESSION_SECRET`  
- [ ] Update `CSRF_SECRET`
- [ ] Update `API_KEY`

### 2. Rotate Paystack Keys
- [ ] Go to https://dashboard.paystack.com/settings/api-keys
- [ ] Click "Regenerate Secret Key"
- [ ] Update `PAYSTACK_SECRET_KEY` in `.env`
- [ ] Update production environment variables

### 3. Install XSS Prevention Package
```bash
cd backend
npm install xss  # Already done ✅
```

### 4. Verify .env.example Is Correct
- [ ] Ensure `.env.example` has NO real secrets
- [ ] Add `.env` to `.gitignore` (if not already)
- [ ] Run `git status` to confirm `.env` is ignored

---

## DEPLOYMENT CHECKLIST

### Before Deploying to Production

#### Database Security
- [ ] Enable MongoDB IP whitelist (Network Access tab)
- [ ] Remove "0.0.0.0/0" (allows all IPs)
- [ ] Add only production server IP
- [ ] Enable encryption at rest
- [ ] Enable backups with encryption
- [ ] Review user permissions (least privilege)

#### Environment Variables
- [ ] All secrets rotated and unique
- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_URL` set to production domain
- [ ] `REACT_APP_API_URL` pointing to production backend
- [ ] `JWT_SECRET` is 32+ bytes
- [ ] No console.log statements with sensitive data

#### API Security
- [ ] HTTPS enforced in production ✅
- [ ] HSTS headers enabled ✅
- [ ] Rate limiting configured ✅
- [ ] CORS whitelist updated for production domains ✅
- [ ] CSP headers set ✅

#### Authentication
- [ ] Password requirements enforced ✅
- [ ] Login rate limiting active ✅
- [ ] Email verification required ✅
- [ ] JWT tokens have short expiry (recommend 24 hours)
- [ ] Refresh tokens stored securely

#### Data Protection
- [ ] User input validation/sanitization ✅
- [ ] Database field encryption for sensitive data
- [ ] No sensitive data in error messages ✅
- [ ] Logs don't contain sensitive data
- [ ] Database backups encrypted

---

## TESTING CHECKLIST

### Password Validation
Test with these passwords:
```
❌ "pass"              → Too short
❌ "password1"         → No special char
❌ "Password1"         → Repeat password, no special
✅ "MyP@ssw0rd!"       → Valid (12+ chars, all requirements)
✅ "Secure#Pass2024"  → Valid
```

### Authorization Testing
1. Create two test users (testuser1@test.com, testuser2@test.com)
2. Login as testuser1, create a deal
3. Copy deal ID
4. Login as testuser2
5. Try to access testuser1's deal:
   ```
   GET /api/deals/{deal_id_from_user1}
   ```
   **Expected**: 404 error "Deal not found"
   **Not Acceptable**: See testuser1's deal data

### Rate Limiting Testing
1. Open browser console, login 5 times rapidly:
   ```javascript
   fetch('/api/auth/login', {
     method: 'POST',
     body: JSON.stringify({email, password})
   })
   ```
   **Expected**: 5th attempt gets rate limit error
   **Not Acceptable**: All 5 succeed

### XSS Prevention Testing
1. Create a deal with name: `<script>alert('XSS')</script>`
2. Check if script executes
   **Expected**: No alert, script appears as text
   **Not Acceptable**: Alert pops up

### HTTPS Enforcement Testing (Production Only)
1. Try: `http://app.deal-clarity.com`
   **Expected**: Redirects to `https://app.deal-clarity.com`
2. Check Response Headers tab in DevTools
   **Expected**: `Strict-Transport-Security: max-age=31536000`

---

## ONGOING SECURITY TASKS

### Weekly
- [ ] Review authentication logs for suspicious patterns
- [ ] Check rate limit triggers
- [ ] Monitor error logs for exploits

### Monthly  
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Review firewall rules
- [ ] Check database backup integrity
- [ ] Review user access logs

### Quarterly
- [ ] Rotate API keys and secrets
- [ ] Update security policy
- [ ] Penetration test key features
- [ ] Run `snyk test` for dependency scanning

### Annually
- [ ] Full security audit
- [ ] Update compliance documentation
- [ ] Penetration testing by professionals
- [ ] Review and update security policy

---

## VULNERABILITY RESPONSE PLAN

### If a Breach Is Suspected:

1. **Immediate Actions** (0-1 hour)
   - [ ] Disable affected user accounts
   - [ ] Revoke all active sessions
   - [ ] Rotate all secrets immediately
   - [ ] Enable extra logging
   - [ ] Check for unauthorized access in logs

2. **Investigation** (1-24 hours)
   - [ ] Review access logs for the breach time window
   - [ ] Check what data was accessed
   - [ ] Identify root cause
   - [ ] Assess impact scope

3. **Notification** (24-72 hours)
   - [ ] Notify affected users
   - [ ] Document incident details
   - [ ] Update security policy based on lessons learned
   - [ ] Deploy patch/fix

4. **Recovery** (Ongoing)
   - [ ] Restore from clean backups if needed
   - [ ] Monitor for re-compromise
   - [ ] Enhanced monitoring for 30 days

---

## SECURITY MONITORING SETUP

### Logs to Monitor
Add to your logging/monitoring system:

```javascript
// Failed login attempts (5+ per IP in 15 min)
⚠️ Failed login attempt for user: {userId}

// Authorization violations
⚠️ Unauthorized access attempt: User {userId} tried to access deal {dealId} owned by {ownerId}

// Rate limit violations  
Rate limit exceeded: {ip}, path: {path}, method: {method}

// CORS violations
⚠️ CORS blocked origin: {origin}

// Validation failures
Invalid email format, ObjectId format, etc.
```

### Alerts to Set Up
- [ ] 5+ failed login attempts from same IP in 15 minutes
- [ ] Single user with 10+ authorization failures
- [ ] 10+ rate limit violations from same IP
- [ ] XSS/injection attempts in request bodies
- [ ] Unusual data export activities

---

## SECURITY HEADERS VERIFICATION

Test that headers are present in production:

```bash
curl -I https://api.deal-clarity.com/api/health

# Should see:
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
# X-Content-Type-Options: nosniff
# X-Frame-Options: SAMEORIGIN
# X-XSS-Protection: 1; mode=block
# Content-Security-Policy: ...
```

---

## FILES CREATED/MODIFIED

### New Files
- ✅ `backend/src/middleware/validation.js` - Input validation
- ✅ `backend/src/middleware/authorization.js` - Resource ownership checks
- ✅ `backend/scripts/generateSecrets.js` - Secrets generator
- ✅ `SECURITY_HARDENING.md` - Security documentation

### Modified Files
- ✅ `backend/src/routes/auth.js` - Password strength, rate limiting
- ✅ `backend/src/config/rateLimit.js` - New rate limiters
- ✅ `backend/src/index.js` - Security headers, HTTPS, request limits
- ✅ `backend/src/routes/deals.js` - ID validation, better error handling

---

## NEXT STEPS FOR ROUTES

Apply the same security improvements to all routes:

```javascript
// Template for all GET/:id routes
router.get('/:id', auth, async (req, res) => {
  try {
    // 1. Validate ObjectId format
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // 2. Check ownership
    const resource = await Resource.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    // 3. Log suspicious access
    if (!resource) {
      console.warn(`⚠️ Unauthorized access: User ${req.user._id} tried to access ${req.params.id}`);
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json(resource);
  } catch (error) {
    // 4. Generic error message to user
    console.error('Error details:', error); // Details in logs only
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

Apply this pattern to:
- ✅ `deals.js` (DONE)
- [ ] `contacts.js`
- [ ] `tasks.js`
- [ ] `notes.js`
- [ ] `emailTemplates.js`
- [ ] Other resource routes

---

## HELPFUL COMMANDS

```bash
# Generate a new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Check for vulnerabilities
npm audit
npm audit fix

# Check outdated packages
npm outdated

# Security scanning
npm install -g snyk
snyk test

# Check for secrets in git history
npm install -g truffleHog
trufflehog --help

# Restart backend after .env changes
npm run start
```

---

## RESOURCES

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)
- [Node.js Security](https://nodejs.org/en/docs/guides/nodejs-security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## CONTACT & SUPPORT

For security questions or to report vulnerabilities:
- Email: security@deal-clarity.com
- Do not disclose vulnerabilities publicly before patching
- Security patch response time: 48 hours
