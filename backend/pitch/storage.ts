import { Bucket } from "encore.dev/storage/objects";

export const pitchBucket = new Bucket("pitch-decks", {
  public: false,
  versioned: true,
});
