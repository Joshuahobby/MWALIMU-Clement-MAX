# MWALIMU Clement - Supabase Integration

This document provides details about the Supabase integration for the MWALIMU Clement platform.

## Database Schema

The platform uses the following database schema in Supabase:

### Tables

1. **users**

   - `id`: UUID (Primary Key)
   - `phone_number`: VARCHAR(20) (Unique)
   - `created_at`: TIMESTAMP WITH TIME ZONE
   - `updated_at`: TIMESTAMP WITH TIME ZONE
   - `last_login`: TIMESTAMP WITH TIME ZONE
   - `subscription_type`: VARCHAR(20) ('single', 'daily', 'weekly', 'monthly')
   - `subscription_start`: TIMESTAMP WITH TIME ZONE
   - `subscription_end`: TIMESTAMP WITH TIME ZONE

2. **payments**

   - `id`: UUID (Primary Key)
   - `user_id`: UUID (Foreign Key to users.id)
   - `amount`: DECIMAL(10, 2)
   - `currency`: VARCHAR(3) (Default: 'RWF')
   - `payment_method`: VARCHAR(20) ('mobile_money', 'bank', etc.)
   - `payment_provider`: VARCHAR(20) ('mtn', 'airtel', etc.)
   - `payment_reference`: VARCHAR(100)
   - `status`: VARCHAR(20) ('pending', 'completed', 'failed')
   - `subscription_type`: VARCHAR(20) ('single', 'daily', 'weekly', 'monthly')
   - `created_at`: TIMESTAMP WITH TIME ZONE
   - `updated_at`: TIMESTAMP WITH TIME ZONE

3. **access_codes**

   - `id`: UUID (Primary Key)
   - `code`: VARCHAR(20) (Unique)
   - `user_id`: UUID (Foreign Key to users.id)
   - `subscription_type`: VARCHAR(20) ('single', 'daily', 'weekly', 'monthly')
   - `valid_from`: TIMESTAMP WITH TIME ZONE
   - `valid_until`: TIMESTAMP WITH TIME ZONE
   - `is_used`: BOOLEAN
   - `created_at`: TIMESTAMP WITH TIME ZONE
   - `created_by`: UUID
   - `used_at`: TIMESTAMP WITH TIME ZONE

4. **test_sessions**

   - `id`: UUID (Primary Key)
   - `user_id`: UUID (Foreign Key to users.id)
   - `start_time`: TIMESTAMP WITH TIME ZONE
   - `end_time`: TIMESTAMP WITH TIME ZONE
   - `score`: INTEGER
   - `total_questions`: INTEGER
   - `language`: VARCHAR(2) ('kn', 'en', 'fr')
   - `is_completed`: BOOLEAN
   - `created_at`: TIMESTAMP WITH TIME ZONE
   - `updated_at`: TIMESTAMP WITH TIME ZONE

5. **test_answers**

   - `id`: UUID (Primary Key)
   - `session_id`: UUID (Foreign Key to test_sessions.id)
   - `question_id`: UUID
   - `selected_option`: INTEGER
   - `is_correct`: BOOLEAN
   - `created_at`: TIMESTAMP WITH TIME ZONE

6. **questions**
   - `id`: UUID (Primary Key)
   - `question_text`: JSONB (multi-language support)
   - `options`: JSONB (multi-language support)
   - `correct_option`: INTEGER
   - `category`: VARCHAR(50)
   - `difficulty`: VARCHAR(20) ('easy', 'medium', 'hard')
   - `image_url`: VARCHAR(255)
   - `created_at`: TIMESTAMP WITH TIME ZONE
   - `updated_at`: TIMESTAMP WITH TIME ZONE
   - `is_active`: BOOLEAN

### Database Functions

1. **validate_access_code(code_param TEXT)**

   - Validates an access code and marks it as used
   - Returns user_id, subscription_type, and valid_until

2. **create_or_update_user(phone_number_param TEXT, subscription_type_param TEXT, subscription_days INTEGER)**

   - Creates a new user or updates an existing one
   - Returns the user ID

3. **generate_access_code(subscription_type_param TEXT, valid_days INTEGER, created_by_param UUID DEFAULT NULL)**
   - Generates a unique access code
   - Returns the generated code

## Row Level Security (RLS)

The platform uses Row Level Security (RLS) to ensure that users can only access their own data:

1. **users table**

   - Users can only select their own records

2. **payments table**

   - Users can only select payments associated with their user ID

3. **access_codes table**

   - Users can only select access codes associated with their user ID or public access codes

4. **test_sessions table**

   - Users can only select, insert, and update their own test sessions

5. **test_answers table**

   - Users can only select and insert answers for their own test sessions

6. **questions table**
   - All active questions are publicly readable

## API Integration

The platform uses the following API routes to interact with Supabase:

1. **/api/auth/code**

   - Validates access codes and creates user sessions

2. **/api/payment/initiate**

   - Initiates payment processes
   - Creates user records
   - Generates access codes

3. **/api/payment/verify**
   - Verifies payment status
   - Retrieves payment and access code details

## Client Integration

The platform uses three Supabase client types:

1. **Client Component Client**

   - Used in client-side components
   - Limited to RLS-protected operations

2. **Server Component Client**

   - Used in server components
   - Has access to cookies for authentication

3. **Admin Client**
   - Used in API routes and server-side operations
   - Has full access to the database using the service role key

## TypeScript Integration

The platform uses TypeScript types generated from the Supabase schema to ensure type safety:

```typescript
import { Database } from "@/lib/types/database.types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient<Database>();
```

## Authentication Flow

1. User enters an access code
2. The code is validated using the `validate_access_code` database function
3. If valid, a session is created for the user
4. The user is granted access based on their subscription type and validity period

## Payment Flow

1. User selects a subscription plan and enters their phone number
2. A payment record is created in the `payments` table with status 'pending'
3. The payment is processed (simulated for now, will integrate with Flutterwave)
4. Upon successful payment, the status is updated to 'completed'
5. An access code is generated and associated with the user
6. The user can use this code to access the platform

## Future Enhancements

1. **Real Payment Integration**

   - Integrate with Flutterwave API for real payment processing

2. **Admin Dashboard**

   - Create an admin interface for managing users, payments, and access codes

3. **Analytics**

   - Implement analytics tracking for user behavior and test performance

4. **Content Management**
   - Create a system for managing test questions and categories
