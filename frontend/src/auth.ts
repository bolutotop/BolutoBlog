import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { auth, handlers, signIn, signOut } = NextAuth({
  // 🚀 核心修改 1：移除 Prisma Adapter，强制使用纯 JWT 策略 (完美兼容 Middleware Edge 环境)
  session: { strategy: "jwt" },
  
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  
  callbacks: {
    async signIn({ user }) {
      const adminEmail = process.env.ADMIN_EMAIL;
      
      if (!adminEmail || user.email !== adminEmail) {
        console.error(`❌ 非法登录尝试: ${user.email}`);
        return false; 
      }
      return true; 
    },
    
    // 🚀 核心修改 2：在 JWT 模式下，将 token 里的用户 ID 传给 session
    async session({ session, token }) {
      if (session.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  
  pages: {
    signIn: "/login", 
  },
});