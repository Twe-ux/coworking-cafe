/**
 * Test SMTP Configuration
 *
 * Usage:
 * pnpm --filter @coworking-cafe/email test-smtp
 */

import { sendEmail } from './emailService';
import { verifySMTPConnection } from './providers/smtp';

async function testSMTP() {
  console.log('🧪 Testing SMTP Configuration...\n');

  // 1. Test connection
  console.log('1️⃣ Testing SMTP connection...');
  const isConnected = await verifySMTPConnection();

  if (!isConnected) {
    console.error('\n❌ SMTP connection failed!');
    console.error('Please check your .env.local configuration');
    process.exit(1);
  }

  console.log('✅ SMTP connection successful!\n');

  // 2. Test sending email (optional - comment out if not needed)
  const testEmail = process.env.TEST_EMAIL;

  if (testEmail) {
    console.log(`2️⃣ Sending test email to ${testEmail}...`);

    const sent = await sendEmail({
      to: testEmail,
      subject: 'Test Email - CoworKing Café',
      html: `
        <h1>✅ Test Email Successful!</h1>
        <p>Your SMTP configuration is working correctly.</p>
        <p><strong>Provider:</strong> ${process.env.SMTP_PROVIDER || 'gmail'}</p>
        <p><strong>From:</strong> ${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      `,
      text: `
✅ Test Email Successful!

Your SMTP configuration is working correctly.

Provider: ${process.env.SMTP_PROVIDER || 'gmail'}
From: ${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}
Time: ${new Date().toISOString()}
      `,
    });

    if (sent) {
      console.log('✅ Test email sent successfully!');
      console.log(`Check ${testEmail} inbox\n`);
    } else {
      console.error('❌ Failed to send test email\n');
    }
  } else {
    console.log('2️⃣ Skipping email send test (no TEST_EMAIL in .env)');
    console.log('Add TEST_EMAIL=your-email@example.com to test sending\n');
  }

  console.log('✅ All tests passed!');
}

// Run tests
testSMTP().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
