# Required Firebase Indexes

The following composite indexes need to be created in Firebase Console for optimal performance:

## For Feedback Queries
1. **Collection**: `feedbacks`
   - Fields: `isActive` (Ascending) + `createdAt` (Descending)

## For Stats Queries
2. **Collection**: `feedbacks`
   - Fields: `isActive` (Ascending) + `createdAt` (Ascending)

3. **Collection**: `feedbacks` (for date range queries)
   - Fields: `isActive` (Ascending) + `createdAt` (Ascending) + `createdAt` (Ascending)

## How to Create Indexes

### Option 1: Automatic Creation
- Run the app and trigger the queries
- Firebase will show error messages with direct links to create the required indexes
- Click the links and Firebase will auto-create the indexes

### Option 2: Manual Creation
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Indexes**
4. Click **Create Index**
5. Enter the collection name and field combinations listed above

## Index Status
Indexes take a few minutes to build. The app may show errors until they're ready.

## Current Required Indexes:
- ✅ `feedbacks`: `isActive` (ASC) + `createdAt` (DESC) - for feedback listing
- ⏳ `feedbacks`: `isActive` (ASC) + `createdAt` (ASC) - for stats queries

Note: Firebase will automatically suggest additional indexes as you use the app.