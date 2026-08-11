// src/utils/emailTemplates.js

// Welcome email
export const welcomeTemplate = ({ username }) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Inter, sans-serif; background: #F8F7FF; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(99,102,241,0.08); }
        .header { background: linear-gradient(135deg, #6366F1, #10B981); padding: 40px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .body { padding: 40px; }
        .body h2 { color: #0A0A0A; font-size: 22px; }
        .body p { color: #374151; font-size: 16px; line-height: 1.6; }
        .steps { background: #F8F7FF; border-radius: 12px; padding: 24px; margin: 24px 0; }
        .step { margin: 10px 0; color: #374151; font-size: 15px; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366F1, #10B981); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 24px 0; }
        .footer { background: #F8F7FF; padding: 24px; text-align: center; color: #9CA3AF; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💸 BillSplit</h1>
        </div>
        <div class="body">
          <h2>Welcome to BillSplit, ${username}! 🎉</h2>
          <p>You're all set to start splitting bills smarter. Here's how to get started:</p>
          <div class="steps">
            <div class="step">✅ Create a group with your friends or roommates</div>
            <div class="step">✅ Add shared expenses to the group</div>
            <div class="step">✅ See who owes who automatically</div>
            <div class="step">✅ Settle up and stay debt-free</div>
          </div>
          <a href="${process.env.CLIENT_URL}/dashboard" class="button">
            Go to Dashboard →
          </a>
        </div>
        <div class="footer">
          <p>© 2026 BillSplit. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Group invite email
export const groupInviteTemplate = ({ inviterName, groupName, groupId, clientUrl }) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Inter, sans-serif; background: #F8F7FF; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(99,102,241,0.08); }
        .header { background: linear-gradient(135deg, #6366F1, #10B981); padding: 40px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .body { padding: 40px; }
        .body h2 { color: #0A0A0A; font-size: 22px; }
        .body p { color: #374151; font-size: 16px; line-height: 1.6; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366F1, #10B981); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 24px 0; }
        .footer { background: #F8F7FF; padding: 24px; text-align: center; color: #9CA3AF; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💸 BillSplit</h1>
        </div>
        <div class="body">
          <h2>You've been invited! 🎉</h2>
          <p>Hey there! <b>${inviterName}</b> has invited you to join the group <b>"${groupName}"</b> on BillSplit.</p>
          <p>BillSplit helps you track shared expenses and split bills without the awkward conversations.</p>
          <a href="${clientUrl}/groups/${groupId}" class="button">
            Join Group →
          </a>
          <p style="color: #9CA3AF; font-size: 14px;">If you don't have an account yet, you'll be asked to register first.</p>
        </div>
        <div class="footer">
          <p>© 2026 BillSplit. All rights reserved.</p>
          <p>This invite was sent by ${inviterName} via BillSplit.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Debt reminder email
export const debtReminderTemplate = ({ reminderSenderName, owedByName, amount, groupName, groupId, clientUrl }) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Inter, sans-serif; background: #F8F7FF; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(99,102,241,0.08); }
        .header { background: linear-gradient(135deg, #6366F1, #10B981); padding: 40px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .body { padding: 40px; }
        .amount { font-size: 48px; font-weight: 800; color: #6366F1; text-align: center; margin: 24px 0; }
        .body p { color: #374151; font-size: 16px; line-height: 1.6; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366F1, #10B981); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 24px 0; }
        .footer { background: #F8F7FF; padding: 24px; text-align: center; color: #9CA3AF; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💸 BillSplit</h1>
        </div>
        <div class="body">
          <p>Hey <b>${owedByName}</b>! Friendly reminder from <b>${reminderSenderName}</b>.</p>
          <div class="amount">Rs. ${amount}</div>
          <p>You owe <b>${reminderSenderName}</b> the above amount in group <b>"${groupName}"</b>.</p>
          <a href="${clientUrl}/groups/${groupId}" class="button">
            View & Settle Up →
          </a>
        </div>
        <div class="footer">
          <p>© 2026 BillSplit. All rights reserved.</p>
          <p>This reminder was sent by ${reminderSenderName} via BillSplit.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Password reset email
export const resetPasswordTemplate = ({ username, resetUrl }) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Inter, sans-serif; background: #F8F7FF; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(99,102,241,0.08); }
        .header { background: linear-gradient(135deg, #6366F1, #10B981); padding: 40px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .body { padding: 40px; }
        .body h2 { color: #0A0A0A; font-size: 22px; }
        .body p { color: #374151; font-size: 16px; line-height: 1.6; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366F1, #10B981); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 24px 0; }
        .warning { color: #9CA3AF; font-size: 14px; margin-top: 24px; }
        .footer { background: #F8F7FF; padding: 24px; text-align: center; color: #9CA3AF; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💸 BillSplit</h1>
        </div>
        <div class="body">
          <h2>Reset Your Password</h2>
          <p>Hey <b>${username}</b>! We received a request to reset your BillSplit password.</p>
          <p>Click the button below to reset it. This link expires in <b>10 minutes.</b></p>
          <a href="${resetUrl}" class="button">
            Reset Password →
          </a>
          <p class="warning">If you didn't request this — ignore this email. Your password won't change.</p>
        </div>
        <div class="footer">
          <p>© 2026 BillSplit. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}