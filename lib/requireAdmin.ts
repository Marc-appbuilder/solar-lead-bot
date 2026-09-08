import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Checks the current request's Supabase Auth session against the same
 * admin-email allowlist middleware.ts already uses to gate /admin pages.
 *
 * middleware.ts's matcher explicitly excludes /api routes (see its
 * `config.matcher`), so /api/clients and /api/clients/[id] were reachable
 * by anyone with no authentication at all — this closes that gap directly
 * in the route handlers rather than relying on the page-level middleware.
 */
const ADMIN_EMAILS = ['marcwrichards@gmail.com', 'marcwrichards@me.com'];

export async function isAdminRequest(): Promise<boolean> {
  const cookieStore = await cookies();
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {
          // Read-only check — never issued a response to attach refreshed
          // cookies to, so there is nothing to persist here.
        },
      },
    }
  );

  const { data: { user } } = await supabaseAuth.auth.getUser();
  return !!user && ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '');
}
