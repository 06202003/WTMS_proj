import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { db } from "@/lib/db"
import bcrypt from "bcrypt"
import { RowDataPacket, ResultSetHeader } from "mysql2"

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        const [rows] = await db.execute<RowDataPacket[]>(
          'SELECT * FROM User WHERE email = ?',
          [credentials.email as string]
        )
        const user = rows[0]
        
        if (!user || !user.password_hash) {
          return null
        }
        
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        )
        
        if (!isPasswordValid) {
          return null
        }
        
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.nama_lengkap,
          role: user.peran
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists
          let [rows] = await db.execute<RowDataPacket[]>(
            'SELECT * FROM User WHERE email = ?',
            [user.email as string]
          )
          let dbUser = rows[0]
          
          if (!dbUser) {
            // Insert new user
            const [result] = await db.execute<ResultSetHeader>(
              'INSERT INTO User (email, nama_lengkap, no_whatsapp, peran) VALUES (?, ?, ?, ?)',
              [user.email as string, user.name || "Google User", "", "USER"]
            )
            
            const [newRows] = await db.execute<RowDataPacket[]>(
              'SELECT * FROM User WHERE id = ?',
              [result.insertId]
            )
            dbUser = newRows[0]
          }
          
          user.id = dbUser.id.toString()
          ;(user as any).role = dbUser.peran
          return true
        } catch (error) {
          console.error("Error saving Google user", error)
          return false
        }
      }
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "USER"
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session
    }
  },
  session: { strategy: "jwt" }
})
