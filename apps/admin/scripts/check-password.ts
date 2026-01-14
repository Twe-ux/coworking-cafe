import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { connectToDatabase, User } from '@coworking-cafe/database';
import bcrypt from 'bcryptjs';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../.env.local'), override: true });

async function checkPassword() {
  try {
    console.log('🔍 Checking password for dev@coworkingcafe.fr...\n');

    await connectToDatabase();
    console.log('✅ Connected to MongoDB');

    // Get user with password
    const user = await User.findOne({ email: 'dev@coworkingcafe.fr' })
      .select('+password')
      .exec();

    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('✅ User found:', user.email);
    console.log('📝 Password hash:', user.password);
    console.log();

    // Test with "Dev@1234"
    const testPassword1 = 'Dev@1234';
    const isValid1 = await bcrypt.compare(testPassword1, user.password);
    console.log(`🔐 Test password "${testPassword1}": ${isValid1 ? '✅ VALID' : '❌ INVALID'}`);

    // Test with other common passwords
    const testPasswords = ['dev123', 'Dev123', 'Dev123!', 'Dev@1234', 'dev', 'admin', 'password'];
    console.log('\n🧪 Testing common passwords:');
    for (const pwd of testPasswords) {
      const isValid = await bcrypt.compare(pwd, user.password);
      console.log(`  - "${pwd}": ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPassword();
