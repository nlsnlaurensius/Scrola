import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user profile and role
  let userRole: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    userRole = profile?.role || 'reader';
  }

  const url = request.nextUrl.clone();

  // Protected routes that require authentication
  const protectedRoutes = ['/profile', '/artist', '/admin', '/dashboard'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    url.pathname.startsWith(route)
  );

  // Auth routes (login, register)
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.some((route) =>
    url.pathname.startsWith(route)
  );

  // If user is not logged in and trying to access protected route
  if (!user && isProtectedRoute) {
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // If user is logged in and trying to access auth routes, redirect to home
  if (user && isAuthRoute) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Role-based access control
  if (user && userRole) {
    // Admin-only routes
    if (url.pathname.startsWith('/admin') && userRole !== 'admin') {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // Artist-only routes
    if (url.pathname.startsWith('/artist') && !['artist', 'admin'].includes(userRole)) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
