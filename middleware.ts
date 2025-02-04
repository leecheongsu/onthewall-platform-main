import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const groupExhibitionPattern = /^\/[a-zA-Z0-9]+\/groupExhibition\/[a-zA-Z0-9-]+/;

  if (pathname.startsWith('/_next') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  if (groupExhibitionPattern.test(pathname)) {
    // groupExhibition 경로에 대한 처리
    const parts = pathname.split('/');
    const projectId = parts[1];
    const slug = parts[3]; // /:projectId/groupExhibition/:slug에서 slug 부분 추출
    console.log('groupExhibition slug: ', slug);
    return NextResponse.next();
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/:projectUrl/group-exhibition/:slug'
  ]
};
