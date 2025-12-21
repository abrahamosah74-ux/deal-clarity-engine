# Email Verification & Credential Validation - Testing Guide

## Quick Test Setup

### 1. Start the Services

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The app will be available at `http://localhost:3000`

## Testing Scenarios

### Test 1: Successful Signup with Email Verification

**Steps:**
1. Click "Sign Up" tab in Login page
2. Fill in:
   - Full Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
   - Company: "Test Corp" (optional)
3. Click "Create Account"

**Expected Results:**
- Form submits without error
- Verification screen appears
- Message shows: "We've sent a verification code to test@example.com"
- Input field prompts for 6-character code
- "Back to Login" button available

**Verification Email:**
Check console or email service logs for verification code (format: 6 uppercase hex characters like "A1B2C3")

**Complete Verification:**
1. Enter the 6-character code from email
2. Click "Verify Email"
3. Should see success toast: "Email verified successfully!"
4. User auto-logged in and redirected to dashboard

---

### Test 2: Resend Verification Code

**Steps:**
1. Complete signup steps from Test 1 (up to verification screen)
2. Wait 10+ seconds to simulate no email received scenario
3. Click "Resend Verification Code" button

**Expected Results:**
- Button shows loading spinner while sending
- Success toast appears: "Verification code sent to your email"
- New code is generated and sent
- User can use new code to verify

---

### Test 3: Invalid Verification Code

**Steps:**
1. Complete signup and show verification screen
2. Enter wrong 6-character code (e.g., "WRONG1")
3. Click "Verify Email"

**Expected Results:**
- Error toast appears: "Invalid verification code"
- User stays on verification screen
- Can retry with correct code

---

### Test 4: Expired Verification Code

**Steps:**
1. Sign up with email
2. Wait 24 hours (or modify backend to test with shorter expiry)
3. Try to verify with code

**Expected Results:**
- Error toast: "Verification code expired"
- Show "Resend Verification Code" button
- User generates new code to verify

---

### Test 5: Login with Unverified Email

**Steps:**
1. Sign up for account but don't verify email
2. Go to "Sign In" tab
3. Enter email and password
4. Click "Sign In"

**Expected Results:**
- Verification screen appears
- Message: "We've sent a verification code to {email}"
- User can verify to proceed
- User cannot access app without verification

---

### Test 6: Login with Correct Credentials

**Steps:**
1. Sign up and verify email (complete Test 1)
2. Logout (if auto-logged in)
3. Go to "Sign In" tab
4. Enter verified email and correct password
5. Click "Sign In"

**Expected Results:**
- Form submits
- Success toast: "Welcome back!"
- User redirected to dashboard
- Authenticated session established

---

### Test 7: Login with Wrong Password

**Steps:**
1. Sign up and verify email
2. Go to "Sign In" tab
3. Enter correct email but wrong password
4. Click "Sign In"

**Expected Results:**
- Error toast: "Invalid email or password"
- Form stays intact for retry
- User stays on login page
- No security info about which part was wrong (security best practice)

---

### Test 8: Login with Non-Existent Email

**Steps:**
1. Go to "Sign In" tab
2. Enter email that was never registered
3. Enter any password
4. Click "Sign In"

**Expected Results:**
- Error toast: "Invalid email or password"
- Form stays intact
- Same generic error as wrong password (security)

---

### Test 9: Signup with Existing Email

**Steps:**
1. Sign up with email "user@example.com"
2. Try to sign up again with same email
3. Fill form and click "Create Account"

**Expected Results:**
- Error toast: "Email already registered"
- Form stays intact
- User redirected to login or offered to login with existing account

---

### Test 10: Signup with Invalid Email Format

**Steps:**
1. Go to Sign Up tab
2. Enter invalid email formats:
   - "notanemail"
   - "email@nodomain"
   - "@example.com"
3. Try to submit

**Expected Results:**
- HTML5 validation prevents submission
- Or backend returns error: "Invalid email format"

---

### Test 11: Signup with Weak Password

**Steps:**
1. Go to Sign Up tab
2. Enter password less than 6 characters: "pass"
3. Try to submit

**Expected Results:**
- Error toast: "Password must be at least 6 characters"
- Form stays intact for retry

---

### Test 12: Back Button on Verification Screen

**Steps:**
1. Complete signup and show verification screen
2. Click "Back to Login" button

**Expected Results:**
- Verification screen closes
- Login form reappears
- Can switch between Sign In and Sign Up tabs

---

## Edge Cases to Test

### Edge Case 1: Rapid Verification Attempts
- Try entering wrong code multiple times quickly
- Should handle gracefully without server errors

### Edge Case 2: Session Timeout During Verification
- Start signup, wait for session timeout
- Try to verify - should redirect to login

### Edge Case 3: Browser Refresh During Verification
- Refresh page on verification screen
- Should return to verification screen (email in state or URL)

### Edge Case 4: Multiple Login Attempts
- Try logging in 3-5 times with wrong password quickly
- Verify no brute force lockout (future feature)

### Edge Case 5: Code Copy-Paste
- Receive email with verification code
- Copy and paste (with possible spaces)
- Should trim and handle gracefully

---

## Debugging Tips

### Check Verification Code
**Backend Console:**
```javascript
// Add temporary logging in auth.js register route
console.log('Verification code:', verificationCode);
```

Or check database:
```javascript
// MongoDB
db.users.findOne({ email: "test@example.com" }).emailVerificationCode
```

### Check Email Service
**Test Email Service Separately:**
```bash
# In Node console
const { sendVerificationEmail } = require('./backend/src/services/emailService');
await sendVerificationEmail('your-email@example.com', 'Test', 'ABC123');
```

### Check Frontend State
**React DevTools:**
- Install React Developer Tools browser extension
- Check AuthContext state in Components tab
- Watch state changes during signup/login

### Check Network Requests
**Browser DevTools - Network Tab:**
1. Open DevTools (F12)
2. Go to Network tab
3. Trigger signup/login
4. Check request/response bodies:
   - `/api/auth/register`
   - `/api/auth/verify-email`
   - `/api/auth/login`

### Check LocalStorage
**Browser DevTools - Application Tab:**
1. Open DevTools (F12)
2. Go to Application tab
3. Check LocalStorage:
   - `token` (should be present after verification)
   - `user` (user object JSON)
   - `userName`, `userEmail`

---

## Test Data

### Sample Credentials for Testing

**Valid Test Account (after signup):**
```
Email: testuser@example.com
Password: SecurePass123
Verification Code: (sent to email)
```

**Test Company Names:**
- Acme Corp
- TechStart Inc
- Global Solutions
- Innovation Labs

**Test Email Domains:**
- example.com
- test.com
- gmail.com
- company.com

---

## Performance Testing

### Response Times to Check

| Operation | Expected Time | Notes |
|-----------|--------------|-------|
| Signup | < 2 seconds | Includes email send |
| Verify Email | < 1 second | Just database update |
| Resend Code | < 2 seconds | Resends email |
| Login Success | < 1 second | JWT creation |
| Login Fail | < 1 second | Database lookup |

### Load Testing Checklist
- [ ] 10 concurrent signups
- [ ] 10 concurrent verification attempts
- [ ] 10 concurrent logins
- [ ] Multiple resend requests
- [ ] Check database query performance

---

## Security Testing

### Things to Verify

1. **Credentials Not Exposed**
   - Check network tab - password not in plaintext
   - Verification code not in URLs
   - Token not exposed in error messages

2. **CSRF Protection**
   - Check if CORS is configured properly
   - Verify same-origin requests only (if applicable)

3. **Rate Limiting**
   - Test rapid resend attempts (should limit)
   - Test rapid login attempts (monitor for patterns)
   - Check for brute force protection

4. **Input Validation**
   - SQL injection attempts in email field
   - XSS in name field
   - Very long inputs

5. **Session Security**
   - Token expiry working (default 7 days)
   - Logout properly clears session
   - Refresh token mechanism (if implemented)

---

## Automated Test Examples

### Jest Unit Test Example
```javascript
describe('Email Verification', () => {
  test('should send verification email on signup', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.requiresVerification).toBe(true);
  });

  test('should verify email with correct code', async () => {
    // First signup
    const signupRes = await signup({...});
    const code = getVerificationCode(); // Get from email/db
    
    // Then verify
    const verifyRes = await request(app)
      .post('/api/auth/verify-email')
      .send({
        email: 'test@example.com',
        verificationCode: code
      });
    
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.token).toBeDefined();
  });

  test('should reject wrong verification code', async () => {
    const response = await request(app)
      .post('/api/auth/verify-email')
      .send({
        email: 'test@example.com',
        verificationCode: 'WRONG1'
      });
    
    expect(response.status).toBe(401);
    expect(response.body.error).toContain('Invalid');
  });
});
```

---

## Checklist for Production Readiness

- [ ] Email service configured for production SMTP
- [ ] Verification code expiry set appropriately (24 hours)
- [ ] Rate limiting implemented
- [ ] Error messages don't reveal sensitive info
- [ ] HTTPS enabled (for production)
- [ ] CORS configured correctly
- [ ] JWT secrets stored in environment
- [ ] Email templates professionally formatted
- [ ] Logging configured for audit trail
- [ ] Database backups working
- [ ] Monitoring/alerting set up for failed verifications
- [ ] User support documentation ready
- [ ] Terms of Service mention email verification requirement

---

## Support Information

For issues or questions about the implementation:
1. Check this guide first
2. Review EMAIL_VERIFICATION_GUIDE.md for technical details
3. Check backend logs for error details
4. Check browser console for frontend errors
5. Review database for user state

---

**Last Updated:** [Current Date]
**Version:** 1.0
**Status:** Ready for Testing
