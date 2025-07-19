"use server"

import nodemailer from "nodemailer"

// ZeptoMail SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.zeptomail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "emailapikey",
    pass: process.env.SMTP_PASS,
  },
})

export async function sendVerificationEmail(email: string, fullName: string, verificationToken: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - O'SMS Business</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #333333;
                line-height: 1.6;
            }
            .email-wrapper {
                max-width: 600px;
                margin: 40px auto;
                background: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #1e3a8a, #3b82f6);
                padding: 40px 30px;
                text-align: center;
                color: white;
            }
            .logo {
                display: inline-flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 24px;
            }
            .logo-icon {
                width: 48px;
                height: 48px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                backdrop-filter: blur(10px);
            }
            .logo-text {
                font-size: 32px;
                font-weight: 700;
                letter-spacing: -1px;
            }
            .header h1 {
                font-size: 28px;
                font-weight: 600;
                margin-bottom: 8px;
            }
            .header p {
                font-size: 16px;
                opacity: 0.9;
            }
            .content {
                padding: 50px 40px;
            }
            .greeting {
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 24px;
            }
            .message {
                font-size: 16px;
                color: #4b5563;
                margin-bottom: 32px;
                line-height: 1.7;
            }
            .verify-button {
                display: inline-block;
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
                text-decoration: none;
                padding: 18px 36px;
                border-radius: 12px;
                font-weight: 600;
                font-size: 16px;
                text-align: center;
                margin: 24px 0;
                box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
                transition: all 0.3s ease;
            }
            .verify-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 24px rgba(59, 130, 246, 0.4);
            }
            .security-notice {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-left: 4px solid #3b82f6;
                padding: 20px;
                border-radius: 8px;
                margin: 32px 0;
            }
            .security-notice h4 {
                color: #1e40af;
                font-weight: 600;
                margin-bottom: 8px;
            }
            .security-notice p {
                color: #64748b;
                font-size: 14px;
            }
            .features {
                background: #f8fafc;
                padding: 32px;
                margin: 32px 0;
                border-radius: 12px;
                border: 1px solid #e2e8f0;
            }
            .features h3 {
                color: #1f2937;
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 20px;
                text-align: center;
            }
            .feature-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 16px;
            }
            .feature-item {
                display: flex;
                align-items: flex-start;
                gap: 12px;
            }
            .feature-icon {
                width: 24px;
                height: 24px;
                background: #3b82f6;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 12px;
                font-weight: bold;
                flex-shrink: 0;
                margin-top: 2px;
            }
            .feature-text {
                color: #4b5563;
                font-size: 14px;
            }
            .footer {
                background: #f8fafc;
                padding: 32px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
            }
            .footer-logo {
                margin-bottom: 16px;
            }
            .footer p {
                color: #6b7280;
                font-size: 14px;
                margin-bottom: 8px;
            }
            .footer-links {
                margin: 20px 0;
            }
            .footer-links a {
                color: #3b82f6;
                text-decoration: none;
                margin: 0 12px;
                font-size: 14px;
            }
            .trust-indicators {
                display: flex;
                justify-content: center;
                gap: 24px;
                margin: 24px 0;
                flex-wrap: wrap;
            }
            .trust-item {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #6b7280;
                font-size: 12px;
            }
            @media (max-width: 600px) {
                .email-wrapper { margin: 0; border-radius: 0; }
                .content { padding: 30px 20px; }
                .header { padding: 30px 20px; }
                .feature-grid { grid-template-columns: 1fr; }
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="header">
                <div class="logo">
                    <div class="logo-icon">📱</div>
                    <div class="logo-text">O'SMS</div>
                </div>
                <h1>Verify Your Business Account</h1>
                <p>Secure your professional SMS platform access</p>
            </div>
            
            <div class="content">
                <div class="greeting">Hello ${fullName},</div>
                
                <div class="message">
                    Thank you for choosing O'SMS as your professional SMS communication platform. 
                    To ensure the security of your business account and comply with industry standards, 
                    please verify your email address by clicking the button below.
                </div>
                
                <div style="text-align: center;">
                    <a href="${verificationUrl}" class="verify-button">Verify Email Address</a>
                </div>
                
                <div class="security-notice">
                    <h4>🔒 Security & Compliance</h4>
                    <p>This verification step ensures your account meets telecommunications compliance requirements and protects against unauthorized access. Your verification link expires in 24 hours for security purposes.</p>
                </div>
                
                <div class="features">
                    <h3>Enterprise-Grade SMS Platform</h3>
                    <div class="feature-grid">
                        <div class="feature-item">
                            <div class="feature-icon">✓</div>
                            <div class="feature-text">Global delivery to 200+ countries with 99.9% uptime</div>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">✓</div>
                            <div class="feature-text">Custom sender IDs for professional branding</div>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">✓</div>
                            <div class="feature-text">Enterprise security with encrypted communications</div>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">✓</div>
                            <div class="feature-text">24/7 dedicated business support</div>
                        </div>
                    </div>
                </div>
                
                <div class="trust-indicators">
                    <div class="trust-item">
                        <span>🛡️</span>
                        <span>SOC 2 Compliant</span>
                    </div>
                    <div class="trust-item">
                        <span>🔐</span>
                        <span>256-bit Encryption</span>
                    </div>
                    <div class="trust-item">
                        <span>📊</span>
                        <span>99.9% Uptime SLA</span>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-logo">
                    <strong>O'SMS Business Platform</strong>
                </div>
                <p>Professional SMS Communications • Trusted by 10,000+ Businesses</p>
                <div class="footer-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Support Center</a>
                    <a href="#">Security</a>
                </div>
                <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                    This email was sent to ${email}. If you didn't create an O'SMS account, please ignore this email.
                </p>
            </div>
        </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: '"O\'SMS" <do-not-reply@3a2e5dcb14.mailether.com>',
      to: email,
      subject: "Verify Your O'SMS Business Account - Action Required",
      html: htmlContent,
    })
    return { success: true }
  } catch (error) {
    console.error("Email sending failed:", error)
    return { success: false, error: "Failed to send verification email" }
  }
}

export async function sendWelcomeEmail(email: string, fullName: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to O'SMS Business</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: #333333;
                line-height: 1.6;
            }
            .email-wrapper {
                max-width: 600px;
                margin: 40px auto;
                background: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #059669, #10b981);
                padding: 40px 30px;
                text-align: center;
                color: white;
            }
            .success-icon {
                width: 80px;
                height: 80px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 40px;
                margin-bottom: 24px;
                backdrop-filter: blur(10px);
            }
            .header h1 {
                font-size: 28px;
                font-weight: 600;
                margin-bottom: 8px;
            }
            .content {
                padding: 50px 40px;
                text-align: center;
            }
            .message {
                font-size: 18px;
                color: #4b5563;
                margin-bottom: 32px;
                line-height: 1.7;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
                text-decoration: none;
                padding: 18px 36px;
                border-radius: 12px;
                font-weight: 600;
                font-size: 16px;
                margin: 24px 0;
                box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
            }
            .stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 24px;
                margin: 40px 0;
            }
            .stat {
                background: #f8fafc;
                padding: 24px;
                border-radius: 12px;
                border: 1px solid #e2e8f0;
            }
            .stat-number {
                font-size: 32px;
                font-weight: 700;
                color: #059669;
                margin-bottom: 8px;
            }
            .stat-label {
                font-size: 14px;
                color: #6b7280;
                font-weight: 500;
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="header">
                <div class="success-icon">✓</div>
                <h1>Account Verified Successfully!</h1>
                <p>Your O'SMS Business account is now active</p>
            </div>
            
            <div class="content">
                <div class="message">
                    🎉 Congratulations ${fullName}! Your business account has been verified and you're ready to start sending professional SMS messages worldwide.
                </div>
                
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/onboarding" class="cta-button">Complete Setup & Choose Plan</a>
                
                <div class="stats">
                    <div class="stat">
                        <div class="stat-number">200+</div>
                        <div class="stat-label">Countries</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">99.9%</div>
                        <div class="stat-label">Uptime SLA</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">24/7</div>
                        <div class="stat-label">Support</div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: '"O\'SMS" <do-not-reply@3a2e5dcb14.mailether.com>',
      to: email,
      subject: "🎉 Welcome to O'SMS Business - Account Verified!",
      html: htmlContent,
    })
    return { success: true }
  } catch (error) {
    console.error("Welcome email sending failed:", error)
    return { success: false }
  }
}
