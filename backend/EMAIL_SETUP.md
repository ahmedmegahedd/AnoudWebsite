# Email Setup Guide for Contact Form

## Overview
The contact form now sends emails to `m.megahed@anoudjob.com` when someone submits a message.

## Setup Steps

### 1. Create Environment File
Create a `.env` file in the backend directory with your email credentials:

```bash
# Backend/.env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
MONGO_URI=your-mongodb-connection-string
```

### 2. Gmail Setup (Recommended)
1. **Enable 2-Step Verification** in your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this 16-character password in EMAIL_PASS

### 3. Alternative Email Services
You can use other email services by changing the `service` in the code:
- **Outlook**: `service: 'outlook'`
- **Yahoo**: `service: 'yahoo'`
- **Custom SMTP**: Use `host`, `port`, `secure` instead of `service`

### 4. Test the Setup
1. Restart your backend server
2. Submit a contact form
3. Check console logs for email status
4. Check `m.megahed@anoudjob.com` inbox

## Security Notes
- Never commit `.env` files to git
- Use app passwords, not regular passwords
- Consider using environment variables in production

## Troubleshooting
- Check console logs for email errors
- Verify email credentials are correct
- Ensure 2FA is enabled for Gmail
- Check spam folder for test emails
