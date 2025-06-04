-- Create schema for MWALIMU Clement platform
-- Initial database structure with Row Level Security policies

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  subscription_type VARCHAR(20), -- 'single', 'daily', 'weekly', 'monthly'
  subscription_start TIMESTAMP WITH TIME ZONE,
  subscription_end TIMESTAMP WITH TIME ZONE
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'RWF',
  payment_method VARCHAR(20) NOT NULL, -- 'mobile_money', 'bank', etc.
  payment_provider VARCHAR(20), -- 'mtn', 'airtel', etc.
  payment_reference VARCHAR(100), -- External payment reference
  status VARCHAR(20) NOT NULL, -- 'pending', 'completed', 'failed'
  subscription_type VARCHAR(20) NOT NULL, -- 'single', 'daily', 'weekly', 'monthly'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create access_codes table
CREATE TABLE IF NOT EXISTS access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  subscription_type VARCHAR(20) NOT NULL, -- 'single', 'daily', 'weekly', 'monthly'
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID, -- Admin user who created the code
  used_at TIMESTAMP WITH TIME ZONE
);

-- Create test_sessions table
CREATE TABLE IF NOT EXISTS test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  total_questions INTEGER,
  language VARCHAR(2) DEFAULT 'kn', -- 'kn' for Kinyarwanda, 'en' for English, 'fr' for French
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test_answers table to store user answers
CREATE TABLE IF NOT EXISTS test_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES test_sessions(id),
  question_id UUID NOT NULL,
  selected_option INTEGER,
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text JSONB NOT NULL, -- {kn: "Question in Kinyarwanda", en: "Question in English", fr: "Question in French"}
  options JSONB NOT NULL, -- [{kn: "Option 1 in Kinyarwanda", en: "Option 1 in English", fr: "Option 1 in French"}, ...]
  correct_option INTEGER NOT NULL,
  category VARCHAR(50), -- 'traffic_signs', 'road_rules', etc.
  difficulty VARCHAR(20) DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  image_url VARCHAR(255), -- URL to an image if the question has one
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_subscription_end ON users(subscription_end);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON access_codes(code);
CREATE INDEX IF NOT EXISTS idx_access_codes_valid_until ON access_codes(valid_until);
CREATE INDEX IF NOT EXISTS idx_test_sessions_user_id ON test_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_test_answers_session_id ON test_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_is_active ON questions(is_active);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users table policies
CREATE POLICY users_select_own ON users FOR SELECT
  USING (auth.uid() = id);

-- Payments table policies
CREATE POLICY payments_select_own ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- Access codes table policies
CREATE POLICY access_codes_select_own ON access_codes FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Test sessions table policies
CREATE POLICY test_sessions_select_own ON test_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY test_sessions_insert_own ON test_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY test_sessions_update_own ON test_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Test answers table policies
CREATE POLICY test_answers_select_own ON test_answers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM test_sessions
    WHERE test_sessions.id = test_answers.session_id
    AND test_sessions.user_id = auth.uid()
  ));

CREATE POLICY test_answers_insert_own ON test_answers FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM test_sessions
    WHERE test_sessions.id = test_answers.session_id
    AND test_sessions.user_id = auth.uid()
  ));

-- Questions table policies
CREATE POLICY questions_select_all ON questions FOR SELECT
  USING (is_active = TRUE);

-- Create functions for authentication with access codes
CREATE OR REPLACE FUNCTION validate_access_code(code_param TEXT)
RETURNS TABLE (
  user_id UUID,
  subscription_type TEXT,
  valid_until TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Update the access code to mark it as used
  UPDATE access_codes
  SET is_used = TRUE, used_at = NOW()
  WHERE code = code_param
    AND is_used = FALSE
    AND valid_until > NOW();
  
  -- Return the user information
  RETURN QUERY
  SELECT ac.user_id, ac.subscription_type, ac.valid_until
  FROM access_codes ac
  WHERE ac.code = code_param
    AND ac.valid_until > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a new user or update existing one
CREATE OR REPLACE FUNCTION create_or_update_user(
  phone_number_param TEXT,
  subscription_type_param TEXT,
  subscription_days INTEGER
)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
  subscription_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate subscription end date
  subscription_end_date := NOW() + (subscription_days * INTERVAL '1 day');
  
  -- Check if user exists
  SELECT id INTO user_id FROM users WHERE phone_number = phone_number_param;
  
  IF user_id IS NULL THEN
    -- Create new user
    INSERT INTO users (
      phone_number,
      subscription_type,
      subscription_start,
      subscription_end,
      last_login
    ) VALUES (
      phone_number_param,
      subscription_type_param,
      NOW(),
      subscription_end_date,
      NOW()
    ) RETURNING id INTO user_id;
  ELSE
    -- Update existing user
    UPDATE users
    SET subscription_type = subscription_type_param,
        subscription_start = NOW(),
        subscription_end = subscription_end_date,
        last_login = NOW(),
        updated_at = NOW()
    WHERE id = user_id;
  END IF;
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate an access code
CREATE OR REPLACE FUNCTION generate_access_code(
  subscription_type_param TEXT,
  valid_days INTEGER,
  created_by_param UUID DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 6-character code
    new_code := upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM access_codes WHERE code = new_code) INTO code_exists;
    
    -- Exit loop if code doesn't exist
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  -- Insert the new code
  INSERT INTO access_codes (
    code,
    subscription_type,
    valid_from,
    valid_until,
    created_by
  ) VALUES (
    new_code,
    subscription_type_param,
    NOW(),
    NOW() + (valid_days * INTERVAL '1 day'),
    created_by_param
  );
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin role
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
    CREATE ROLE admin;
  END IF;
END
$$; 