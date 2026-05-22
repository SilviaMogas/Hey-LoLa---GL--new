// Seed the Foundation `shelters` collection in Firestore with the 5 NYC
// rescue partners + their adoptable dogs (real profiles). The /foundation
// page reads this collection live — nothing is hardcoded in the app.
//
//   FIREBASE_ADMIN_PROJECT_ID=...    \
//   FIREBASE_ADMIN_CLIENT_EMAIL=...  \
//   FIREBASE_ADMIN_PRIVATE_KEY="..." \
//   FIREBASE_DATABASE_ID=ai-studio-041ff40c-7f72-4aad-a12c-bcd060760a1d \
//   node scripts/import_shelters.mjs
//
// Idempotent: each shelter is a doc keyed by id and written with merge, so
// re-running refreshes the data. Edit the SHELTERS array (or the Firestore
// docs directly) to add/update real dogs as Hey Lola onboards them.
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const env = (k) => process.env[k] || '';
const projectId = env('FIREBASE_ADMIN_PROJECT_ID');
const clientEmail = env('FIREBASE_ADMIN_CLIENT_EMAIL');
const pemFromEnv = env('FIREBASE_ADMIN_PRIVATE_KEY');
const databaseId = env('FIREBASE_DATABASE_ID');

if (!projectId || !clientEmail || !pemFromEnv) {
  console.error('Missing FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY');
  process.exit(1);
}

const app = initializeApp({
  credential: cert({ projectId, clientEmail, privateKey: pemFromEnv.replace(/\\n/g, '\n') }),
});
const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

const SHELTERS = [
  {
    id: 'bobbi-and-the-strays', order: 1,
    name: 'Bobbi and the Strays',
    city: 'Queens & Long Island, NY', region: 'Americas',
    blurb: 'A no-kill organization rescuing and rehabilitating orphaned, stray, abused and special-needs cats and dogs across New York City and Long Island.',
    website: 'https://bobbiandthestrays.org/adopt-a-dog/',
    dogs: [
      { id: 'bobbi-kobe', name: 'Kobe', breed: 'Mixed breed', age: 'Adult', sex: 'Male', photo: 'https://bobbiandthestrays.org/wp-content/uploads/2026/05/687790397_10231092517156832_6892784445848073292_n-881x1024.jpg', bio: 'Energetic, affectionate boy given up due to his owner’s illness, now searching for a loving home.' },
      { id: 'bobbi-kash', name: 'Kash', breed: 'Mixed breed', age: 'Young', sex: 'Male', photo: 'https://bobbiandthestrays.org/wp-content/uploads/2026/05/686932896_3108594562681428_24388995081482222_n-611x1024.jpg', bio: 'His smile will brighten your day! Given up through no fault of his own and ready for his family.' },
      { id: 'bobbi-pepper', name: 'Pepper', breed: 'Mixed breed', age: 'Adult', sex: 'Male', photo: 'https://bobbiandthestrays.org/wp-content/uploads/2026/05/690641748_10231095472270708_4305997250677485513_n-1024x689.jpg', bio: 'Pepper wants to sprinkle his joy all over his new family.' },
    ],
  },
  {
    id: 'badass-animal-rescue', order: 2,
    name: 'Badass Animal Rescue',
    city: 'Brooklyn, NY', region: 'Americas',
    blurb: 'A foster-based 501(c)3 saving and rehabilitating loving dogs from high-kill shelters since 2011 — over 4,000 dogs rescued.',
    website: 'https://badassanimalrescue.com/find-a-dog-new',
    dogs: [], // onboard real Badass dogs here (their listings are dynamic)
  },
  {
    id: 'ama-animal-rescue', order: 3,
    name: 'AMA Animal Rescue',
    city: 'Brooklyn, NY', region: 'Americas',
    blurb: 'Angels for Mistreated Animals — a no-kill rescue in Brooklyn rehabilitating abused and injured dogs and cats and giving them loving futures.',
    website: 'https://amaanimalrescue.org/pet-type/dogs/',
    dogs: [
      { id: 'ama-penny', name: 'Penny', breed: 'Terrier mix', age: 'Adult', sex: 'Female', bio: 'Sweet and loving, Penny is looking for the forever home she has always deserved.' },
      { id: 'ama-theodore', name: 'Theodore', breed: 'Beagle', age: 'Adult', sex: 'Male', bio: 'A friendly, curious beagle with a big heart and a great nose for fun.' },
      { id: 'ama-simon', name: 'Simon', breed: 'Beagle', age: 'Adult', sex: 'Male', bio: 'Gentle and people-loving, Simon would make a wonderful companion.' },
    ],
  },
  {
    id: 'social-tees', order: 4,
    name: 'Social Tees Animal Rescue',
    city: 'East Village, NYC', region: 'Americas',
    blurb: 'A foster-based, strictly no-kill rescue in the East Village that takes abandoned animals from kill shelters into safe homes, matching each one with the right family.',
    website: 'https://www.adoptapet.com/shelter/83349-social-tees-animal-rescue-new-york-new-york',
    dogs: [], // onboard real Social Tees dogs here (listed via Adopt-a-Pet)
  },
  {
    id: 'animal-haven', order: 5,
    name: 'Animal Haven',
    city: 'Manhattan, NYC', region: 'Americas',
    blurb: 'Serving New York City since 1967 with top-quality care, behavior support and enrichment for abandoned cats and dogs across the Tri-State area.',
    website: 'https://animalhaven.org/adopt/dogs',
    dogs: [
      { id: 'ah-marcia', name: 'Marcia', breed: 'Mixed breed', age: '1 yr', sex: 'Female', photo: 'https://new-s3.shelterluv.com/profile-pictures/6d99fd93a8542ca16d0cf30e6f3a497a/0a63c68292bc9103202c5222036e9c25.jpg', bio: 'A sweet young girl ready to start her next chapter with a loving family.' },
      { id: 'ah-darcy', name: 'Darcy', breed: 'Puppy', age: '2 mo', sex: 'Female', photo: 'https://new-s3.shelterluv.com/profile-pictures/ad2a9e6d6516ec881f696ba41773f9f0/eb1765b94ad08b2324b8f58598ad653e.jpg', bio: 'A tiny, playful puppy with a whole life of love ahead of her.' },
      { id: 'ah-wiggly-diggly', name: 'Wiggly Diggly', breed: 'Senior', age: '14 yrs', sex: 'Female', photo: 'https://new-s3.shelterluv.com/profile-pictures/9ea04b5122ba2540b9c9e34c73f52b5d/9b1ac0de4ef8ff0a368b649482b61fd2.jpg', bio: 'A gentle senior sweetheart hoping for a soft place to land in her golden years.' },
    ],
  },
];

async function main() {
  let n = 0;
  for (const s of SHELTERS) {
    await db.collection('shelters').doc(s.id).set({ ...s, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    n += 1;
    console.log(`  · ${s.name} (${s.dogs.length} dogs)`);
  }
  console.log(`Done. ${n} shelters written to Firestore.`);
}

main().catch((err) => { console.error('import_shelters failed:', err); process.exit(1); });
