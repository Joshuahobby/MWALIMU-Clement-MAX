# MWALIMU Clement - Setup Instructions

This document provides step-by-step instructions for setting up the MWALIMU Clement platform with Supabase integration.

## Prerequisites

- Node.js 18+ installed
- NPM or Bun package manager
- A Supabase account and project

## Setup Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Joshuahobby/MWALIMU-Clement-MAX.git
cd MWALIMU-Clement-MAX
```

### 2. Install Dependencies

```bash
npm install
# or
bun install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Flutterwave Configuration (for future use)
FLUTTERWAVE_PUBLIC_KEY=
FLUTTERWAVE_SECRET_KEY=
FLUTTERWAVE_ENCRYPTION_KEY=

# Platform Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Replace the placeholder values with your actual Supabase project URL and keys.

### 4. Apply Database Migrations

Run the migration script to set up the database schema in Supabase:

```bash
npm run db:migrate
# or
bun run db:migrate
```

This will create the following tables in your Supabase project:

- users
- payments
- access_codes
- test_sessions
- questions

It will also set up Row Level Security (RLS) policies for each table.

### 5. Start the Development Server

```bash
npm run dev
# or
bun run dev
```

The application will be available at http://localhost:3000.

## Database Structure

The platform uses the following database schema in Supabase:

### Tables

1. **users** - Stores user information and subscription details
2. **payments** - Records payment transactions
3. **access_codes** - Manages access codes for authentication
4. **test_sessions** - Tracks test attempts and results
5. **questions** - Stores test questions in multiple languages

For more details about the database structure, see [SUPABASE_INTEGRATION.md](SUPABASE_INTEGRATION.md).

## Authentication Flow

1. Users can login using an access code
2. Access codes expire based on their subscription type
3. Authentication uses Supabase Auth and custom access code validation

## Next Steps

After setting up the basic infrastructure:

1. Create test questions in the database
2. Set up Flutterwave integration for payments
3. Create an admin dashboard for content management
4. Implement multi-language support for tests

## Troubleshooting

### Migration Errors

If you encounter errors during migration:

1. Check that your Supabase service role key has the necessary permissions
2. Make sure the Supabase project URL is correct
3. Verify that you don't have conflicting tables in your database

### Authentication Issues

If users cannot authenticate:

1. Check that RLS policies are correctly applied
2. Verify that access codes are being generated correctly
3. Ensure that the Supabase anon key is correctly configured

## Support

For questions or issues, please contact the development team or open an issue on GitHub.
