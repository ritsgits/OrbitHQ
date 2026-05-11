# OrbitHQ

A production-grade, multi-tenant CRM + Team Workspace platform built with Next.js 15, TypeScript, and Prisma.

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **ORM/ODM**: [Mongoose](https://mongoosejs.com/)
- **Database**: MongoDB
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Validation**: [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/)

## 📂 Folder Structure

```text
app/            # App Router pages and layouts
components/     # Reusable React components
components/ui/  # shadcn/ui base components
models/         # Mongoose schemas
lib/            # Shared libraries (DB connection, utils)
hooks/          # Custom React hooks
store/          # Zustand state management
actions/        # Next.js Server Actions
services/       # Business logic services
types/          # TypeScript interfaces
utils/          # Helper functions
```

## 🛠️ Getting Started

### 1. Clone and Install
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in your details:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```

## 🔐 Environment Variables

Required variables:
- `MONGODB_URI`: Your MongoDB connection string.
- `JWT_SECRET`: Secret key for JWT signing.
- `NEXTAUTH_SECRET`: Secret key for NextAuth.
- `NEXT_PUBLIC_APP_URL`: Base URL of the application.

## 📈 Recommended Implementation Phase 2

- **Auth Implementation**: Integrate NextAuth.js or custom JWT logic.
- **Tenant Isolation**: Implement middleware/service-level checks for `workspaceId`.
- **CRM CRUD**: Build out contact management with Server Actions.
- **Project Boards**: Implement drag-and-drop board for projects.
