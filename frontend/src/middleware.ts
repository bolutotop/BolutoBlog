import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  
  const isOnDashboard = req.nextUrl.pathname.startsWith('/admin');
  const isOnApiAdmin = req.nextUrl.pathname.startsWith('/api/admin');
  const isOnLoginPage = req.nextUrl.pathname === '/login';

  // 1. 拦截防线：尝试访问后台页面或后台 API，但【未登录】
  if ((isOnDashboard || isOnApiAdmin) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // 2. 交互优化：【已登录】但还想访问登录页，直接送回后台
  if (isOnLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  // 其他正常请求放行
  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/login'],
};