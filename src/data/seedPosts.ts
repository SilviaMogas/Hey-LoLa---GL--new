import type { FeedPost } from '../components/Community';

/**
 * Founder + Concierge welcome/starter posts shown pinned at the top of each
 * group room, organised by topic (Reddit-style). These render client-side so
 * they appear with a normal deploy — no admin script needed. Members add
 * their own real posts beneath them via the composer.
 *
 * (The admin script scripts/seed_community_posts.mjs can also write these as
 * REAL, replyable Firestore posts authored by hello@silviamogas.com — run it
 * when you want them to be replyable. Until then, these client posts show.)
 */
const FOUNDER = { author: 'Silvia Mogás', handle: 'silviamogas', avatar: '', badge: 'Founder' };
const CONCIERGE = { author: 'Hey Lola', handle: 'heylola', avatar: '/HeyLola.Lola.1.png', badge: 'Concierge' };

interface GroupSeed {
  welcome: string;
  starters: Record<string, string>;
  concierge: { topic: string; body: string };
}

const GROUPS: Record<string, GroupSeed> = {
  'mia-pack': {
    welcome: "Hi everyone!! I'm Silvia, the founder of Hey Lola 🌴🐶\n\nI'm SO happy you're here! You are the very first Miami crew and that means the world to me. This is your spot to find walking buddies, share the best café and beach mornings, and meet dog parents nearby.\n\nSo let's go: who are you and who is your gorgeous dog?? Drop a hello below, I can't wait to meet you all!! 🐾✨",
    starters: {
      'Beaches & parks': "Okay, spill the secrets!! 🌴 What is your dog's favourite beach or park in Miami? Tag your go-to spot so we can all meet there! 🐶",
      'Cafés & brunch': "Brunch crew, assemble!! 🥐 Which Miami cafés truly love dogs (treats and water bowls = extra points)? Share your faves! ☕🐾",
    },
    concierge: { topic: 'Vets & grooming', body: "Hey Lola here!! 🐾 Quick tip: save your vet's number right in your dog's passport so it's one tap away when you need it. Want me to suggest trusted vets near you? Just ask! 💛" },
  },
  'nyc-pack': {
    welcome: "Hi all!! I'm Silvia, the founder of Hey Lola 🗽🐶\n\nI'm thrilled you're here! This is the New York crew: park loops, neighbourhood meetups and the most honest life-with-a-dog-in-the-city tips. Thank you for building this with me from day one!\n\nIntroduce yourself and your pup below and tell us your neighbourhood so we can connect you with people close by!! 🐾✨",
    starters: {
      'Parks & runs': "Let's get moving!! 🗽 Which park or run does your dog love most in the city? Share your go-to and the best time to catch other dogs there! 🐶",
    },
    concierge: { topic: 'Apartment life', body: "Hey Lola here!! 🏙️ City hack: keep a chew toy by the door so elevator waits turn into calm time. Need building-friendly gear ideas? I'm on it! 🐾" },
  },
  'tor-pack': {
    welcome: "Hi everyone!! I'm Silvia, the founder of Hey Lola 🍁🐶\n\nWelcome to the Toronto crew and YAY you're one of the first here! This is the place for ravine walks, patio meetups, off-leash parks and winter-ready tips for life with a dog.\n\nSay hello below: who are you and who is your dog? I can't wait to meet you all!! 🐾✨",
    starters: {
      'Parks & ravines': "Let's map the best spots!! 🍁 Favourite ravine or off-leash park in Toronto? Extra love for places that shine all year round! 🐶",
    },
    concierge: { topic: 'Winter tips', body: "Hey Lola here!! ❄️ Paw care 101: wipe paws after salty sidewalks and try a balm before walks. Want a full winter checklist? Say the word! 🐾" },
  },
  'dc-pack': {
    welcome: "Hi all!! I'm Silvia, the founder of Hey Lola 🏛️🐶\n\nWelcome to the Washington DC crew, and thank you for being here from the very start!! This is your space for mall strolls, neighbourhood meetups, dog-friendly patios and local tips.\n\nIntroduce yourself and your dog below and tell us your neighbourhood so we can connect you with parents nearby!! 🐾✨",
    starters: {
      'Parks & trails': "Let's build the map together!! 🏛️ Best park or trail for dogs in DC? Share your favourite spot! 🐶",
    },
    concierge: { topic: 'Cafés & patios', body: "Hey Lola here!! ☕ Which DC cafés and patios truly welcome dogs? Treats and water bowls earn bonus points. Share your faves and I'll keep the list! 🐾" },
  },
  'bcn-pack': {
    welcome: "¡¡Hola a todos!! Soy Silvia, la fundadora de Hey Lola 🌊🐶\n\n¡Qué ilusión teneros aquí! Sois el primer crew de Barcelona y eso para mí lo es todo. Este es vuestro espacio para playas, quedadas en la plaça, terrazas dog-friendly y consejos para la vida con perro.\n\nPresentaos abajo: ¿quién sois y quién es vuestro perro?? ¡¡Me muero de ganas de conoceros!! 🐾✨",
    starters: {
      'Playas & parques': "¡¡A compartir secretos!! 🌊 ¿Cuál es la playa o el parque favorito de tu perro en Barcelona? ¡Etiqueta tu sitio para quedar todos! 🐶",
    },
    concierge: { topic: 'Terrazas dog-friendly', body: "¡¡Hola, soy Hey Lola!! ☕ ¿Qué terrazas de Barcelona reciben de verdad bien a los perros (agua y chuches = puntazo)? ¡Comparte y monto la lista! 🐾" },
  },
  'founders-circle': {
    welcome: "Welcome to the Founders' Circle!! ✨🐶\n\nI'm Silvia, the founder of Hey Lola, and I want to start with a huge THANK YOU. You believed in this early and that's exactly why you're here. This is our inner room: where we shape the roadmap together, unlock exclusive perks, and meet the people building Hey Lola alongside us.\n\nTell us a little about you and your dog below, and please don't hold back on ideas. This is yours as much as mine!! 🐾✨",
    starters: {
      'Roadmap & feedback': "Let's shape Hey Lola together!! 🚀 If you could add or change ONE thing right now, what would it be? Everything here goes straight onto my desk! ✨",
    },
    concierge: { topic: 'Exclusive perks', body: "Hey Lola here!! 🎁 Your Founding Member perks grow as we do. Tell us what would make membership unforgettable and I'll take it straight to the team! 💛" },
  },
};

/** Build display-ready pinned posts for a group (founder welcome + starters + concierge tip). */
export function seedPostsFor(groupId: string): FeedPost[] {
  const g = GROUPS[groupId];
  if (!g) return [];
  const out: FeedPost[] = [];
  const mk = (idSuffix: string, who: typeof FOUNDER, topic: string, body: string): FeedPost => ({
    id: `silvia-${groupId}-${idSuffix}`,
    author: who.author, handle: who.handle, avatar: who.avatar, badge: who.badge,
    body, topic, likes: 0, replies: 0, timeAgo: 'pinned',
  });
  out.push(mk('welcome', FOUNDER, 'Presentations', g.welcome));
  Object.entries(g.starters).forEach(([topic, body], i) => out.push(mk(`starter-${i}`, FOUNDER, topic, body)));
  out.push(mk('concierge', CONCIERGE, g.concierge.topic, g.concierge.body));
  return out;
}
