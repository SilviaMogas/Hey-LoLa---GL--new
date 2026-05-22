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
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';

// Base URL used to build the shareable shelter edit links.
const BASE = (process.env.APP_URL || 'https://heylola.co').replace(/\/$/, '');

const env = (k) => process.env[k] || '';
const databaseId = env('FIREBASE_DATABASE_ID');

// Robust private-key parser: tolerates surrounding quotes, literal "\n",
// real newlines, CRLF and base64-encoded PEM. Mirrors api/_admin.ts so the
// script never trips on how PowerShell/bash store the multi-line key.
function parsePrivateKey(raw) {
  let key = raw;
  if (key.charCodeAt(0) === 0xFEFF) key = key.slice(1);
  key = key.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) key = key.slice(1, -1);
  if (!key.startsWith('-----BEGIN')) {
    const stripped = key.replace(/\s/g, '');
    if (/^[A-Za-z0-9+/=]+$/.test(stripped) && stripped.length > 1000) {
      try { const decoded = Buffer.from(stripped, 'base64').toString('utf8'); if (decoded.includes('-----BEGIN')) key = decoded; } catch { /* ignore */ }
    }
  }
  if (key.includes('\\n')) key = key.replace(/\\n/g, '\n');
  return key.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

// EASIEST path: point GOOGLE_APPLICATION_CREDENTIALS (or SERVICE_ACCOUNT_FILE)
// at your downloaded service-account JSON file — no key copy-pasting at all.
// Fallback: the three FIREBASE_ADMIN_* env vars (key parsed robustly above).
const keyFile = env('GOOGLE_APPLICATION_CREDENTIALS') || env('SERVICE_ACCOUNT_FILE');
let credential;
if (keyFile) {
  const sa = JSON.parse(readFileSync(keyFile, 'utf8'));
  credential = cert({ projectId: sa.project_id, clientEmail: sa.client_email, privateKey: sa.private_key });
} else {
  const projectId = env('FIREBASE_ADMIN_PROJECT_ID');
  const clientEmail = env('FIREBASE_ADMIN_CLIENT_EMAIL');
  const pemFromEnv = env('FIREBASE_ADMIN_PRIVATE_KEY');
  if (!projectId || !clientEmail || !pemFromEnv) {
    console.error('Set GOOGLE_APPLICATION_CREDENTIALS to your service-account JSON file path, OR set FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY.');
    process.exit(1);
  }
  credential = cert({ projectId, clientEmail, privateKey: parsePrivateKey(pemFromEnv) });
}

const app = initializeApp({ credential });
const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

// Source of truth mirrors src/data/sheltersSeed.ts (real dogs scraped from each
// partner's site). Keep both in sync. Badass + Social Tees list dogs through
// external platforms, so their dogs are added manually from /admin → Shelters.
const SHELTERS = [
  {
    id: 'bobbi-and-the-strays', order: 1,
    name: 'Bobbi and the Strays',
    city: 'Queens & Long Island, NY', region: 'Americas',
    blurb: 'A no-kill organization rescuing and rehabilitating orphaned, stray, abused and special-needs cats and dogs across New York City and Long Island.',
    website: 'https://bobbiandthestrays.org/adopt-a-dog/',
    dogs: [
      { id: 'bobbi-abby', name: 'Abby', breed: 'Mixed breed', age: 'Adult', sex: 'Female', photo: 'https://bobbiandthestrays.org/wp-content/uploads/2025/02/482358688_122216509544229903_3555225045807675956_n-768x1024.jpg', bio: 'This beautiful girl has not had an easy life. Abby is ready for a family who will give her the love she deserves.' },
      { id: 'bobbi-athena', name: 'Athena', breed: 'Pit Bull Terrier mix', age: '7 yrs', sex: 'Female', photo: 'https://bobbiandthestrays.org/wp-content/uploads/2022/12/385907442_10231561518047156_2954351285001090201_n.jpg', bio: 'Athena has overcome unthinkable hardships and is ready for a loving forever home.' },
      { id: 'bobbi-biscuit', name: 'Biscuit', breed: 'Mixed breed', age: 'Senior', sex: 'Female', photo: 'https://bobbiandthestrays.org/wp-content/uploads/2026/04/669885288_10230870437004967_2817426302205603059_n-790x1024.jpg', bio: 'Brave little Biscuit is ready to begin her new golden chapter in a home where she will be loved.' },
      { id: 'bobbi-bravo', name: 'Bravo', breed: 'Mixed breed', age: 'Senior', sex: 'Male', photo: 'https://bobbiandthestrays.org/wp-content/uploads/2026/02/658157127_26476333505327016_5896507743526475596_n-682x1024.jpg', bio: 'A gentle, loving senior with some vision impairment, looking for a calm, caring home.' },
      { id: 'bobbi-buckey', name: 'Buckey', breed: 'Mixed breed', age: '1 yr', sex: 'Male', photo: 'https://bobbiandthestrays.org/wp-content/uploads/2025/09/549511460_24722282740732110_7967736384481264689_n-768x1024.jpg', bio: 'A one-year-old bundle of love ready to be your future best friend.' },
      { id: 'bobbi-candy', name: 'Candy', breed: 'Mixed breed', age: 'Adult', sex: 'Female', photo: 'https://bobbiandthestrays.org/wp-content/uploads/2026/04/680749532_10231012781563492_742745350360228881_n-1024x716.jpg', bio: 'Our delicious and sweet Candy is ready to begin her new life in a loving home.' },
      { id: 'bobbi-clover', name: 'Clover (Buddy)', breed: 'Cocker Spaniel / Shih Tzu mix', age: '8.5 yrs', sex: 'Male', photo: 'https://bobbiandthestrays.org/wp-content/uploads/2019/09/338192929_1550562875436084_5886594316250828194_n.jpg', bio: 'A gorgeous senior who needs a new forever home full of comfort and love.' },
      { id: 'bobbi-griselda', name: 'Griselda', breed: 'Mixed breed', age: 'Adult', sex: 'Female', photo: 'https://bobbiandthestrays.org/wp-content/uploads/2024/02/476358253_9306545306065770_3539563277779394879_n-767x1024.jpg', bio: 'A very friendly, loving and super sweet best friend waiting just for you.' },
      { id: 'bobbi-gucci', name: 'Gucci', breed: 'Mixed breed', age: 'Adult', sex: 'Male', photo: 'https://bobbiandthestrays.org/wp-content/uploads/2025/02/648870855_26274067995553569_5785104265734854406_n-768x1024.jpg', bio: 'Handsome Gucci was abandoned in the cold and is now searching for a family to trust again.' },
      { id: 'bobbi-henry', name: 'Henry', breed: 'Mixed breed', age: 'Adult', sex: 'Male', photo: 'https://bobbiandthestrays.org/wp-content/uploads/2026/01/624254530_3014599682080917_5603843912712303186_n.jpg', bio: 'Henry lost his special person and is now in search of a loving new home.' },
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
      { id: 'ama-penny', name: 'Penny', breed: 'Terrier mix', age: 'Adult', sex: 'Female', photo: 'https://amaanimalrescue.org/wp-content/uploads/2026/05/820c5d53-c65b-4245-94e6-92e6c9f65fa6-scaled-e1779281562667-250x250.jpeg', bio: 'Rescued by AMA and looking for her loving forever home.' },
      { id: 'ama-isaiah', name: 'Isaiah', breed: 'Maltese mix', age: 'Adult', sex: 'Male', photo: 'https://amaanimalrescue.org/wp-content/uploads/2026/05/540aa232-2983-4ca6-bf0d-7058a1d7aa94-scaled-250x250.jpg', bio: 'A sweet little Maltese mix ready to find his people.' },
      { id: 'ama-theodore', name: 'Theodore', breed: 'Beagle', age: 'Adult', sex: 'Male', photo: 'https://amaanimalrescue.org/wp-content/uploads/2026/05/69cb0472-709a-4676-8129-41b6e7327b66-scaled-250x250.jpg', bio: 'A friendly, curious beagle with a big heart.' },
      { id: 'ama-simon', name: 'Simon', breed: 'Beagle', age: 'Adult', sex: 'Male', photo: 'https://amaanimalrescue.org/wp-content/uploads/2026/05/IMG_5181-scaled-250x250.jpeg', bio: 'Gentle and people-loving, Simon would make a wonderful companion.' },
      { id: 'ama-alvin', name: 'Alvin', breed: 'Beagle', age: 'Adult', sex: 'Male', photo: 'https://amaanimalrescue.org/wp-content/uploads/2026/05/8b7e5a9e-483a-4197-badc-070f17ec04f6-scaled-250x250.jpeg', bio: 'A happy beagle looking for a family to call his own.' },
      { id: 'ama-cookie', name: 'Cookie', breed: 'French Bulldog', age: 'Adult', sex: 'Female', photo: 'https://amaanimalrescue.org/wp-content/uploads/2026/05/4d9ceaed-4526-48be-9b7a-994bf30c0eb0-scaled-250x250.jpeg', bio: 'A charming French Bulldog hoping to find her forever home.' },
      { id: 'ama-bella', name: 'Bella', breed: 'Maltese mix', age: 'Adult', sex: 'Female', photo: 'https://amaanimalrescue.org/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-10-at-4.43.00-PM-250x250.jpeg', bio: 'Sweet Bella is ready for a home full of love.' },
      { id: 'ama-chanel', name: 'Chanel', breed: 'Poodle', age: 'Adult', sex: 'Female', photo: 'https://amaanimalrescue.org/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-10-at-4.43.00-PM-3-250x250.jpeg', bio: 'An elegant poodle looking for her perfect match.' },
      { id: 'ama-olive', name: 'Olive', breed: 'Pit Bull mix', age: 'Adult', sex: 'Female', photo: 'https://amaanimalrescue.org/wp-content/uploads/2026/04/6d1918c2-d803-40e0-8429-40740e1b4a41-250x250.jpg', bio: 'A loving pittie mix ready to share her affection.' },
      { id: 'ama-maya', name: 'Maya', breed: 'Pit Bull mix', age: 'Adult', sex: 'Female', photo: 'https://amaanimalrescue.org/wp-content/uploads/2026/02/3057ea85-6d9f-4318-98f5-8cd7464e6bdf-scaled-250x250.jpg', bio: 'Maya is searching for a patient, loving family.' },
      { id: 'ama-poppy', name: 'Poppy', breed: 'Brussels Griffon mix', age: 'Adult', sex: 'Female', photo: 'https://amaanimalrescue.org/wp-content/uploads/2026/05/46e2eb34-2da8-4eae-9ba8-9bd6075e0a95-250x250.jpg', bio: 'A spirited little Griffon mix with lots of love to give.' },
      { id: 'ama-cj', name: 'CJ', breed: 'Terrier mix', age: 'Adult', sex: 'Male', photo: 'https://amaanimalrescue.org/wp-content/uploads/2026/02/8dfca55d-700a-4a25-b93f-0376ea10edea-250x250.jpg', bio: 'CJ is a friendly terrier mix ready for his next adventure.' },
      { id: 'ama-mable', name: 'Mable', breed: 'Hound mix', age: 'Adult', sex: 'Female', photo: 'https://amaanimalrescue.org/wp-content/uploads/2026/02/997daccd-4d0e-4882-b488-e4bc871a1259-scaled-250x250.jpg', bio: 'A sweet hound mix hoping for a comfy couch and a loving family.' },
      { id: 'ama-bruno', name: 'Bruno', breed: 'Chihuahua mix', age: 'Adult', sex: 'Male', photo: 'https://amaanimalrescue.org/wp-content/uploads/2026/02/11a8f6d5-aa51-41df-b90a-e42a69f094c9-250x250.jpg', bio: 'A pocket-sized cuddle buddy looking for his person.' },
      { id: 'ama-jasper', name: 'Jasper', breed: 'Pit Bull mix', age: 'Adult', sex: 'Male', photo: 'https://amaanimalrescue.org/wp-content/uploads/2026/01/4fc70c5d-e70a-4997-8552-330c32683b9f-scaled-250x250.jpg', bio: 'Jasper is a gentle, loyal boy ready to find his family.' },
      { id: 'ama-apollo', name: 'Apollo', breed: 'Poodle', age: 'Adult', sex: 'Male', photo: 'https://amaanimalrescue.org/wp-content/uploads/2025/10/f9f3279e-e553-4c55-a6d0-040b4fdc80ee-scaled-250x250.jpg', bio: 'A handsome poodle looking for a loving forever home.' },
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
      { id: 'ah-marcia', name: 'Marcia', breed: 'Rescue dog', age: '1 yr', sex: 'Female', photo: 'https://new-s3.shelterluv.com/profile-pictures/6d99fd93a8542ca16d0cf30e6f3a497a/0a63c68292bc9103202c5222036e9c25.jpg', bio: "In Animal Haven's care and ready to start her next chapter with a loving family." },
      { id: 'ah-egg-drop-soup', name: 'Egg Drop Soup', breed: 'Rescue dog', age: '1 yr', sex: 'Female', photo: 'https://new-s3.shelterluv.com/profile-pictures/7c0b9d02a48152b547e5e49966a8d038/6b2a091deec43f855c3ba9d8a6949218.jpg', bio: 'A playful young girl looking for her forever home.' },
      { id: 'ah-eli', name: 'Eli', breed: 'Rescue dog', age: '2 yrs', sex: 'Male', photo: 'https://new-s3.shelterluv.com/profile-pictures/7641e9c6a5e869cf6cfe1b3f26264c65/7209ccdb27a90a7c2a9abb38a94c8c0d.jpg', bio: 'A friendly boy ready to share his love with a new family.' },
      { id: 'ah-della', name: 'Della', breed: 'Rescue dog', age: '2 yrs', sex: 'Female', photo: 'https://new-s3.shelterluv.com/profile-pictures/e76769b1c392a769f0edcb3d61b0de40/b49f4304e9c88638c8a4ba21c6140107.jpg', bio: 'Sweet Della is hoping to find her people.' },
      { id: 'ah-vera', name: 'Vera', breed: 'Puppy', age: '2 mo', sex: 'Female', photo: 'https://new-s3.shelterluv.com/profile-pictures/e796aaefde0b01541f7d6579846e62b9/e7639ebdf32baa3cef305760621da856.jpg', bio: 'A tiny puppy with a whole life of love ahead of her.' },
      { id: 'ah-daria', name: 'Daria', breed: 'Rescue dog', age: '5 yrs', sex: 'Female', photo: 'https://new-s3.shelterluv.com/profile-pictures/54f19a4f0579540d99408ccebeccde07/c22b7f572a8033110f0e0c9fbee285c1.jpeg', bio: 'A wonderful girl ready for a calm, loving home.' },
      { id: 'ah-henrietta', name: 'Henrietta', breed: 'Senior', age: '16 yrs', sex: 'Female', photo: 'https://new-s3.shelterluv.com/profile-pictures/ca4f7b46eff805b6bb308f519942f85a/423dade9429c408a813c255903fac210.jpeg', bio: 'A gentle senior sweetheart hoping for a soft place to land.' },
      { id: 'ah-mario', name: 'Mario', breed: 'Rescue dog', age: '3 yrs', sex: 'Male', photo: 'https://new-s3.shelterluv.com/profile-pictures/869f57a4ce3d69d6d2b689a00fa3993f/3bcea9e6a7dc8d0589032b53272191a6.jpg', bio: 'A handsome boy looking for his forever family.' },
      { id: 'ah-alabaster', name: 'Alabaster Snowball', breed: 'Rescue dog', age: '2 yrs', sex: 'Male', photo: 'https://new-s3.shelterluv.com/profile-pictures/073245aea22028521d02f8adc2e3d354/0746a8838689689824ec33a6890b7299.jpg', bio: 'A striking young boy ready for adventures with his new family.' },
      { id: 'ah-timberlake', name: 'Timberlake', breed: 'Young', age: '10 mo', sex: 'Male', photo: 'https://new-s3.shelterluv.com/profile-pictures/289d6892eda70a759825cd5431875e4c/cc87c43dc92316cff29a4baecd3d293f.jpg', bio: 'A bright young pup with lots of love to give.' },
      { id: 'ah-buddy', name: 'Buddy', breed: 'Rescue dog', age: '5 yrs', sex: 'Male', photo: 'https://new-s3.shelterluv.com/profile-pictures/a743871abc28eeb47c19d44eb244e423/f9dcc0ba98f07b144747bee7e109a492.jpg', bio: 'A loyal companion ready to find his person.' },
      { id: 'ah-lottie', name: 'Lottie', breed: 'Rescue dog', age: '9 yrs', sex: 'Female', photo: 'https://new-s3.shelterluv.com/profile-pictures/6b3cd6a7deac2006b1c708ec4ac84444/2d6495acf0c6ad00182dc2529d692204.jpg', bio: 'A lovely girl hoping for a cozy home to call her own.' },
      { id: 'ah-lady', name: 'Lady', breed: 'Rescue dog', age: '5 yrs', sex: 'Female', photo: 'https://new-s3.shelterluv.com/profile-pictures/9aa1299872b307a4f651d76dd7a421f6/a6547a0ab478c4e74990aa6a2a5c43cc.jpg', bio: 'A sweet girl ready for a family of her own.' },
      { id: 'ah-coco', name: 'Coco', breed: 'Puppy', age: '2 mo', sex: 'Female', photo: 'https://new-s3.shelterluv.com/profile-pictures/b48e05664b4adfb30bad779fa522283f/d9cdbc91874170919b27d1f5c79998c4.jpg', bio: 'An adorable puppy looking for a loving start to life.' },
      { id: 'ah-pixel', name: 'Pixel', breed: 'Puppy', age: '3 mo', sex: 'Female', photo: 'https://new-s3.shelterluv.com/profile-pictures/f918a188c064107bef34849bd742771b/0543e55b28c612cb3d298a77be7864d6.jpg', bio: 'A playful puppy ready to fill a home with joy.' },
      { id: 'ah-wiggly-diggly', name: 'Wiggly Diggly', breed: 'Senior', age: '14 yrs', sex: 'Female', photo: 'https://new-s3.shelterluv.com/profile-pictures/9ea04b5122ba2540b9c9e34c73f52b5d/9b1ac0de4ef8ff0a368b649482b61fd2.jpg', bio: 'A gentle senior sweetheart hoping for a soft place to land in her golden years.' },
    ],
  },
];

async function main() {
  const links = [];
  for (const s of SHELTERS) {
    await db.collection('shelters').doc(s.id).set({ ...s, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    // Generate (or rotate) the shelter's private edit token + shareable link.
    const token = randomUUID().replace(/-/g, '');
    await db.collection('shelter_secrets').doc(s.id).set({ token, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    const link = `${BASE}/shelter/${s.id}?t=${token}`;
    links.push({ name: s.name, link });
    console.log(`  · ${s.name} (${s.dogs.length} dogs)`);
  }
  console.log(`\nDone. ${SHELTERS.length} shelters written.\n`);
  console.log('================  EDIT LINKS — give one to each shelter  ================');
  for (const l of links) {
    console.log(`\n${l.name}:\n${l.link}`);
  }
  console.log('\n=========================================================================');
  console.log('Each shelter can edit ONLY their own profile + dogs from their link.');
  console.log('Re-run this script to rotate tokens (old links stop working).');
}

main().catch((err) => { console.error('import_shelters failed:', err); process.exit(1); });
