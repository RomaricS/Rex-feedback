# IRCC Feedback Dashboard

A modern, responsive web application for the Canadian immigration community to share and track their immigration journey feedback. Built with Next.js, TypeScript, Prisma, and NeonDB.

## Features

- **🔐 Authentication**: Google OAuth + Guest access
- **📊 Dashboard**: Beautiful statistics and visualizations
- **💬 Community Feedback**: Share immigration journey progress
- **🔍 Advanced Filtering**: Filter by program, country, status
- **📈 Data Visualization**: Charts showing processing times and status distribution
- **📱 Responsive Design**: Works perfectly on all devices
- **⚡ Modern Stack**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui

## Immigration Process Tracking

Track every step of your Canadian immigration journey:

- **ITA** - Invitation to Apply
- **AOR** - Acknowledgment of Receipt  
- **Medical Exam** - Medical examination completion
- **Biometrics** - Biometrics appointment
- **Background Check** - Security and criminal background verification
- **PPR** - Passport Request
- **COPR** - Confirmation of Permanent Residence
- **eCOPR** - Electronic COPR
- **Landing** - First entry to Canada

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **Authentication**: Firebase Authentication with Google OAuth
- **Database**: NeonDB (Serverless PostgreSQL)
- **ORM**: Prisma
- **Charts**: Recharts
- **Deployment**: Vercel (recommended)

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd ircc-app
npm install
```

### 2. Environment Setup

Create a `.env` file:

```env
# Database (NeonDB)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Firebase Client Configuration (Public)
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-firebase-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-firebase-app-id"

# Firebase Admin Configuration (Private)
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_PRIVATE_KEY_ID="your-private-key-id"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xyz@your-project-id.iam.gserviceaccount.com"
FIREBASE_CLIENT_ID="your-client-id"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed with sample data
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup (NeonDB)

1. **Create NeonDB Account**: Go to [neon.tech](https://neon.tech) and create a free account

2. **Create Database**: Create a new database project

3. **Get Connection Strings**: 
   - Copy the connection string for `DATABASE_URL`
   - Copy the direct connection string for `DIRECT_URL`

4. **Update .env**: Add your NeonDB credentials to `.env`

## Firebase Setup

1. **Create Firebase Project**: Go to [console.firebase.google.com](https://console.firebase.google.com)

2. **Enable Authentication**: 
   - Go to Authentication → Get Started
   - Enable Google Sign-in method
   - Add your domain to authorized domains

3. **Get Web Config**: 
   - Go to Project Settings → General → Your apps
   - Add a web app and copy the config values to `.env`

4. **Create Service Account**:
   - Go to Project Settings → Service Accounts
   - Generate new private key
   - Add the service account details to `.env`

## Project Structure

```
src/
├── app/                  # Next.js 13+ app directory
│   ├── api/             # API routes
│   ├── dashboard/       # Dashboard pages
│   └── feedback/        # Feedback pages
├── components/          # React components
│   ├── dashboard/       # Dashboard-specific components
│   ├── navigation/      # Navigation components
│   └── ui/             # shadcn/ui components
├── lib/                # Utilities and configurations
├── providers/          # React providers
└── types/              # TypeScript type definitions
```

## Key Features Explained

### 1. User Authentication
- **Firebase Auth**: Sign in with Google account
- **Guest Access**: Browse feedback without account  
- **Real-time Auth State**: Automatic auth state management
- **Secure Token Validation**: Firebase Admin SDK verification

### 2. Feedback System
- **One Feedback Per User**: Users can only have one active feedback
- **Step Tracking**: Track each immigration process step
- **Date Logging**: Record completion dates for each step
- **Comments**: Add notes and details for each step

### 3. Dashboard Analytics
- **Real-time Stats**: Total feedbacks, success rates, processing times
- **Visual Charts**: Bar charts for processing times, pie charts for status distribution
- **Community Insights**: Learn from others' experiences

### 4. Advanced Filtering
- **Program Filter**: Express Entry, PNP, Family Sponsorship, etc.
- **Country Filter**: Filter by country of origin
- **Status Filter**: Filter by current immigration step
- **Search**: Full-text search across feedback titles

## API Endpoints

### Feedbacks
- `GET /api/feedbacks` - Get paginated feedbacks with filters
- `POST /api/feedbacks` - Create new feedback (authenticated)
- `GET /api/feedbacks/[id]` - Get specific feedback
- `PUT /api/feedbacks/[id]` - Update feedback (owner only)
- `DELETE /api/feedbacks/[id]` - Soft delete feedback (owner only)

### Statistics  
- `GET /api/stats` - Get dashboard statistics

### Authentication
- `/api/auth/[...nextauth]` - NextAuth.js endpoints

## Deployment

### Vercel (Recommended)

1. **Connect Repository**: Import your GitHub repository to Vercel

2. **Environment Variables**: Add all environment variables from `.env`

3. **Build Settings**: Vercel auto-detects Next.js (no configuration needed)

4. **Deploy**: Push to main branch to trigger deployment

### Environment Variables for Production

```env
DATABASE_URL="your-production-neondb-url"
DIRECT_URL="your-production-neondb-direct-url"
NEXTAUTH_SECRET="your-secure-secret-key"
NEXTAUTH_URL="https://your-domain.vercel.app"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help with setup, please open an issue in the repository.

---

Built with ❤️ for the Canadian immigration community