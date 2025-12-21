# Email Verification API Reference

## Complete API Documentation

### Base URL
```
http://localhost:5000/api/auth
```

---

## 1. POST /register
Register a new user account with email verification requirement.

### Request
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "company": "Acme Inc"
}
```

### Parameters
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | Yes | Not empty |
| email | string | Yes | Valid email format |
| password | string | Yes | Minimum 6 characters |
| company | string | No | Optional |

### Success Response (201)
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "requiresVerification": true,
  "email": "john@example.com"
}
```

### Error Responses

**400 - Bad Request (Missing Fields)**
```json
{
  "error": "Name, email, and password are required"
}
```

**400 - Invalid Email Format**
```json
{
  "error": "Invalid email format"
}
```

**400 - Weak Password**
```json
{
  "error": "Password must be at least 6 characters"
}
```

**400 - Email Already Registered**
```json
{
  "error": "Email already registered"
}
```

**500 - Server Error**
```json
{
  "error": "Registration failed"
}
```

### Backend Logic
1. Validates all input fields
2. Checks email format
3. Checks password minimum length
4. Checks if email already exists
5. Generates secure 6-character verification code
6. Sets code expiry to 24 hours from now
7. Creates user with `emailVerified: false`
8. Sends verification email
9. Returns success response with `requiresVerification: true`

### Email Sent
User receives email with:
- Subject: "Verify Your Email - Deal Clarity Engine"
- Body: Contains 6-character verification code
- Expiry notice: "Valid for 24 hours"

---

## 2. POST /verify-email
Verify user's email address with the code received in email.

### Request
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "john@example.com",
  "verificationCode": "A1B2C3"
}
```

### Parameters
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| email | string | Yes | Must match registered email |
| verificationCode | string | Yes | Must be 6 characters |

### Success Response (200)
```json
{
  "success": true,
  "message": "Email verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "rep",
    "subscription": {
      "status": "inactive",
      "plan": "free"
    }
  }
}
```

### Error Responses

**400 - Missing Parameters**
```json
{
  "error": "Email and verification code are required"
}
```

**400 - Email Already Verified**
```json
{
  "error": "Email already verified"
}
```

**401 - User Not Found**
```json
{
  "error": "User not found"
}
```

**401 - Invalid Code**
```json
{
  "error": "Invalid verification code"
}
```

**401 - Code Expired**
```json
{
  "error": "Verification code expired"
}
```

**500 - Server Error**
```json
{
  "error": "Verification failed"
}
```

### Backend Logic
1. Validates email and code are provided
2. Finds user by email
3. Checks if email already verified
4. Verifies code matches
5. Checks code hasn't expired
6. Marks email as verified
7. Clears verification code from database
8. Sends welcome email
9. Creates JWT token (7-day expiry)
10. Returns token and user info

### Side Effects
- Sends welcome email to user
- Clears `emailVerificationCode` and `emailVerificationExpiry` fields
- Sets `emailVerified: true`
- User can now login normally

---

## 3. POST /resend-verification
Resend verification code to user's email.

### Request
```http
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Parameters
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| email | string | Yes | Must be registered |

### Success Response (200)
```json
{
  "success": true,
  "message": "Verification code sent to your email"
}
```

### Error Responses

**400 - Email Required**
```json
{
  "error": "Email is required"
}
```

**400 - Email Already Verified**
```json
{
  "error": "Email already verified"
}
```

**401 - User Not Found**
```json
{
  "error": "User not found"
}
```

**500 - Server Error**
```json
{
  "error": "Failed to resend verification code"
}
```

### Backend Logic
1. Validates email is provided
2. Finds user by email
3. Checks if email already verified
4. Generates new verification code
5. Updates code expiry to 24 hours from now
6. Saves to database
7. Sends verification email with new code
8. Returns success message

### Rate Limiting (Recommended)
Implement rate limiting (e.g., 1 resend per 10 minutes) to prevent abuse:
```javascript
// Pseudo-code example
const lastResendTime = user.lastResendCodeTime;
const now = new Date();
const minutesElapsed = (now - lastResendTime) / (1000 * 60);

if (minutesElapsed < 10) {
  return res.status(429).json({
    error: `Please wait ${Math.ceil(10 - minutesElapsed)} minutes before resending`
  });
}
```

---

## 4. POST /login
Authenticate user with email and password.

### Request
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Parameters
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| email | string | Yes | Valid email format |
| password | string | Yes | Minimum 6 characters |

### Success Response (200) - Verified Email
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "rep"
  }
}
```

### Unverified Email Response (403)
```json
{
  "error": "Email not verified",
  "requiresVerification": true,
  "email": "john@example.com"
}
```

### Error Responses

**400 - Missing Parameters**
```json
{
  "error": "Email and password are required"
}
```

**401 - Invalid Credentials**
```json
{
  "error": "Invalid email or password"
}
```

**403 - Unverified Email**
```json
{
  "error": "Email not verified",
  "requiresVerification": true,
  "email": "john@example.com"
}
```

**500 - Server Error**
```json
{
  "error": "Login failed"
}
```

### Backend Logic
1. Validates email and password provided
2. Finds user by email
3. **If user not found:** Returns generic 401 error
4. **If user found:** Checks `emailVerified` field
5. **If not verified:** Returns 403 with `requiresVerification: true`
6. **If verified:** Compares password hash with stored hash
7. **If password wrong:** Returns generic 401 error
8. **If password correct:** Creates JWT token (7-day expiry)
9. Returns token and user info

### Security Notes
- Same generic error for non-existent user and wrong password
- This prevents email enumeration attacks
- Frontend can distinguish by checking `requiresVerification` flag
- Password comparison uses bcryptjs secure comparison

---

## JWT Token Structure

### Payload
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "john@example.com",
  "role": "rep",
  "iat": 1234567890,
  "exp": 1235172690
}
```

### Configuration
- **Algorithm:** HS256 (HMAC with SHA-256)
- **Expiry:** 7 days (604800 seconds)
- **Secret:** `process.env.JWT_SECRET`

### Usage in Subsequent Requests
```http
GET /api/deals
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## User Model Updates

### New Email Verification Fields

```javascript
{
  // Existing fields
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  company: String,
  role: String,
  
  // New verification fields
  emailVerified: Boolean,           // default: false
  emailVerificationCode: String,    // 6-character hex
  emailVerificationExpiry: Date,    // 24 hours from generation
  
  // ... other fields
}
```

### Example Document
```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$10$...", // bcryptjs hash
  "company": "Acme Inc",
  "role": "rep",
  "emailVerified": true,
  "emailVerificationCode": null,
  "emailVerificationExpiry": null,
  "createdAt": ISODate("2024-01-01T10:00:00Z"),
  "updatedAt": ISODate("2024-01-01T10:05:00Z")
}
```

### During Verification Process
```javascript
// Right after signup
{
  "emailVerified": false,
  "emailVerificationCode": "A1B2C3",
  "emailVerificationExpiry": ISODate("2024-01-02T10:00:00Z")  // +24 hours
}

// After successful verification
{
  "emailVerified": true,
  "emailVerificationCode": null,
  "emailVerificationExpiry": null
}
```

---

## Error Status Codes Summary

| Code | Meaning | When | Action |
|------|---------|------|--------|
| 200 | OK | Login/verify success | Process token, login user |
| 201 | Created | Signup success | Show verification screen |
| 400 | Bad Request | Invalid input | Show validation error |
| 401 | Unauthorized | Wrong credentials | Show "Invalid email/password" |
| 403 | Forbidden | Email not verified | Show verification screen |
| 429 | Too Many Requests | Rate limit exceeded | Show "Please wait" message |
| 500 | Server Error | Server issue | Show "Something went wrong" |

---

## Frontend Integration Examples

### Using Fetch API

```javascript
// Signup
const signupResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  })
});

const signupData = await signupResponse.json();

if (signupData.requiresVerification) {
  // Show verification screen
}

// Verify Email
const verifyResponse = await fetch('/api/auth/verify-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    verificationCode: 'A1B2C3'
  })
});

const verifyData = await verifyResponse.json();
if (verifyResponse.ok) {
  localStorage.setItem('token', verifyData.token);
  localStorage.setItem('user', JSON.stringify(verifyData.user));
}

// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

const loginData = await loginResponse.json();

if (loginResponse.status === 403 && loginData.requiresVerification) {
  // Show verification screen
} else if (loginResponse.ok) {
  localStorage.setItem('token', loginData.token);
  // Redirect to dashboard
}
```

### Using Axios

```javascript
// Signup
try {
  const { data } = await axios.post('/api/auth/register', {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  });
  
  if (data.requiresVerification) {
    // Show verification screen
  }
} catch (error) {
  console.error(error.response.data.error);
}

// Verify
try {
  const { data } = await axios.post('/api/auth/verify-email', {
    email: 'john@example.com',
    verificationCode: 'A1B2C3'
  });
  
  localStorage.setItem('token', data.token);
} catch (error) {
  if (error.response.status === 401) {
    // Invalid code
  }
}
```

---

## Database Queries

### Find Unverified Users
```javascript
db.users.find({ emailVerified: false })
```

### Find Users Pending Verification
```javascript
db.users.find({
  emailVerified: false,
  emailVerificationExpiry: { $gt: new Date() }
})
```

### Find Expired Codes
```javascript
db.users.find({
  emailVerified: false,
  emailVerificationExpiry: { $lt: new Date() }
})
```

### Check Verification Code
```javascript
db.users.findOne({
  email: 'john@example.com',
  emailVerificationCode: 'A1B2C3'
})
```

---

## Email Service Integration

### sendVerificationEmail(email, name, code)
```javascript
const { sendVerificationEmail } = require('./services/emailService');

await sendVerificationEmail(
  'john@example.com',
  'John Doe',
  'A1B2C3'
);
```

### sendWelcomeEmail(email, name)
```javascript
const { sendWelcomeEmail } = require('./services/emailService');

await sendWelcomeEmail('john@example.com', 'John Doe');
```

---

## Testing with cURL

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "company": "Acme Inc"
  }'
```

### Verify Email
```bash
curl -X POST http://localhost:5000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "verificationCode": "A1B2C3"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

## Postman Collection

### Import to Postman

Save as `Postman.json`:
```json
{
  "info": {
    "name": "Email Verification API",
    "version": "1.0"
  },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/auth/register",
        "body": {
          "mode": "raw",
          "raw": "{\"name\":\"John\",\"email\":\"john@example.com\",\"password\":\"pass123\"}"
        }
      }
    },
    {
      "name": "Verify Email",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/auth/verify-email",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"john@example.com\",\"verificationCode\":\"A1B2C3\"}"
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/auth/login",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"john@example.com\",\"password\":\"pass123\"}"
        }
      }
    }
  ]
}
```

---

## Rate Limiting Recommendations

### Implementation Example
```javascript
const rateLimit = require('express-rate-limit');

// Login attempts - 5 per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later'
});

// Verification attempts - 10 per hour per email
const verifyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.body.email
});

// Resend code - 3 per hour per email
const resendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => req.body.email
});

router.post('/login', loginLimiter, handleLogin);
router.post('/verify-email', verifyLimiter, handleVerifyEmail);
router.post('/resend-verification', resendLimiter, handleResendVerification);
```

---

**API Reference Version:** 1.0
**Last Updated:** [Current Date]
**Status:** Complete
