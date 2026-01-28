import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-this5555'
);

export async function middleware(request) {
    const token = request.cookies.get('token')?.value;
    const path = request.nextUrl.pathname;

    // Public paths
    const isPublicPath = path === '/login' || path.startsWith('/api/auth');

    // If no token and trying to access protected route
    if (!token && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If token exists, verify it
    if (token) {
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);

            // If logging in but already authenticated
            if (path === '/login') {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }

            // Check Role Access
            // Admin only routes
            if (path.startsWith('/dashboard/users') || path.startsWith('/dashboard/logs')) {
                if (payload.role !== 'admin') {
                    // Redirect to dashboard home or show unauthorized
                    return NextResponse.redirect(new URL('/dashboard', request.url));
                }
            }

        } catch (error) {
            // Invalid token
            console.error('Middleware Auth Error:', error);
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('token');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/login',
        '/api/dashboard/:path*'
    ],
};
