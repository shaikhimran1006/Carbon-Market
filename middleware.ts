import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Seller dashboard - only for sellers and admins
    if (path.startsWith("/seller")) {
      if (token?.role !== "SELLER" && token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Admin routes - only for admins
    if (path.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Public routes that don't require auth
        const publicRoutes = [
          "/",
          "/projects",
          "/map",
          "/calculator",
          "/auth/login",
          "/auth/register",
        ];

        // Check if it's a public route or starts with a public route
        const isPublic = publicRoutes.some(
          (route) => path === route || path.startsWith(route + "/")
        );

        // Allow public routes without auth
        if (isPublic) return true;

        // Require auth for protected routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/portfolio/:path*",
    "/seller/:path*",
    "/admin/:path*",
    "/checkout/:path*",
    "/orders/:path*",
  ],
};
