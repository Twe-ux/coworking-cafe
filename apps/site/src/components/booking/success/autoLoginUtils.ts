import { signIn } from "next-auth/react";
import type { Session } from "next-auth";

const MAX_CREDENTIALS_AGE = 10 * 60 * 1000; // 10 minutes

export async function attemptAutoLogin(
  session: Session | null,
  onMessage: (message: string) => void
): Promise<boolean> {
  if (session) {
    console.log('[Auto-login] User already logged in, skipping auto-login');
    return true;
  }

  try {
    const storedData = sessionStorage.getItem('autoLogin');
    if (!storedData) {
      console.log('[Auto-login] No credentials found in sessionStorage');
      return false;
    }

    const { email, password, timestamp } = JSON.parse(storedData);

    const age = Date.now() - timestamp;
    if (age > MAX_CREDENTIALS_AGE) {
      console.log('[Auto-login] Credentials expired, removing from sessionStorage');
      sessionStorage.removeItem('autoLogin');
      return false;
    }

    console.log('[Auto-login] Attempting auto-login for:', email);
    onMessage("Connexion automatique en cours...");

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    sessionStorage.removeItem('autoLogin');

    if (result?.ok) {
      console.log('[Auto-login] ✅ Auto-login successful');
      return true;
    } else {
      console.error('[Auto-login] ❌ Auto-login failed:', result?.error);
      return false;
    }
  } catch (error) {
    console.error('[Auto-login] Error during auto-login:', error);
    sessionStorage.removeItem('autoLogin');
    return false;
  }
}
