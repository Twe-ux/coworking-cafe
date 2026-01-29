import { config } from 'dotenv';
import { resolve } from 'path';

export async function register() {
  console.log('🔧 BEFORE loading .env.local:');
  console.log('📂 MONGODB_URI database:', process.env.MONGODB_URI?.split('/').pop()?.split('?')[0]);

  // Load .env.local with override to ensure it takes precedence over system env vars
  config({ path: resolve(process.cwd(), '.env.local'), override: true });

  console.log('✅ AFTER loading .env.local:');
  console.log('📂 MONGODB_URI database:', process.env.MONGODB_URI?.split('/').pop()?.split('?')[0]);
}
