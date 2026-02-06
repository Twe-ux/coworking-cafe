/**
 * Test IMAP Connection
 *
 * Usage:
 * 1. Configure IMAP credentials in .env.local
 * 2. Send test email to impression@coworkingcafe.fr with PDF attachment
 * 3. Run: pnpm --filter @coworking-cafe/email test-imap
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });

import { getInboxStats, fetchUnreadEmails } from './providers/imapflow';

async function testIMAP() {
  console.log('📥 Testing IMAP Connection...\n');

  try {
    // 1. Test connection and get stats
    console.log('1️⃣ Connecting to mailbox...');
    const stats = await getInboxStats();

    console.log('✅ Connected successfully!');
    console.log(`📊 Stats:`);
    console.log(`   Total emails: ${stats.total}`);
    console.log(`   Unread: ${stats.unread}\n`);

    // 2. Fetch unread emails if any
    if (stats.unread > 0) {
      console.log('2️⃣ Fetching unread emails...\n');
      const emails = await fetchUnreadEmails();

      emails.forEach((email, index) => {
        console.log(`📧 Email ${index + 1}:`);
        console.log(`   From: ${email.from?.text || 'Unknown'}`);
        console.log(`   Subject: ${email.subject || 'No subject'}`);
        console.log(`   Date: ${email.date?.toLocaleString('fr-FR') || 'Unknown'}`);

        if (email.attachments && email.attachments.length > 0) {
          console.log(`   📎 Attachments (${email.attachments.length}):`);
          email.attachments.forEach((att) => {
            const size = att.size ? `${(att.size / 1024).toFixed(1)} KB` : 'Unknown size';
            console.log(`      - ${att.filename || 'unnamed'} (${size})`);
          });
        } else {
          console.log(`   📎 No attachments`);
        }

        console.log('   ---\n');
      });

      console.log(`✅ Successfully fetched ${emails.length} unread email(s)`);
    } else {
      console.log('ℹ️  No unread emails in inbox');
      console.log('\n💡 To test:');
      console.log('   1. Send email to impression@coworkingcafe.fr');
      console.log('   2. Attach a PDF file');
      console.log('   3. Run this script again\n');
    }

    console.log('\n🎉 IMAP test completed successfully!');
  } catch (error) {
    console.error('\n❌ IMAP test failed:');
    console.error(error);
    console.error('\n💡 Check:');
    console.error('   - IMAP credentials in .env.local');
    console.error('   - impression@coworkingcafe.fr exists on OVH');
    console.error('   - Password is correct');
    process.exit(1);
  }
}

testIMAP();
