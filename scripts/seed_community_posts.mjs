// Seed REAL founder welcome + starter posts into the /posts collection using
// the Firebase Admin SDK, authored by hello@silviamogas.com so they are real,
// replyable posts (not client-side samples).
//
//   FIREBASE_ADMIN_PROJECT_ID=...        \
//   FIREBASE_ADMIN_CLIENT_EMAIL=...      \
//   FIREBASE_ADMIN_PRIVATE_KEY="..."     \
//   FIREBASE_DATABASE_ID=ai-studio-041ff40c-7f72-4aad-a12c-bcd060760a1d \
//   node scripts/seed_community_posts.mjs
//
// Optional: FOUNDER_EMAIL (default hello@silviamogas.com) or FOUNDER_UID to
// skip the email lookup. Idempotent: deterministic doc ids are merged, so
// re-running updates the same posts instead of duplicating them.
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const env = (k) => process.env[k] || '';
const projectId = env('FIREBASE_ADMIN_PROJECT_ID');
const clientEmail = env('FIREBASE_ADMIN_CLIENT_EMAIL');
const pemFromEnv = env('FIREBASE_ADMIN_PRIVATE_KEY');
const databaseId = env('FIREBASE_DATABASE_ID');
const founderEmail = env('FOUNDER_EMAIL') || 'hello@silviamogas.com';

if (!projectId || !clientEmail || !pemFromEnv) {
  console.error('Missing FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY');
  process.exit(1);
}

const app = initializeApp({
  credential: cert({ projectId, clientEmail, privateKey: pemFromEnv.replace(/\\n/g, '\n') }),
});
const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

const AUTHOR = { author: 'Silvia Mogás', handle: 'silviamogas', avatar: '', badge: 'Founder' };

// One welcome (Presentations) + one starter per group. Keep in sync with the
// crews in src/data/communityGroups.ts.
const POSTS = [
  { groupId: 'mia-pack', groupName: 'Miami 🌴', city: 'Miami', topic: 'Presentations',
    body: "Hi everyone, I'm Silvia — founder of Hey Lola 🌴\n\nThank you for being here. You're the very first faces of the Miami crew, and it means the world to have you. This is your space to find walking buddies, swap café and beach spots, and meet dog parents nearby.\n\nSo let's start: who are you and who's your dog? Drop a hello below — I'd genuinely love to meet you all. 🐾" },
  { groupId: 'mia-pack', groupName: 'Miami 🌴', city: 'Miami', topic: 'Beaches & parks',
    body: "Kicking this one off — what's your dog's favourite beach or park in Miami? Looking for the most welcoming, shaded, off-leash-friendly spots to share with everyone. 🌴🐶" },

  { groupId: 'nyc-pack', groupName: 'New York 🗽', city: 'NYC', topic: 'Presentations',
    body: "Hi all, I'm Silvia — founder of Hey Lola 🗽\n\nSo happy you're here. This is the New York crew: park loops, neighbourhood meetups and honest life-with-a-dog-in-the-city tips. Thank you for helping us build this from day one.\n\nIntroduce yourself and your pup below — tell us your neighbourhood so we can connect you with people close by. 🐾" },
  { groupId: 'nyc-pack', groupName: 'New York 🗽', city: 'NYC', topic: 'Parks & runs',
    body: "To get us going — which park or run does your dog love most in the city? Drop your go-to spot and the best time to catch other dogs there. 🗽🐶" },

  { groupId: 'tor-pack', groupName: 'Toronto 🍁', city: 'Toronto', topic: 'Presentations',
    body: "Hi everyone, I'm Silvia — founder of Hey Lola 🍁\n\nWelcome to the Toronto crew. Thank you for being one of the first here. This is the place for ravine walks, patio meetups, off-leash parks and winter-ready tips for life with a dog.\n\nSay hello below — who are you and who's your dog? Can't wait to meet you all. 🐾" },
  { groupId: 'tor-pack', groupName: 'Toronto 🍁', city: 'Toronto', topic: 'Parks & ravines',
    body: "Starting this one off — favourite ravine or off-leash park in Toronto? Bonus points for spots that are great year-round. 🍁🐶" },

  { groupId: 'dc-pack', groupName: 'Washington DC 🏛️', city: 'Washington DC', topic: 'Presentations',
    body: "Hi all, I'm Silvia — founder of Hey Lola 🏛️\n\nWelcome to the Washington DC crew, and thank you for being here from the start. This is your space for mall strolls, neighbourhood meetups, dog-friendly patios and local tips.\n\nIntroduce yourself and your dog below — tell us your neighbourhood so we can connect you with nearby parents. 🐾" },
  { groupId: 'dc-pack', groupName: 'Washington DC 🏛️', city: 'Washington DC', topic: 'Parks & trails',
    body: "Let's kick this off — best park or trail for dogs in DC? Share your favourite and we'll build a map together. 🏛️🐶" },

  { groupId: 'bcn-pack', groupName: 'Barcelona 🌊', city: 'Barcelona', topic: 'Presentations',
    body: "¡Hola! Soy Silvia, fundadora de Hey Lola 🌊\n\nGracias por estar aquí — sois las primeras caras del crew de Barcelona. Este es vuestro espacio para playas, quedadas en la plaça, terrazas dog-friendly y consejos para la vida con perro.\n\nPresentaos abajo: ¿quién sois y quién es vuestro perro? Me encantará conoceros a todos. 🐾" },
  { groupId: 'bcn-pack', groupName: 'Barcelona 🌊', city: 'Barcelona', topic: 'Playas & parques',
    body: "Empiezo yo — ¿cuál es la playa o el parque favorito de tu perro en Barcelona? Buscamos los sitios más dog-friendly para compartir con todos. 🌊🐶" },

  { groupId: 'founders-circle', groupName: "Founders' Circle ✨", city: 'Global', topic: 'Presentations',
    body: "Welcome to the Founders' Circle ✨\n\nI'm Silvia, founder of Hey Lola — and I want to start by saying thank you. You believed in this early, and that's exactly why you're here. This is our inner room: where we shape the roadmap together, unlock exclusive perks, and meet the people building Hey Lola alongside us.\n\nTell us a little about you and your dog below — and don't hold back on ideas. This is yours as much as mine. 🐾" },
  { groupId: 'founders-circle', groupName: "Founders' Circle ✨", city: 'Global', topic: 'Roadmap & feedback',
    body: "Kicking off the roadmap thread: if you could change or add ONE thing in Hey Lola right now, what would it be? Everything you drop here goes straight onto my desk. ✨" },
];

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function resolveFounderUid() {
  if (env('FOUNDER_UID')) return env('FOUNDER_UID');
  try {
    const u = await getAuth(app).getUserByEmail(founderEmail);
    return u.uid;
  } catch (err) {
    console.error(`Could not find a user for ${founderEmail}. Set FOUNDER_UID env var, or sign in once with that email first.`);
    throw err;
  }
}

async function main() {
  const uid = await resolveFounderUid();
  console.log(`Authoring posts as ${founderEmail} (uid ${uid})`);
  let n = 0;
  for (const p of POSTS) {
    const id = `founder_${p.groupId}_${slug(p.topic)}`;
    await db.collection('posts').doc(id).set({
      userId: uid,
      author: AUTHOR.author,
      handle: AUTHOR.handle,
      avatar: AUTHOR.avatar,
      badge: AUTHOR.badge,
      body: p.body,
      city: p.city,
      topic: p.topic,
      groupId: p.groupId,
      groupName: p.groupName,
      likes: 0,
      replies: 0,
      createdAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    n += 1;
    console.log(`  · ${p.groupId} / ${p.topic}`);
  }
  console.log(`Done. ${n} founder posts written.`);
}

main().catch((err) => { console.error('seed_community_posts failed:', err); process.exit(1); });
