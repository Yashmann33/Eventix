const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Sends a welcome email to a newly registered user.
 */
const sendWelcomeEmail = async (user) => {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "Welcome to Eventura! 🎪";
    sendSmtpEmail.htmlContent = `
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #2563eb;">Hello ${user.name}!</h2>
                    <p>Thank you for joining <strong>Eventura</strong>. We're excited to have you on board!</p>
                    <p>Your account has been created as an <strong>${user.role}</strong>.</p>
                    ${user.role === 'proposer' ? `
                        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0;"><strong>Your Unique Organizer ID:</strong></p>
                            <h3 style="color: #2563eb; margin: 5px 0;">${user.uniqueId}</h3>
                            <p style="font-size: 0.9rem; color: #64748b; margin: 0;">Please share this ID with an administrator for account verification.</p>
                        </div>
                    ` : ''}
                    <p>You can now log in and start exploring or organizing amazing events.</p>
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.8rem; color: #94a3b8;">
                        Best regards,<br>
                        The Eventura Team
                    </div>
                </div>
            </body>
        </html>
    `;
    sendSmtpEmail.sender = { "name": process.env.SENDER_NAME, "email": process.env.SENDER_EMAIL };
    sendSmtpEmail.to = [{ "email": user.email, "name": user.name }];

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Welcome email sent successfully:', data.messageId);
        return data;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        throw error;
    }
};

/**
 * Sends a password reset email (Skeleton)
 */
const sendPasswordResetEmail = async (email, resetToken) => {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "Reset your Eventura Password";
    sendSmtpEmail.htmlContent = `
        <html>
            <body>
                <h2>Password Reset Request</h2>
                <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
                <p>To reset your password, click the link below:</p>
                <p><a href="${process.env.CLIENT_URL || 'http://localhost:5000'}/reset-password.html?token=${resetToken}" style="padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
                <p>This link will expire in 1 hour.</p>
            </body>
        </html>
    `;
    sendSmtpEmail.sender = { "name": process.env.SENDER_NAME, "email": process.env.SENDER_EMAIL };
    sendSmtpEmail.to = [{ "email": email }];

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Password reset email sent successfully');
        return data;
    } catch (error) {
        console.error('Error sending reset email:', error);
        throw error;
    }
};

/**
 * Sends an OTP email for account verification.
 */
const sendOTPEmail = async (email, name, otp) => {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "Verify your Eventura Account";
    sendSmtpEmail.htmlContent = `
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #7c3aed;">Verify your email</h2>
                    <p>Hi ${name},</p>
                    <p>Thank you for signing up for Eventura. Please use the following code to verify your account:</p>
                    <div style="background: #f5f3ff; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <h1 style="color: #7c3aed; font-size: 2.5rem; letter-spacing: 5px; margin: 0;">${otp}</h1>
                    </div>
                    <p>This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.8rem; color: #94a3b8;">
                        Best regards,<br>
                        The Eventura Team
                    </div>
                </div>
            </body>
        </html>
    `;
    sendSmtpEmail.sender = { "name": process.env.SENDER_NAME, "email": process.env.SENDER_EMAIL };
    sendSmtpEmail.to = [{ "email": email, "name": name }];

    try {
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('OTP email sent successfully');
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw error;
    }
};

module.exports = {
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendOTPEmail
};
