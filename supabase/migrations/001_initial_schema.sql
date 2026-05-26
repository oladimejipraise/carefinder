-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Hospitals table
CREATE TABLE hospitals (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  address          TEXT NOT NULL,
  city             TEXT NOT NULL,
  lga              TEXT NOT NULL,
  phone            TEXT NOT NULL,
  email            TEXT,
  specialties      TEXT[] DEFAULT '{}',
  ownership        TEXT CHECK (ownership IN ('public','private')),
  location         GEOGRAPHY(POINT, 4326),
  description_md   TEXT,
  visiting_hours   TEXT,
  rating_avg       NUMERIC(3,2) DEFAULT 0,
  review_count     INT DEFAULT 0,
  created_by       UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id),
  rating      INT CHECK (rating BETWEEN 1 AND 5),
  text        TEXT,
  status      TEXT DEFAULT 'pending'
              CHECK (status IN ('approved','hidden','pending')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (hospital_id, user_id)
);

CREATE TABLE hospital_images (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id  UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  uploaded_by  UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX hospitals_location_idx
  ON hospitals USING GIST(location);

CREATE OR REPLACE FUNCTION update_hospital_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE hospitals
  SET
    rating_avg   = (
      SELECT ROUND(AVG(rating)::NUMERIC, 2)
      FROM reviews
      WHERE hospital_id = COALESCE(NEW.hospital_id, OLD.hospital_id)
        AND status = 'approved'
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE hospital_id = COALESCE(NEW.hospital_id, OLD.hospital_id)
        AND status = 'approved'
    )
  WHERE id = COALESCE(NEW.hospital_id, OLD.hospital_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_hospital_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_hospital_rating();

ALTER TABLE hospitals       ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews         ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hospitals_read_all"
  ON hospitals FOR SELECT USING (true);

CREATE POLICY "hospitals_admin_insert"
  ON hospitals FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'admin');

CREATE POLICY "hospitals_admin_update"
  ON hospitals FOR UPDATE
  USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "hospitals_admin_delete"
  ON hospitals FOR DELETE
  USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "reviews_read_approved"
  ON reviews FOR SELECT USING (status = 'approved');

CREATE POLICY "reviews_user_insert"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_user_update_own"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "reviews_admin_moderate"
  ON reviews FOR UPDATE
  USING (auth.jwt()->>'role' = 'admin');

-- Images: public read, admin write
CREATE POLICY "images_read_all"
  ON hospital_images FOR SELECT USING (true);

CREATE POLICY "images_admin_insert"
  ON hospital_images FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'admin');