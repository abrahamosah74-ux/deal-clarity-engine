# Email Domain Setup Guide - Resend SPF/DKIM

## Overview
To ensure your emails reach the inbox (not spam) and prevent spoofing, you need to set up SPF and DKIM records for your domain.

## Step 1: Get Your Domain Records from Resend

1. Go to [Resend Domains Dashboard](https://resend.com/domains)
2. Click on **deal-clarity.com**
3. You should see three records to add to your DNS:

### Record Types You'll See:
- **MX Record** (if setting up email receiving - optional)
- **SPF Record** (Sender Policy Framework)
- **DKIM Record** (DomainKeys Identified Mail)
- **DMARC Record** (optional but recommended)

Each record will show:
- **Type** (TXT, CNAME, or MX)
- **Name** (subdomain - usually `default` or blank)
- **Value** (the actual record content)

## Step 2: Add Records to Your Domain

### Where to Add These Records:
Go to your domain registrar (GoDaddy, Namecheap, Google Domains, etc.) and access your DNS settings.

### For Each Record:

**Example SPF Record:**
```
Name: @
Type: TXT
Value: v=spf1 include:sendingdomain.resend.dev ~all
```

**Example DKIM Record:**
```
Name: default._domainkey
Type: CNAME
Value: [unique-id].dkim.resend.dev
```

> **Copy the exact values from your Resend dashboard** - they will be specific to your account

## Step 3: Verify Records in Resend

1. After adding the DNS records (can take 24-48 hours to propagate)
2. Go back to [Resend Domains Dashboard](https://resend.com/domains)
3. Click the **"Verify"** button on deal-clarity.com
4. Resend will check your DNS records

### Status Indicators:
- ✅ **Verified** - Record found and correct
- ⏳ **Pending** - Record still propagating (wait 24-48 hours)
- ❌ **Failed** - Record not found or incorrect (check your DNS settings)

## Step 4: Benefits

Once verified, you get:
✅ **Better Deliverability** - Emails are less likely to be marked as spam
✅ **Authentication** - Proves emails are actually from deal-clarity.com
✅ **DMARC Alignment** - Enables additional security features
✅ **Professional Image** - Customers trust authenticated emails

## Troubleshooting

### Records Not Showing as Verified After 48 Hours:
1. Double-check the record values match exactly (including periods)
2. Make sure you're adding them to the right domain (not a subdomain)
3. Try clearing your DNS cache: `nslookup` or use https://mxtoolbox.com/

### Email Still Going to Spam:
1. Check all three records are verified in Resend
2. Make sure `from: 'noreply@deal-clarity.com'` is used (matches verified domain)
3. Review [Resend Deliverability Guide](https://resend.com/docs/dashboard/deliverability)

## Current Setup Status

**Current Configuration:**
```javascript
// backend/src/services/emailService.js
from: 'noreply@deal-clarity.com'  // Uses verified domain ✅
```

**Email Services Using This Domain:**
- ✅ Verification emails
- ✅ Password reset emails
- ✅ Welcome emails
- ✅ Any future transactional emails

## Next Steps

1. **Get SPF/DKIM records from Resend dashboard**
2. **Add them to your domain registrar's DNS settings**
3. **Wait 24-48 hours for propagation**
4. **Verify in Resend dashboard**
5. **Monitor deliverability** in Resend dashboard

## Resources

- [Resend Domain Verification Docs](https://resend.com/docs/dashboard/domains)
- [SPF Explanation](https://resend.com/docs/dashboard/domains#spf)
- [DKIM Explanation](https://resend.com/docs/dashboard/domains#dkim)
- [MXToolbox DNS Checker](https://mxtoolbox.com/)

---

**Questions?** Check the Resend dashboard help or contact their support.
