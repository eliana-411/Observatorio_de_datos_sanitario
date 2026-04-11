import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;

    return NextResponse.json({
        cookieReceived: !!token,
        tokenLength: token?.length || 0,
        tokenPrefix: token?.substring(0, 50) || 'NO TOKEN',
        allCookies: request.headers.get('cookie') || 'NO COOKIES',
    });
}
