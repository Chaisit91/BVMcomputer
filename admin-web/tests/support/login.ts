import type { BrowserContext } from '@playwright/test'
import { signSessionToken } from './jwt'

// Injects a valid session cookie directly — equivalent to having logged in
// through the real form, without needing to know any fixture account's
// (nonexistent) real password.
export async function loginAs(context: BrowserContext, adminId: string, role: string) {
  await context.addCookies([
    {
      name: 'bvm_session',
      value: signSessionToken(adminId, role),
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
    },
  ])
}
