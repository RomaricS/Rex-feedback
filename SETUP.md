# Setup Guide

## Prerequisites

- Node.js 18+ installed
- NeonDB account (free)
- Google Cloud account (free)

## Step-by-Step Setup

### 1. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. NeonDB Setup

1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new database project
4. Go to Dashboard → Connection Details
5. Copy the connection string and direct URL

Update `.env`:
```env
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
DIRECT_URL="postgresql://username:password@host/database?sslmode=require"
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API and People API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret

Update `.env`:
```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. NextAuth Configuration

Generate a secret key:

```bash
openssl rand -base64 32
```

Update `.env`:
```env
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 5. Database Migration

Push the schema to your database:

```bash
npx prisma db push
```

### 6. Run the Application

Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Troubleshooting

### Database Connection Issues
- Check NeonDB connection string format
- Ensure database is active (not sleeping)
- Verify SSL mode is included in connection string

### Google OAuth Issues
- Verify redirect URI matches exactly
- Check if APIs are enabled in Google Cloud Console
- Ensure client ID/secret are correct

### Build Issues
- Clear next cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`

## Production Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Add all environment variables in Vercel dashboard
3. Update `NEXTAUTH_URL` to your production domain
4. Deploy!

### Environment Variables for Production

```env
DATABASE_URL="your-production-neondb-url"
DIRECT_URL="your-production-neondb-direct-url"
NEXTAUTH_SECRET="your-secure-secret"
NEXTAUTH_URL="https://your-app.vercel.app"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Remember to update Google OAuth redirect URLs for production!