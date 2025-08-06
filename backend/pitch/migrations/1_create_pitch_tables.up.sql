CREATE TABLE pitch_decks (
  id BIGSERIAL PRIMARY KEY,
  founder_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'processing',
  view_count BIGINT NOT NULL DEFAULT 0,
  like_count BIGINT NOT NULL DEFAULT 0,
  comment_count BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE pitch_slides (
  id BIGSERIAL PRIMARY KEY,
  pitch_deck_id BIGINT NOT NULL REFERENCES pitch_decks(id) ON DELETE CASCADE,
  slide_number INTEGER NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  text_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE pitch_comments (
  id BIGSERIAL PRIMARY KEY,
  pitch_deck_id BIGINT NOT NULL REFERENCES pitch_decks(id) ON DELETE CASCADE,
  slide_id BIGINT REFERENCES pitch_slides(id) ON DELETE CASCADE,
  author_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  x_position DOUBLE PRECISION,
  y_position DOUBLE PRECISION,
  like_count BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pitch_decks_founder_id ON pitch_decks(founder_id);
CREATE INDEX idx_pitch_decks_status ON pitch_decks(status);
CREATE INDEX idx_pitch_slides_pitch_deck_id ON pitch_slides(pitch_deck_id);
CREATE INDEX idx_pitch_slides_slide_number ON pitch_slides(pitch_deck_id, slide_number);
CREATE INDEX idx_pitch_comments_pitch_deck_id ON pitch_comments(pitch_deck_id);
CREATE INDEX idx_pitch_comments_slide_id ON pitch_comments(slide_id);
