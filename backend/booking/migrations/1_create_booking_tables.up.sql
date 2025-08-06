CREATE TABLE office_hours (
  id BIGSERIAL PRIMARY KEY,
  expert_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price_cents BIGINT NOT NULL DEFAULT 0,
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE availability_slots (
  id BIGSERIAL PRIMARY KEY,
  office_hours_id BIGINT NOT NULL REFERENCES office_hours(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE bookings (
  id BIGSERIAL PRIMARY KEY,
  office_hours_id BIGINT NOT NULL REFERENCES office_hours(id),
  slot_id BIGINT NOT NULL REFERENCES availability_slots(id),
  founder_id BIGINT NOT NULL,
  expert_id BIGINT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  meeting_url VARCHAR(500),
  notes TEXT,
  founder_notes TEXT,
  expert_notes TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_office_hours_expert_id ON office_hours(expert_id);
CREATE INDEX idx_availability_slots_office_hours_id ON availability_slots(office_hours_id);
CREATE INDEX idx_availability_slots_start_time ON availability_slots(start_time);
CREATE INDEX idx_bookings_founder_id ON bookings(founder_id);
CREATE INDEX idx_bookings_expert_id ON bookings(expert_id);
CREATE INDEX idx_bookings_scheduled_at ON bookings(scheduled_at);
CREATE INDEX idx_bookings_status ON bookings(status);
