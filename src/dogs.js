import manifest from "../assets/manifest.json";

export const dogs = manifest.dogs;
export const heroSrc = `/${manifest.hero.path}`;

export function dogBySlug(slug) {
  return dogs.find((dog) => dog.slug === slug) || dogs[0];
}

export function poseSrc(dog, pose) {
  const file = dog.poses[pose] || dog.poses.sit;
  return `/${file}`;
}

const DAILY_POSES = ["sit", "stretch", "act-a", "act-b"];

export function dailyPose(slug, date = new Date()) {
  const key = `${slug}:${date.toISOString().slice(0, 10)}`;
  let hash = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return DAILY_POSES[(hash >>> 0) % DAILY_POSES.length];
}
