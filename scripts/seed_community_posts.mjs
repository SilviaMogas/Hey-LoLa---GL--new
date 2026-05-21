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

// Welcome (Presentations) + an enthusiastic starter for EVERY topic, so each
// group is organised by theme and every topic has a message to reply to.
// Keep in sync with the crews in src/data/communityGroups.ts.
// Tone: warm, enthusiastic, NO long dashes.
const GROUPS = [
  {
    groupId: 'mia-pack', groupName: 'Miami 🌴', city: 'Miami',
    welcome: "Hi everyone!! I'm Silvia, the founder of Hey Lola 🌴🐶\n\nI'm SO happy you're here! You are the very first Miami crew and honestly that means the world to me. This is your spot to find walking buddies, share the best café and beach mornings, and meet dog parents right around the corner.\n\nSo let's go: who are you and who is your gorgeous dog?? Drop a hello below, I can't wait to meet you all!! 🐾✨",
    starters: {
      'Beaches & parks': "Okay, spill the secrets!! 🌴 What is your dog's favourite beach or park in Miami? Tag your go-to spot so we can all meet there! 🐶",
      'Cafés & brunch': "Brunch crew, assemble!! 🥐 Which Miami cafés truly love dogs (treats and water bowls = extra points)? Share your faves! ☕🐾",
      'Vets & grooming': "Let's build our little black book!! 🩺 Who is your trusted vet or groomer in Miami? Your recommendation could really help someone here! ✂️",
      'Playdates': "Who is up for a playdate?? 🎾 Drop your neighbourhood and your dog's energy level and let's make it happen! 🐕💛",
      'Travel tips': "Jet setting pups, this way!! ✈️ Share your best tips for travelling in and out of Miami with a dog! 🌴",
    },
  },
  {
    groupId: 'nyc-pack', groupName: 'New York 🗽', city: 'NYC',
    welcome: "Hi all!! I'm Silvia, the founder of Hey Lola 🗽🐶\n\nI'm thrilled you're here! This is the New York crew: park loops, neighbourhood meetups and the most honest life-with-a-dog-in-the-city tips. Thank you for building this with me from day one, it means everything!\n\nIntroduce yourself and your pup below and tell us your neighbourhood so we can connect you with people close by!! 🐾✨",
    starters: {
      'Parks & runs': "Let's get moving!! 🗽 Which park or run does your dog love most in the city? Share your go-to and the best time to catch other dogs there! 🐶",
      'Neighbourhood meetups': "Who's nearby?? 📍 Drop your neighbourhood and let's organise the first meetup. The more the merrier!! 🎉",
      'Vets & grooming': "Building our trusted list!! 🩺 Who is your favourite vet or groomer in NYC? Recommendations very welcome! ✂️",
      'Playdates': "Playdate time!! 🎾 Tell us your dog's energy level and neighbourhood and let's set something up! 🐕💛",
      'Apartment life': "City dogs unite!! 🏙️ Share your best apartment-living hacks: elevators, potty routines, quiet-hour wins, all of it! 🐾",
    },
  },
  {
    groupId: 'tor-pack', groupName: 'Toronto 🍁', city: 'Toronto',
    welcome: "Hi everyone!! I'm Silvia, the founder of Hey Lola 🍁🐶\n\nWelcome to the Toronto crew and YAY you're one of the first here! This is the place for ravine walks, patio meetups, off-leash parks and winter-ready tips for life with a dog.\n\nSay hello below: who are you and who is your dog? I genuinely can't wait to meet you all!! 🐾✨",
    starters: {
      'Parks & ravines': "Let's map the best spots!! 🍁 Favourite ravine or off-leash park in Toronto? Extra love for places that shine all year round! 🐶",
      'Patios & cafés': "Patio season, let's go!! ☕ Which Toronto patios and cafés roll out the welcome mat for dogs? Share your faves! 🐾",
      'Vets & grooming': "Trusted list time!! 🩺 Who is your go-to vet or groomer in Toronto? Your tip could really help a fellow parent! ✂️",
      'Playdates': "Who wants a playdate?? 🎾 Drop your neighbourhood and your pup's vibe and let's make friends! 🐕💛",
      'Winter tips': "Brrr, bring it on!! ❄️ Share your best winter tips: booties, paw balm, salt-free routes, all the cozy wisdom! 🐾",
    },
  },
  {
    groupId: 'dc-pack', groupName: 'Washington DC 🏛️', city: 'Washington DC',
    welcome: "Hi all!! I'm Silvia, the founder of Hey Lola 🏛️🐶\n\nWelcome to the Washington DC crew and thank you for being here from the very start, it means so much!! This is your space for mall strolls, neighbourhood meetups, dog-friendly patios and local tips.\n\nIntroduce yourself and your dog below and tell us your neighbourhood so we can connect you with parents nearby!! 🐾✨",
    starters: {
      'Parks & trails': "Let's build the map together!! 🏛️ Best park or trail for dogs in DC? Share your favourite spot! 🐶",
      'Cafés & patios': "Patio crew assemble!! ☕ Which DC cafés and patios truly welcome dogs? Treats and water bowls earn bonus points! 🐾",
      'Vets & grooming': "Trusted recommendations, please!! 🩺 Who is your favourite vet or groomer in DC? ✂️",
      'Playdates': "Playdate o'clock!! 🎾 Drop your neighbourhood and your dog's energy and let's set one up! 🐕💛",
      'Neighbourhoods': "Where's everyone at?? 📍 Tell us your DC neighbourhood and the best dog-friendly things about it! 🏙️🐾",
    },
  },
  {
    groupId: 'bcn-pack', groupName: 'Barcelona 🌊', city: 'Barcelona',
    welcome: "¡¡Hola a todos!! Soy Silvia, la fundadora de Hey Lola 🌊🐶\n\n¡Qué ilusión teneros aquí! Sois el primer crew de Barcelona y eso para mí lo es todo. Este es vuestro espacio para playas, quedadas en la plaça, terrazas dog-friendly y consejos para la vida con perro.\n\nPresentaos abajo: ¿quién sois y quién es vuestro perro?? ¡¡Me muero de ganas de conoceros a todos!! 🐾✨",
    starters: {
      'Playas & parques': "¡¡A compartir secretos!! 🌊 ¿Cuál es la playa o el parque favorito de tu perro en Barcelona? ¡Etiqueta tu sitio para quedar todos! 🐶",
      'Terrazas dog-friendly': "¡¡Equipo terraceo!! ☕ ¿Qué terrazas de Barcelona reciben de verdad bien a los perros (agua y chuches = puntazo)? ¡Comparte! 🐾",
      'Veterinarios': "¡¡Montamos la lista de confianza!! 🩺 ¿Cuál es tu veterinario o peluquero de confianza en Barcelona? ✂️",
      'Quedadas': "¡¡Quedada a la vista!! 🎾 Di tu barrio y la energía de tu perro y montamos algo. ¡Cuantos más, mejor! 🐕💛",
      'Viajar con perro': "¡¡Perros viajeros por aquí!! ✈️ Comparte tus mejores trucos para entrar y salir de Barcelona con perro 🌊🐾",
    },
  },
  {
    groupId: 'founders-circle', groupName: "Founders' Circle ✨", city: 'Global',
    welcome: "Welcome to the Founders' Circle!! ✨🐶\n\nI'm Silvia, the founder of Hey Lola, and I want to start with a huge THANK YOU. You believed in this early and that is exactly why you're here. This is our inner room: where we shape the roadmap together, unlock exclusive perks, and meet the people building Hey Lola alongside us.\n\nTell us a little about you and your dog below, and please don't hold back on ideas. This is yours as much as mine!! 🐾✨",
    starters: {
      'Roadmap & feedback': "Let's shape Hey Lola together!! 🚀 If you could add or change ONE thing right now, what would it be? Everything here goes straight onto my desk! ✨",
      'Exclusive perks': "Perks corner!! 🎁 Tell me what would make membership feel truly special to you, I'm listening and building! 💛",
      'Founder events': "Let's celebrate together!! 🥂 What kind of founder meetups or events would you love, online or in person? 🐾",
    },
  },
];

const FOUNDER_POSTS = GROUPS.flatMap((g) => [
  { as: 'founder', groupId: g.groupId, groupName: g.groupName, city: g.city, topic: 'Presentations', body: g.welcome },
  ...Object.entries(g.starters).map(([topic, body]) => ({ as: 'founder', groupId: g.groupId, groupName: g.groupName, city: g.city, topic, body })),
]);

// Hey Lola — the concierge voice. Helpful, warm, brand assistant. Posts
// alongside the founder. Avatar is the Lola mascot served from /public.
const CONCIERGE = { author: 'Hey Lola', handle: 'heylola', avatar: '/HeyLola.Lola.1.png', badge: 'Concierge' };

const CONCIERGE_POSTS = [
  { as: 'concierge', groupId: 'mia-pack', groupName: 'Miami 🌴', city: 'Miami', topic: 'Vets & grooming',
    body: "Hey Lola here!! 🐾 Quick tip: save your vet's number right in your dog's passport so it's one tap away when you need it. Want me to suggest trusted vets near you? Just ask! 💛" },
  { as: 'concierge', groupId: 'nyc-pack', groupName: 'New York 🗽', city: 'NYC', topic: 'Apartment life',
    body: "Hey Lola here!! 🏙️ City hack: keep a chew toy by the door so elevator waits turn into calm time. Need building-friendly gear ideas? I'm on it! 🐾" },
  { as: 'concierge', groupId: 'tor-pack', groupName: 'Toronto 🍁', city: 'Toronto', topic: 'Winter tips',
    body: "Hey Lola here!! ❄️ Paw care 101: wipe paws after salty sidewalks and try a balm before walks. Want a full winter checklist? Say the word! 🐾" },
  { as: 'concierge', groupId: 'dc-pack', groupName: 'Washington DC 🏛️', city: 'Washington DC', topic: 'Parks & trails',
    body: "Hey Lola here!! 🏛️ Trail day coming up? Pack water, a collapsible bowl and poop bags. Want my favourite DC dog trails? Ask away! 🐾" },
  { as: 'concierge', groupId: 'bcn-pack', groupName: 'Barcelona 🌊', city: 'Barcelona', topic: 'Viajar con perro',
    body: "¡Hola, soy Hey Lola!! ✈️ Consejo: lleva siempre la cartilla y el chip al día para viajar sin sustos. ¿Quieres una checklist de viaje? ¡Pídemela! 🐾" },
  { as: 'concierge', groupId: 'founders-circle', groupName: "Founders' Circle ✨", city: 'Global', topic: 'Exclusive perks',
    body: "Hey Lola here!! 🎁 Your Founding Member perks grow as we do. Tell us what would make membership unforgettable and I'll take it straight to the team! 💛" },
];

const POSTS = [...FOUNDER_POSTS, ...CONCIERGE_POSTS];

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
  // Pull the founder's real photo + name from their profile so posts show
  // her face, not the "S" monogram. FOUNDER_PHOTO env overrides if set.
  let avatar = env('FOUNDER_PHOTO') || '';
  let author = AUTHOR.author;
  let handle = AUTHOR.handle;
  try {
    const snap = await db.collection('users').doc(uid).get();
    if (snap.exists) {
      const u = snap.data() || {};
      if (!avatar && u.photoURL) avatar = u.photoURL;
      if (u.displayName) author = u.displayName;
      if (u.username) handle = u.username;
    }
  } catch { /* best effort */ }
  console.log(`Founder posts as ${author} (@${handle}, uid ${uid})${avatar ? ' with profile photo' : ' (no photo found, using monogram)'}`);
  console.log(`Concierge posts as ${CONCIERGE.author} (@${CONCIERGE.handle})`);
  let n = 0;
  for (const p of POSTS) {
    const isConcierge = p.as === 'concierge';
    const id = `${isConcierge ? 'concierge' : 'founder'}_${p.groupId}_${slug(p.topic)}`;
    await db.collection('posts').doc(id).set({
      userId: uid, // owned by the admin account; display fields below set the voice
      author: isConcierge ? CONCIERGE.author : author,
      handle: isConcierge ? CONCIERGE.handle : handle,
      avatar: isConcierge ? CONCIERGE.avatar : avatar,
      badge: isConcierge ? CONCIERGE.badge : AUTHOR.badge,
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
    console.log(`  · ${isConcierge ? '[concierge]' : '[founder]'} ${p.groupId} / ${p.topic}`);
  }
  console.log(`Done. ${n} posts written (founder + concierge).`);
}

main().catch((err) => { console.error('seed_community_posts failed:', err); process.exit(1); });
