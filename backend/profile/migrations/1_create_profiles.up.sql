CREATE TABLE founder_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  bio TEXT,
  location VARCHAR(255),
  avatar_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  twitter_url VARCHAR(500),
  website_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE startups (
  id BIGSERIAL PRIMARY KEY,
  founder_id BIGINT NOT NULL REFERENCES founder_profiles(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  industry VARCHAR(100),
  stage VARCHAR(50),
  funding_amount BIGINT,
  location VARCHAR(255),
  website_url VARCHAR(500),
  logo_url VARCHAR(500),
  founded_year INTEGER,
  employee_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE investor_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  bio TEXT,
  firm_name VARCHAR(255),
  investment_focus TEXT[],
  ticket_size_min BIGINT,
  ticket_size_max BIGINT,
  location VARCHAR(255),
  avatar_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  website_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE expert_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  bio TEXT,
  expertise_areas TEXT[],
  hourly_rate BIGINT,
  location VARCHAR(255),
  avatar_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  website_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_founder_profiles_user_id ON founder_profiles(user_id);
CREATE INDEX idx_startups_founder_id ON startups(founder_id);
CREATE INDEX idx_startups_industry ON startups(industry);
CREATE INDEX idx_startups_stage ON startups(stage);
CREATE INDEX idx_investor_profiles_user_id ON investor_profiles(user_id);
CREATE INDEX idx_expert_profiles_user_id ON expert_profiles(user_id);
