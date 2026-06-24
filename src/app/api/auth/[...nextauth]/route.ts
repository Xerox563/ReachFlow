import NextAuth from "next-auth"

export const authOptions = {
  providers: [
    // Add providers here when ready (GitHub, Google, etc.)
  ],
  // No adapter by default - works fully in demo mode with localStorage
  callbacks: {
    session: async ({ session, user }: any) => {
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
