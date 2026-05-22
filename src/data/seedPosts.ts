import type { FeedPost } from '../components/Community';

/**
 * Founder + Concierge welcome/starter posts shown pinned at the top of each
 * group room, organised by topic (Reddit-style). These render client-side so
 * they appear with a normal deploy, no admin script needed. Every topic gets
 * its own pinned starter so no room ever feels empty. Members add their own
 * real posts beneath them via the composer.
 *
 * IMPORTANT: the bodies here are kept BYTE-IDENTICAL to
 * scripts/seed_community_posts.mjs. The room hides a client seed when a real
 * Firestore post has the same body, so if Silvia runs that script the real,
 * replyable posts cleanly REPLACE these client seeds with zero duplicates.
 *
 * Style rules: super enthusiastic, no em-dashes anywhere.
 */
const FOUNDER = { author: 'Silvia Mogás', handle: 'silviamogas', avatar: '', badge: 'Founder' as const };
const CONCIERGE = { author: 'Hey Lola', handle: 'heylola', avatar: '/HeyLola.Lola.1.png', badge: 'Concierge' as const };

interface GroupSeed {
  /** Pinned welcome post, filed under the "Presentations" topic. */
  welcome: string;
  /** Founder starter for every other topic in the group. */
  starters: Record<string, string>;
  /** Optional concierge tips, keyed by topic (can share a topic with a starter). */
  concierge?: Record<string, string>;
}

const GROUPS: Record<string, GroupSeed> = {
  'mia-pack': {
    welcome: "Hi everyone!! I'm Silvia, the founder of Hey Lola 🌴🐶\n\nI'm SO happy you're here! You are the very first Miami crew and honestly that means the world to me. This is your spot to find walking buddies, share the best café and beach mornings, and meet dog parents right around the corner.\n\nSo let's go: who are you and who is your gorgeous dog?? Drop a hello below, I can't wait to meet you all!! 🐾✨",
    starters: {
      'Beaches & parks': "Okay, spill the secrets!! 🌴 What is your dog's favourite beach or park in Miami? Tag your go-to spot so we can all meet there! 🐶",
      'Cafés & brunch': "Brunch crew, assemble!! 🥐 Which Miami cafés truly love dogs (treats and water bowls = extra points)? Share your faves! ☕🐾",
      'Vets & grooming': "Let's build our little black book!! 🩺 Who is your trusted vet or groomer in Miami? Your recommendation could really help someone here! ✂️",
      'Playdates': "Who is up for a playdate?? 🎾 Drop your neighbourhood and your dog's energy level and let's make it happen! 🐕💛",
      'Travel tips': "Jet setting pups, this way!! ✈️ Share your best tips for travelling in and out of Miami with a dog! 🌴",
    },
    concierge: {
      'Vets & grooming': "Hey Lola here!! 🐾 Quick tip: save your vet's number right in your dog's passport so it's one tap away when you need it. Want me to suggest trusted vets near you? Just ask! 💛",
    },
  },
  'nyc-pack': {
    welcome: "Hi all!! I'm Silvia, the founder of Hey Lola 🗽🐶\n\nI'm thrilled you're here! This is the New York crew: park loops, neighbourhood meetups and the most honest life-with-a-dog-in-the-city tips. Thank you for building this with me from day one, it means everything!\n\nIntroduce yourself and your pup below and tell us your neighbourhood so we can connect you with people close by!! 🐾✨",
    starters: {
      'Parks & runs': "Let's get moving!! 🗽 Which park or run does your dog love most in the city? Share your go-to and the best time to catch other dogs there! 🐶",
      'Neighbourhood meetups': "Who's nearby?? 📍 Drop your neighbourhood and let's organise the first meetup. The more the merrier!! 🎉",
      'Vets & grooming': "Building our trusted list!! 🩺 Who is your favourite vet or groomer in NYC? Recommendations very welcome! ✂️",
      'Playdates': "Playdate time!! 🎾 Tell us your dog's energy level and neighbourhood and let's set something up! 🐕💛",
      'Apartment life': "City dogs unite!! 🏙️ Share your best apartment-living hacks: elevators, potty routines, quiet-hour wins, all of it! 🐾",
    },
    concierge: {
      'Apartment life': "Hey Lola here!! 🏙️ City hack: keep a chew toy by the door so elevator waits turn into calm time. Need building-friendly gear ideas? I'm on it! 🐾",
    },
  },
  'tor-pack': {
    welcome: "Hi everyone!! I'm Silvia, the founder of Hey Lola 🍁🐶\n\nWelcome to the Toronto crew and YAY you're one of the first here! This is the place for ravine walks, patio meetups, off-leash parks and winter-ready tips for life with a dog.\n\nSay hello below: who are you and who is your dog? I genuinely can't wait to meet you all!! 🐾✨",
    starters: {
      'Parks & ravines': "Let's map the best spots!! 🍁 Favourite ravine or off-leash park in Toronto? Extra love for places that shine all year round! 🐶",
      'Patios & cafés': "Patio season, let's go!! ☕ Which Toronto patios and cafés roll out the welcome mat for dogs? Share your faves! 🐾",
      'Vets & grooming': "Trusted list time!! 🩺 Who is your go-to vet or groomer in Toronto? Your tip could really help a fellow parent! ✂️",
      'Playdates': "Who wants a playdate?? 🎾 Drop your neighbourhood and your pup's vibe and let's make friends! 🐕💛",
      'Winter tips': "Brrr, bring it on!! ❄️ Share your best winter tips: booties, paw balm, salt-free routes, all the cozy wisdom! 🐾",
    },
    concierge: {
      'Winter tips': "Hey Lola here!! ❄️ Paw care 101: wipe paws after salty sidewalks and try a balm before walks. Want a full winter checklist? Say the word! 🐾",
    },
  },
  'dc-pack': {
    welcome: "Hi all!! I'm Silvia, the founder of Hey Lola 🏛️🐶\n\nWelcome to the Washington DC crew and thank you for being here from the very start, it means so much!! This is your space for mall strolls, neighbourhood meetups, dog-friendly patios and local tips.\n\nIntroduce yourself and your dog below and tell us your neighbourhood so we can connect you with parents nearby!! 🐾✨",
    starters: {
      'Parks & trails': "Let's build the map together!! 🏛️ Best park or trail for dogs in DC? Share your favourite spot! 🐶",
      'Cafés & patios': "Patio crew assemble!! ☕ Which DC cafés and patios truly welcome dogs? Treats and water bowls earn bonus points! 🐾",
      'Vets & grooming': "Trusted recommendations, please!! 🩺 Who is your favourite vet or groomer in DC? ✂️",
      'Playdates': "Playdate o'clock!! 🎾 Drop your neighbourhood and your dog's energy and let's set one up! 🐕💛",
      'Neighbourhoods': "Where's everyone at?? 📍 Tell us your DC neighbourhood and the best dog-friendly things about it! 🏙️🐾",
    },
    concierge: {
      'Parks & trails': "Hey Lola here!! 🏛️ Trail day coming up? Pack water, a collapsible bowl and poop bags. Want my favourite DC dog trails? Ask away! 🐾",
    },
  },
  'bcn-pack': {
    welcome: "¡¡Hola a todos!! Soy Silvia, la fundadora de Hey Lola 🌊🐶\n\n¡Qué ilusión teneros aquí! Sois el primer crew de Barcelona y eso para mí lo es todo. Este es vuestro espacio para playas, quedadas en la plaça, terrazas dog-friendly y consejos para la vida con perro.\n\nPresentaos abajo: ¿quién sois y quién es vuestro perro?? ¡¡Me muero de ganas de conoceros a todos!! 🐾✨",
    starters: {
      'Playas & parques': "¡¡A compartir secretos!! 🌊 ¿Cuál es la playa o el parque favorito de tu perro en Barcelona? ¡Etiqueta tu sitio para quedar todos! 🐶",
      'Terrazas dog-friendly': "¡¡Equipo terraceo!! ☕ ¿Qué terrazas de Barcelona reciben de verdad bien a los perros (agua y chuches = puntazo)? ¡Comparte! 🐾",
      'Veterinarios': "¡¡Montamos la lista de confianza!! 🩺 ¿Cuál es tu veterinario o peluquero de confianza en Barcelona? ✂️",
      'Quedadas': "¡¡Quedada a la vista!! 🎾 Di tu barrio y la energía de tu perro y montamos algo. ¡Cuantos más, mejor! 🐕💛",
      'Viajar con perro': "¡¡Perros viajeros por aquí!! ✈️ Comparte tus mejores trucos para entrar y salir de Barcelona con perro 🌊🐾",
    },
    concierge: {
      'Viajar con perro': "¡Hola, soy Hey Lola!! ✈️ Consejo: lleva siempre la cartilla y el chip al día para viajar sin sustos. ¿Quieres una checklist de viaje? ¡Pídemela! 🐾",
    },
  },
  'founders-circle': {
    welcome: "Welcome to the Founders' Circle!! ✨🐶\n\nI'm Silvia, the founder of Hey Lola, and I want to start with a huge THANK YOU. You believed in this early and that is exactly why you're here. This is our inner room: where we shape the roadmap together, unlock exclusive perks, and meet the people building Hey Lola alongside us.\n\nTell us a little about you and your dog below, and please don't hold back on ideas. This is yours as much as mine!! 🐾✨",
    starters: {
      'Roadmap & feedback': "Let's shape Hey Lola together!! 🚀 If you could add or change ONE thing right now, what would it be? Everything here goes straight onto my desk! ✨",
      'Exclusive perks': "Perks corner!! 🎁 Tell me what would make membership feel truly special to you, I'm listening and building! 💛",
      'Founder events': "Let's celebrate together!! 🥂 What kind of founder meetups or events would you love, online or in person? 🐾",
    },
    concierge: {
      'Exclusive perks': "Hey Lola here!! 🎁 Your Founding Member perks grow as we do. Tell us what would make membership unforgettable and I'll take it straight to the team! 💛",
    },
  },
};

/** Build display-ready pinned posts for a group (founder welcome + one starter per topic + concierge tips). */
export function seedPostsFor(groupId: string): FeedPost[] {
  const g = GROUPS[groupId];
  if (!g) return [];
  const out: FeedPost[] = [];
  const mk = (idSuffix: string, who: typeof FOUNDER | typeof CONCIERGE, topic: string, body: string): FeedPost => ({
    id: `silvia-${groupId}-${idSuffix}`,
    author: who.author, handle: who.handle, avatar: who.avatar, badge: who.badge,
    body, topic, likes: 0, replies: 0, timeAgo: 'pinned',
  });
  out.push(mk('welcome', FOUNDER, 'Presentations', g.welcome));
  Object.entries(g.starters).forEach(([topic, body], i) => out.push(mk(`starter-${i}`, FOUNDER, topic, body)));
  if (g.concierge) {
    Object.entries(g.concierge).forEach(([topic, body], i) => out.push(mk(`concierge-${i}`, CONCIERGE, topic, body)));
  }
  return out;
}
