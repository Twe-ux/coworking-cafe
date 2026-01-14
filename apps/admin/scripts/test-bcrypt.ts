import bcrypt from 'bcryptjs';

async function testBcrypt() {
  const password = 'Dev123!';

  console.log('🧪 Testing bcrypt...\n');

  // Create hash
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log();

  // Test comparison
  const isValid = await bcrypt.compare(password, hash);
  console.log('Comparison result:', isValid ? '✅ VALID' : '❌ INVALID');
  console.log();

  // Test with existing hash from database
  const existingHash = '$2b$10$CTqb79cb2/RNoCURURbPaOM8YBqb0s.SqIrF8kpTJmXTAp2t5umqO';
  console.log('Testing with hash from database:');
  console.log('Hash:', existingHash);
  const isValidExisting = await bcrypt.compare(password, existingHash);
  console.log('Comparison result:', isValidExisting ? '✅ VALID' : '❌ INVALID');
}

testBcrypt();
