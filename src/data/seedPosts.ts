import type { FeedPost } from '../components/Community';

/**
 * Founder welcome + starter posts, shown pinned at the top of each group
 * room (grouped by topic, Reddit-style). These are SEED posts — their ids
 * start with "silvia-" so the feed treats them as non-editable samples
 * (see FeedItem.isRealPost). They render as authored by the founder
 * (@silviamogas / hello@silviamogas.com) with a Founder badge.
 *
 * Members add their own real posts beneath these via the composer.
 */
export const FOUNDER_AUTHOR = {
  author: 'Silvia Mogás',
  handle: 'silviamogas',
  avatar: '', // empty → renders the "S" monogram in the feed
  badge: 'Founder',
};

/** A lighter shape than FeedPost — the room fills in the author fields. */
export interface SeedPost {
  id: string;
  topic: string;
  body: string;
}

export const SEED_POSTS: Record<string, SeedPost[]> = {
  'mia-pack': [
    {
      id: 'silvia-mia-pres',
      topic: 'Presentations',
      body: "Hi everyone, I'm Silvia — founder of Hey Lola 🌴\n\nThank you for being here. You're the very first faces of the Miami crew, and it means the world to have you. This is your space to find walking buddies, swap café and beach spots, and meet dog parents nearby.\n\nSo let's start: who are you and who's your dog? Drop a hello below — I'd genuinely love to meet you all. 🐾",
    },
    {
      id: 'silvia-mia-starter',
      topic: 'Beaches & parks',
      body: "Kicking this one off — what's your dog's favourite beach or park in Miami? Looking for the most welcoming, shaded, off-leash-friendly spots to share with everyone. 🌴🐶",
    },
  ],
  'nyc-pack': [
    {
      id: 'silvia-nyc-pres',
      topic: 'Presentations',
      body: "Hi all, I'm Silvia — founder of Hey Lola 🗽\n\nSo happy you're here. This is the New York crew: park loops, neighbourhood meetups and honest life-with-a-dog-in-the-city tips. Thank you for helping us build this from day one.\n\nIntroduce yourself and your pup below — tell us your neighbourhood so we can connect you with people close by. 🐾",
    },
    {
      id: 'silvia-nyc-starter',
      topic: 'Parks & runs',
      body: "To get us going — which park or run does your dog love most in the city? Drop your go-to spot and the best time to catch other dogs there. 🗽🐶",
    },
  ],
  'tor-pack': [
    {
      id: 'silvia-tor-pres',
      topic: 'Presentations',
      body: "Hi everyone, I'm Silvia — founder of Hey Lola 🍁\n\nWelcome to the Toronto crew. Thank you for being one of the first here. This is the place for ravine walks, patio meetups, off-leash parks and winter-ready tips for life with a dog.\n\nSay hello below — who are you and who's your dog? Can't wait to meet you all. 🐾",
    },
    {
      id: 'silvia-tor-starter',
      topic: 'Parks & ravines',
      body: "Starting this one off — favourite ravine or off-leash park in Toronto? Bonus points for spots that are great year-round. 🍁🐶",
    },
  ],
  'dc-pack': [
    {
      id: 'silvia-dc-pres',
      topic: 'Presentations',
      body: "Hi all, I'm Silvia — founder of Hey Lola 🏛️\n\nWelcome to the Washington DC crew, and thank you for being here from the start. This is your space for mall strolls, neighbourhood meetups, dog-friendly patios and local tips.\n\nIntroduce yourself and your dog below — tell us your neighbourhood so we can connect you with nearby parents. 🐾",
    },
    {
      id: 'silvia-dc-starter',
      topic: 'Parks & trails',
      body: "Let's kick this off — best park or trail for dogs in DC? Share your favourite and we'll build a map together. 🏛️🐶",
    },
  ],
  'bcn-pack': [
    {
      id: 'silvia-bcn-pres',
      topic: 'Presentations',
      body: "¡Hola! Soy Silvia, fundadora de Hey Lola 🌊\n\nGracias por estar aquí — sois las primeras caras del crew de Barcelona. Este es vuestro espacio para playas, quedadas en la plaça, terrazas dog-friendly y consejos para la vida con perro.\n\nPresentaos abajo: ¿quién sois y quién es vuestro perro? Me encantará conoceros a todos. 🐾",
    },
    {
      id: 'silvia-bcn-starter',
      topic: 'Playas & parques',
      body: "Empiezo yo — ¿cuál es la playa o el parque favorito de tu perro en Barcelona? Buscamos los sitios más dog-friendly para compartir con todos. 🌊🐶",
    },
  ],
  'founders-circle': [
    {
      id: 'silvia-founders-pres',
      topic: 'Presentations',
      body: "Welcome to the Founders' Circle ✨\n\nI'm Silvia, founder of Hey Lola — and I want to start by saying thank you. You believed in this early, and that's exactly why you're here. This is our inner room: where we shape the roadmap together, unlock exclusive perks, and meet the people building Hey Lola alongside us.\n\nTell us a little about you and your dog below — and don't hold back on ideas. This is yours as much as mine. 🐾",
    },
    {
      id: 'silvia-founders-starter',
      topic: 'Roadmap & feedback',
      body: "Kicking off the roadmap thread: if you could change or add ONE thing in Hey Lola right now, what would it be? Everything you drop here goes straight onto my desk. ✨",
    },
  ],
};

/** Build display-ready FeedPosts for a group from the seed table. */
export function seedPostsFor(groupId: string): FeedPost[] {
  return (SEED_POSTS[groupId] ?? []).map((s) => ({
    id: s.id,
    author: FOUNDER_AUTHOR.author,
    handle: FOUNDER_AUTHOR.handle,
    avatar: FOUNDER_AUTHOR.avatar,
    badge: FOUNDER_AUTHOR.badge,
    body: s.body,
    topic: s.topic,
    likes: 0,
    replies: 0,
    timeAgo: 'pinned',
  }));
}
