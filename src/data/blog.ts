/**
 * Native blog content for Hey Lola — The Journal.
 *
 * Articles are real, indexable pages (/blog/:slug) written for SEO + GEO
 * (generative-engine optimisation: structured, citable, ranking-style
 * content that AI assistants quote). Two voices:
 *   - Silvia Mogás  → travel, dogs, lifestyle and the conference circuit, global.
 *   - Eva Escarpenter → pet-industry brand rankings + practical dog tips,
 *     featuring strategic global premium brands for future partnerships.
 *
 * Blocks render into clean, styled HTML in BlogArticle.tsx — no third-party
 * widget, so every word is in the page source and gets indexed.
 */

export type AuthorId = 'silvia' | 'eva';

export interface Author {
  id: AuthorId;
  name: string;
  role: string;
  bio: string;
  /** Optional avatar served from /public. Falls back to a monogram. */
  avatar?: string;
}

export const AUTHORS: Record<AuthorId, Author> = {
  silvia: {
    id: 'silvia',
    name: 'Silvia Mogás',
    role: 'Founder, Hey Lola',
    bio: 'Silvia Mogás is the founder of Hey Lola, a boutique lifestyle concierge for dog parents. She writes about travelling the world with dogs, the modern pet-parent lifestyle, and building a global brand — and speaks on those topics at conferences across the US and Europe.',
    avatar: '',
  },
  eva: {
    id: 'eva',
    name: 'Eva Escarpenter',
    role: 'Pet Industry & Partnerships',
    bio: 'Eva Escarpenter covers the pet industry for Hey Lola — the brands, products and companies shaping how we care for dogs. She curates the brands worth knowing and the ones worth partnering with.',
    avatar: '',
  },
};

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'rank'; n: number; name: string; tag: string; text: string; tip?: string };

export interface BlogPost {
  slug: string;
  title: string;
  authorId: AuthorId;
  /** ISO date. */
  date: string;
  readingMinutes: number;
  category: string;
  tags: string[];
  excerpt: string;
  /** Meta description for SEO (defaults to excerpt if omitted). */
  metaDescription?: string;
  /** Big background gradient class for the typographic hero. */
  accent: string;
  faqs?: { q: string; a: string }[];
  blocks: Block[];
}

const SILVIA_POSTS: BlogPost[] = [
  {
    slug: 'most-dog-friendly-cities-in-the-world-2026',
    title: 'The 12 Most Dog-Friendly Cities in the World for 2026',
    authorId: 'silvia',
    date: '2026-05-04',
    readingMinutes: 9,
    category: 'Travel',
    tags: ['dog-friendly cities', 'travel with dogs', 'pet travel'],
    excerpt: 'From Barcelona’s beaches to Toronto’s ravines, these are the twelve cities where travelling with a dog feels effortless — ranked on transit, patios, parks and the little things that matter.',
    metaDescription: 'A 2026 ranking of the 12 most dog-friendly cities in the world, judged on public transit, dog-friendly patios, parks, beaches and overall ease of travelling with a dog.',
    accent: 'from-[rgba(242,140,51,0.13)] to-transparent',
    faqs: [
      { q: 'What makes a city dog-friendly?', a: 'The best dog-friendly cities combine dogs allowed on public transport, a high density of dog-welcoming cafés and restaurants, accessible off-leash parks and beaches, and relaxed local attitudes toward dogs in everyday public life.' },
      { q: 'Which is the most dog-friendly city in Europe?', a: 'Barcelona consistently ranks at the top in Europe thanks to its dog beaches, plaça culture, year-round mild weather and a strong community of dog parents, closely followed by Amsterdam and Berlin.' },
      { q: 'Are US cities dog-friendly for travel?', a: 'Yes. New York, Miami and Washington DC are increasingly dog-friendly, with growing numbers of pet-welcoming hotels, patios and parks, though rules vary by venue so it is worth checking ahead.' },
    ],
    blocks: [
      { type: 'p', text: 'A city reveals itself differently when you see it at a dog’s pace. You notice the shaded benches, the cafés that keep a water bowl by the door, the parks that come alive at sunrise. After years of travelling with dogs and building Hey Lola around exactly this kind of life, these are the twelve cities where it all just works.' },
      { type: 'p', text: 'We ranked them on four things that genuinely change the experience: whether dogs are welcome on public transit, the density of dog-friendly cafés and restaurants, access to off-leash parks and beaches, and the harder-to-measure local attitude toward dogs in public life.' },
      { type: 'rank', n: 1, name: 'Barcelona, Spain', tag: 'Best overall', text: 'Dog beaches, endless plaça culture, year-round mild weather and a community of dog parents who treat their dogs as family. Terraces almost universally welcome dogs, and the city keeps adding off-leash zones.', tip: 'Head to the dedicated dog beach in the off-season for room to run.' },
      { type: 'rank', n: 2, name: 'Amsterdam, Netherlands', tag: 'Most relaxed', text: 'Dogs ride trams and trains, join you at most cafés, and are simply part of daily life. The canal-side walks are some of the most pleasant in Europe.', tip: 'Buy your dog a day transit ticket — it is inexpensive and expected.' },
      { type: 'rank', n: 3, name: 'Berlin, Germany', tag: 'Best for big dogs', text: 'Vast parks, a famously dog-tolerant culture and excellent public transport access make Berlin a dream for larger breeds that need space.' },
      { type: 'rank', n: 4, name: 'New York City, USA', tag: 'Best urban energy', text: 'A relentless number of dog runs, pet-welcoming hotels and a culture of dogs-everywhere. The patchwork of rules is the only catch, but the density of options is unmatched.', tip: 'Early-morning park hours are when the off-leash community comes out.' },
      { type: 'rank', n: 5, name: 'Toronto, Canada', tag: 'Best green space', text: 'Ravine trails threaded through the city, plentiful off-leash parks and a patio scene that embraces dogs in the warmer months.' },
      { type: 'rank', n: 6, name: 'Miami, USA', tag: 'Best for beach life', text: 'Dog-friendly beaches, an outdoor-first lifestyle and a growing roster of cafés and hotels that cater to dogs make Miami a sun-soaked favourite.' },
      { type: 'rank', n: 7, name: 'Lisbon, Portugal', tag: 'Best value', text: 'Warm, walkable and increasingly dog-aware, with miradouros and riverside paths made for long strolls.' },
      { type: 'rank', n: 8, name: 'Vienna, Austria', tag: 'Best public transit', text: 'Dogs are welcome across the metro and tram network, and the city’s parks and palace grounds are made for walking.' },
      { type: 'rank', n: 9, name: 'Paris, France', tag: 'Most improved', text: 'Long famous for dogs in restaurants, Paris keeps expanding green space and pet-welcoming hotels. Smaller dogs travel especially easily here.' },
      { type: 'rank', n: 10, name: 'Washington DC, USA', tag: 'Best for walks', text: 'The Mall, Rock Creek Park and a leafy network of neighbourhoods make DC a quietly excellent dog city, with a patio culture to match.' },
      { type: 'rank', n: 11, name: 'Copenhagen, Denmark', tag: 'Best design-led city', text: 'Calm, clean and walkable, with dog forests on the outskirts where dogs can roam freely.' },
      { type: 'rank', n: 12, name: 'Sydney, Australia', tag: 'Best coastline', text: 'Coastal walks, off-leash beaches at dawn and dusk, and a famously outdoorsy culture round out the list.' },
      { type: 'h2', text: 'How to actually plan a dog-friendly trip' },
      { type: 'p', text: 'A great city is only half the equation. Before you go, confirm the specific venues you want to visit allow dogs, map the nearest green space to where you are staying, and pack your dog’s records in case you need a vet. The cities above make all of that easier — but a little planning is what turns a good trip into an effortless one.' },
      { type: 'quote', text: 'The best dog cities are not the ones with the most rules. They are the ones where a dog at your feet feels completely normal.' },
    ],
  },
  {
    slug: 'how-to-travel-the-world-with-your-dog',
    title: 'How to Travel the World With Your Dog: The Complete 2026 Guide',
    authorId: 'silvia',
    date: '2026-04-20',
    readingMinutes: 11,
    category: 'Travel',
    tags: ['travel with dogs', 'dog passport', 'pet travel guide'],
    excerpt: 'Everything you need to travel internationally with your dog without the stress: paperwork, flights, accommodation, and the system I use to keep it all in one place.',
    metaDescription: 'A complete, practical guide to international travel with your dog in 2026: vaccinations and paperwork, choosing flights, finding dog-friendly stays, and reducing travel stress.',
    accent: 'from-[rgba(110,140,93,0.13)] to-transparent',
    faqs: [
      { q: 'What documents does my dog need to travel internationally?', a: 'Most countries require an up-to-date rabies vaccination, a microchip, and a health certificate issued by a licensed vet shortly before travel. Some destinations require additional treatments or an import permit, so always check the specific country’s rules months ahead.' },
      { q: 'Is it safe for dogs to fly?', a: 'Small dogs can usually travel in-cabin, which is the safest and least stressful option. For larger dogs that travel in the hold, choose direct flights, acclimatise them to their crate well in advance, and consult your vet about your individual dog.' },
      { q: 'How far in advance should I plan dog travel?', a: 'Start at least three months ahead for international trips. Rabies titer tests and import permits can take weeks, and some requirements have strict timing windows relative to your travel date.' },
    ],
    blocks: [
      { type: 'p', text: 'Travelling with a dog is one of the most rewarding things you can do — and one of the most over-complicated, if you let it be. Having done it across continents, I have learned that the stress almost always comes from disorganisation, not from the dog. Here is the system that makes it simple.' },
      { type: 'h2', text: '1. Start with the paperwork, early' },
      { type: 'p', text: 'Every international trip starts months before you pack. The non-negotiables are a microchip, a current rabies vaccination, and a vet-issued health certificate dated close to departure. Beyond that, requirements vary widely: some countries want a rabies titer blood test, others an import permit, others a tapeworm treatment within a specific window.' },
      { type: 'list', items: ['Confirm your destination’s exact entry rules on its official government site', 'Book the vet appointment for the health certificate within the required window', 'Keep digital copies of every document somewhere you can reach instantly', 'Note any timing rules — titer tests in particular can take weeks to come back'] },
      { type: 'h2', text: '2. Choose the right way to fly' },
      { type: 'p', text: 'If your dog is small enough to travel in-cabin, that is almost always the calmest option for both of you. For larger dogs flying in the hold, prioritise direct flights, avoid extreme-temperature seasons, and spend weeks getting your dog genuinely comfortable in their travel crate before the trip — not the night before.' },
      { type: 'h2', text: '3. Book stays that actually want your dog' },
      { type: 'p', text: 'There is a difference between a hotel that permits dogs and one that welcomes them. Look for places that mention dog beds, bowls or treats — and always confirm size limits and fees directly. A ground-floor room near green space makes the early-morning routine far easier.' },
      { type: 'h2', text: '4. Keep everything in one place' },
      { type: 'p', text: 'The single biggest stress-reducer is having your dog’s vaccination records, microchip number, vet contacts and photos in one place you can open in seconds — at a border, a vet, or a hotel desk. This is exactly why we built the digital passport inside Hey Lola, but the principle stands no matter how you do it: one source of truth beats a folder of screenshots.' },
      { type: 'quote', text: 'A dog does not need a perfect itinerary. It needs you calm, prepared, and present. Sort the logistics once and the trip takes care of itself.' },
      { type: 'p', text: 'Do the preparation properly and travelling with your dog stops being a logistical feat and becomes what it should be: more of the world, shared with your favourite companion.' },
    ],
  },
  {
    slug: 'the-modern-dog-parent-global-movement',
    title: 'The Rise of the Modern Dog Parent: How Pet Lifestyle Went Global',
    authorId: 'silvia',
    date: '2026-04-06',
    readingMinutes: 7,
    category: 'Lifestyle',
    tags: ['dog parents', 'pet lifestyle', 'pet humanisation'],
    excerpt: 'Dogs moved from the backyard to the centre of our lives — and an entire global lifestyle grew around that shift. Here is what is really driving it.',
    metaDescription: 'Why the modern dog parent is reshaping travel, food, wellness and design — a look at the global pet-lifestyle movement and the cultural shift behind it.',
    accent: 'from-[rgba(196,98,45,0.13)] to-transparent',
    blocks: [
      { type: 'p', text: 'A generation ago, a dog lived in the yard and ate whatever was on offer. Today, dogs travel with us, sleep in our rooms, eat fresh food and have their own communities. This is not indulgence — it is a genuine cultural shift, and it is happening everywhere at once.' },
      { type: 'h2', text: 'Dogs became family, officially' },
      { type: 'p', text: 'The term that researchers use is "pet humanisation," and the data behind it is striking: people increasingly describe their dogs as children, plan their lives around them, and spend on them the way they would on any family member. The result is an entire economy of premium food, travel, wellness and design built around dogs.' },
      { type: 'h2', text: 'Why now' },
      { type: 'list', items: ['Later parenthood and smaller households put dogs at the emotional centre of more homes', 'Remote and flexible work means more hours spent with our dogs, and higher expectations of sharing life with them', 'A global, online community lets dog parents discover and compare the best of everything, instantly', 'Wellness culture extended naturally from ourselves to our dogs'] },
      { type: 'h2', text: 'What it means for how we live' },
      { type: 'p', text: 'The modern dog parent expects the same things from their dog’s life that they expect from their own: quality, transparency, and experiences over stuff. They want to know what is in the food, whether a hotel truly welcomes dogs, and where the community gathers. That expectation is reshaping entire industries — and it is exactly the world Hey Lola was built for.' },
      { type: 'quote', text: 'We did not start treating dogs like family. We finally started admitting that they always were.' },
    ],
  },
  {
    slug: 'flying-with-your-dog-airlines-rules-tips',
    title: 'Flying With Your Dog: Airlines, Rules and a Stress-Free Checklist',
    authorId: 'silvia',
    date: '2026-03-23',
    readingMinutes: 8,
    category: 'Travel',
    tags: ['flying with dogs', 'pet airlines', 'in-cabin pet travel'],
    excerpt: 'Cabin vs hold, the paperwork airlines actually check, and a calm pre-flight routine that makes air travel with a dog genuinely manageable.',
    metaDescription: 'How to fly with your dog without the stress: in-cabin vs hold rules, what airlines require, carrier tips and a complete pre-flight checklist for 2026.',
    accent: 'from-[rgba(93,132,140,0.13)] to-transparent',
    faqs: [
      { q: 'Can my dog fly in the cabin with me?', a: 'Most airlines allow small dogs that fit in a ventilated carrier under the seat to fly in-cabin, usually with a per-flight fee and advance booking. Size and weight limits vary by airline, so confirm before you book.' },
      { q: 'How do I keep my dog calm on a flight?', a: 'Acclimatise your dog to the carrier for weeks beforehand, exercise them well before the flight, avoid feeding a large meal right before, and bring a familiar-smelling blanket. Speak to your vet rather than using sedatives, which are not recommended for flying.' },
    ],
    blocks: [
      { type: 'p', text: 'Flying with a dog sounds daunting until you have done it once with a plan. The anxiety is almost always about the unknowns — so let us remove them.' },
      { type: 'h2', text: 'Cabin or hold?' },
      { type: 'p', text: 'If your dog is small enough to fit in a ventilated carrier under the seat in front of you, in-cabin travel is the gold standard: you stay together and stress stays low. Larger dogs travel in the hold, which is safe with the right preparation but demands more care — choose direct flights and avoid temperature extremes.' },
      { type: 'h2', text: 'What airlines actually check' },
      { type: 'list', items: ['A health certificate within the airline’s required window', 'Proof of vaccinations, especially rabies', 'A carrier that meets the airline’s exact dimensions', 'Your advance pet booking — cabin spots are limited and sell out'] },
      { type: 'h2', text: 'The pre-flight routine that works' },
      { type: 'p', text: 'Start carrier training weeks ahead so the carrier means safety, not surprise. On the day, give a long walk to burn energy, keep the last meal light and early, and pack a blanket that smells like home. Arrive early, stay calm — dogs read our energy more than our words.' },
      { type: 'quote', text: 'Your dog is not afraid of the plane. It is reading you. Be the calm it borrows.' },
    ],
  },
  {
    slug: 'building-a-global-dog-brand-conference-notes',
    title: 'Building a Global Dog Brand: Notes From the Conference Circuit',
    authorId: 'silvia',
    date: '2026-03-09',
    readingMinutes: 8,
    category: 'Founder Notes',
    tags: ['founder', 'pet startup', 'conferences', 'brand building'],
    excerpt: 'Lessons from building Hey Lola across borders and from the stages where the pet industry’s future gets debated — on community, trust, and why dogs are a global language.',
    metaDescription: 'A founder’s notes on building a global dog lifestyle brand and speaking on the conference circuit: lessons on community, trust and scaling a pet startup internationally.',
    accent: 'from-[rgba(140,107,63,0.13)] to-transparent',
    blocks: [
      { type: 'p', text: 'Building a brand for dog parents in multiple countries teaches you something quickly: dogs are a global language, but trust is local. Here is what the road — and the conference stages along it — have taught me about building Hey Lola.' },
      { type: 'h2', text: 'Community comes before product' },
      { type: 'p', text: 'The instinct is to build features. The reality is that people join for belonging. The cities where Hey Lola works best are the ones where dog parents already wanted to find each other. We did not create the demand for community; we gave it a home.' },
      { type: 'h2', text: 'Trust does not translate automatically' },
      { type: 'p', text: 'A recommendation that lands in one city can fall flat in another. What carries across borders is not the specific advice but the standard behind it: honesty about what is good, transparency about why, and never recommending something we would not give our own dogs.' },
      { type: 'h2', text: 'What I tell other founders' },
      { type: 'list', items: ['Start narrow and deep: one city that loves you beats ten that tolerate you', 'Earn the right to expand by being genuinely useful first', 'Treat your earliest members as co-founders — they shape everything', 'The pet industry rewards authenticity faster than almost any other'] },
      { type: 'h2', text: 'Why the conference circuit matters' },
      { type: 'p', text: 'Speaking at industry events is not about visibility for its own sake. It is where you pressure-test your thinking against the people building the future of pet care, and where the partnerships that move a brand forward actually begin. Every stage is a conversation, not a broadcast.' },
      { type: 'quote', text: 'You do not scale a dog brand with features. You scale it with trust — earned one city, one dog, one parent at a time.' },
    ],
  },
];

const EVA_POSTS: BlogPost[] = [
  {
    slug: 'best-premium-dog-brands-to-know',
    title: 'The 15 Best Premium Dog Brands Every Modern Pet Parent Should Know',
    authorId: 'eva',
    date: '2026-05-11',
    readingMinutes: 10,
    category: 'Brands',
    tags: ['premium dog brands', 'best dog brands', 'pet products'],
    excerpt: 'The brands defining premium dog care right now — across food, gear, travel, tech and wellness — and what each one actually does well.',
    metaDescription: 'A curated 2026 ranking of the 15 best premium dog brands across food, travel gear, tech, wellness and lifestyle, with an honest note on what each does best.',
    accent: 'from-[rgba(242,140,51,0.13)] to-transparent',
    faqs: [
      { q: 'What are the best premium dog brands in 2026?', a: 'Standouts span categories: The Farmer’s Dog and Open Farm in fresh food, Ruffwear and Sleepypod in travel gear, Fi in tech, Embark in DNA testing, and Wild One and Maxbone in lifestyle and accessories.' },
      { q: 'Are premium dog brands worth the money?', a: 'For everyday essentials like food, harnesses and safety gear, the quality and durability of premium brands usually justify the cost. For accessories, it comes down to personal taste and budget.' },
    ],
    blocks: [
      { type: 'p', text: 'Premium does not mean expensive for its own sake — it means thoughtful: better materials, real testing, transparent ingredients, and design that respects both the dog and the home. These are the fifteen brands setting the standard, the ones worth knowing whether you are buying or partnering.' },
      { type: 'rank', n: 1, name: 'The Farmer’s Dog', tag: 'Fresh food', text: 'Human-grade, vet-formulated fresh food delivered on a schedule. A category leader that made fresh feeding mainstream.', tip: 'Best for dog parents who want convenience without compromising on ingredients.' },
      { type: 'rank', n: 2, name: 'Open Farm', tag: 'Ethical food', text: 'Ethically sourced, fully traceable ingredients — you can trace each batch back to its farms. Strong on sustainability.', tip: 'A natural partner for any brand built on transparency.' },
      { type: 'rank', n: 3, name: 'Ruffwear', tag: 'Adventure gear', text: 'The benchmark for harnesses, leashes and outdoor gear built to last. Trusted by working and adventure dogs worldwide.', tip: 'The harnesses are the gateway product — durable and widely loved.' },
      { type: 'rank', n: 4, name: 'Sleepypod', tag: 'Travel safety', text: 'Crash-tested carriers and car safety harnesses — the serious choice for travelling safely with a dog.', tip: 'Their safety testing is a genuine differentiator worth highlighting.' },
      { type: 'rank', n: 5, name: 'Fi', tag: 'GPS tech', text: 'A GPS smart collar with genuinely useful tracking and activity monitoring, and battery life that outlasts rivals.', tip: 'The strongest tech-partner candidate for a travel-focused audience.' },
      { type: 'rank', n: 6, name: 'Embark', tag: 'DNA testing', text: 'The most comprehensive dog DNA and health-screening kits, popular with breed-curious and health-conscious owners.' },
      { type: 'rank', n: 7, name: 'Wild One', tag: 'Design-led essentials', text: 'Beautifully designed harnesses, leashes and carriers in a cohesive, modern palette. A favourite of the design-conscious dog parent.', tip: 'Aesthetic alignment makes them a natural lifestyle partner.' },
      { type: 'rank', n: 8, name: 'Maxbone', tag: 'Lifestyle', text: 'Elevated everyday products — apparel, travel and home — with a boutique sensibility.' },
      { type: 'rank', n: 9, name: 'Ollie', tag: 'Fresh food', text: 'Personalised fresh meals with strong portioning and onboarding. A close peer to The Farmer’s Dog.' },
      { type: 'rank', n: 10, name: 'Ziwi Peak', tag: 'Air-dried food', text: 'Premium air-dried food with high meat content, ideal for travel and feeding on the move.', tip: 'Lightweight and shelf-stable — perfect for a travel content angle.' },
      { type: 'rank', n: 11, name: 'Kurgo', tag: 'Car & travel', text: 'Smart, affordable car and travel gear — seat covers, harnesses and ramps that solve real road-trip problems.' },
      { type: 'rank', n: 12, name: 'Cloud7', tag: 'European luxury', text: 'Berlin-based luxury dog lifestyle — beds, leashes and apparel with a refined European aesthetic.', tip: 'A strong fit for the Barcelona and European audience.' },
      { type: 'rank', n: 13, name: 'Honest Kitchen', tag: 'Whole-food', text: 'Dehydrated, human-grade whole-food meals — a trusted name for owners who want minimally processed food.' },
      { type: 'rank', n: 14, name: 'Fable Pets', tag: 'Home & toys', text: 'Design-forward toys and home goods built to last and look good in a modern home.' },
      { type: 'rank', n: 15, name: 'Barc London', tag: 'British accessories', text: 'Premium British grooming and accessories with a clean, giftable aesthetic.' },
      { type: 'h2', text: 'How we choose the brands we feature' },
      { type: 'p', text: 'We look for three things: real quality you can feel, transparency about what goes into the product, and values that align with how the modern dog parent actually lives. These are the brands we would put in front of our own community — and the conversations worth starting for partnerships.' },
    ],
  },
  {
    slug: 'best-dog-travel-gear-brands',
    title: 'The 10 Best Dog Travel Gear Brands for 2026',
    authorId: 'eva',
    date: '2026-04-27',
    readingMinutes: 8,
    category: 'Brands',
    tags: ['dog travel gear', 'dog carriers', 'travel with dogs'],
    excerpt: 'Carriers, harnesses, car safety and packable essentials — the ten brands that make travelling with a dog easier, ranked.',
    metaDescription: 'The 10 best dog travel gear brands for 2026, ranked: crash-tested carriers, adventure harnesses, car safety gear and packable essentials for travelling with a dog.',
    accent: 'from-[rgba(110,140,93,0.13)] to-transparent',
    faqs: [
      { q: 'What is the safest dog carrier for travel?', a: 'Sleepypod is widely regarded as the safest, thanks to independent crash-testing of its carriers and harnesses. For backpack-style carriers, K9 Sport Sack is a popular choice for small to medium dogs.' },
      { q: 'What dog gear do I need for a road trip?', a: 'At minimum: a crash-tested travel harness or carrier, a seat cover, a collapsible bowl and water, and your dog’s records. A ramp helps older or smaller dogs get in and out safely.' },
    ],
    blocks: [
      { type: 'p', text: 'Good travel gear disappears — it just works, so you and your dog can focus on the trip. These ten brands have earned their place in the bag, ranked for how much easier they make life on the move.' },
      { type: 'rank', n: 1, name: 'Sleepypod', tag: 'Safest carrier', text: 'Crash-tested carriers and car harnesses. If safety is the priority, this is the starting point.', tip: 'The Mobile Pet Bed doubles as a carrier and a familiar bed at the destination.' },
      { type: 'rank', n: 2, name: 'Ruffwear', tag: 'Best harness', text: 'Adventure-grade harnesses and leashes built for the long haul. The gear that serious hikers trust.' },
      { type: 'rank', n: 3, name: 'Diggs', tag: 'Modern crates & carriers', text: 'Thoughtfully engineered crates and the Passenger carrier — safety and design in equal measure.' },
      { type: 'rank', n: 4, name: 'K9 Sport Sack', tag: 'Backpack carrier', text: 'The original dog backpack carrier — ideal for cities, transit and trails where your dog needs to ride along.', tip: 'Great for content: hands-free travel through busy cities.' },
      { type: 'rank', n: 5, name: 'Kurgo', tag: 'Car travel', text: 'Seat covers, harnesses, ramps and hammocks that solve the practical problems of travelling by car.' },
      { type: 'rank', n: 6, name: 'Wild One', tag: 'Design-led travel', text: 'A coordinated travel system — carrier, harness and leash — for the design-conscious traveller.' },
      { type: 'rank', n: 7, name: 'Away', tag: 'Luggage + pet carrier', text: 'The travel-luggage brand’s pet carrier brings its design pedigree to in-cabin dog travel.', tip: 'A natural co-marketing partner for a travel audience.' },
      { type: 'rank', n: 8, name: 'Maxbone', tag: 'Boutique essentials', text: 'Elevated travel accessories and apparel for dogs that travel in style.' },
      { type: 'rank', n: 9, name: 'Tavo', tag: 'Pet stroller system', text: 'A premium pet stroller and car-seat system for owners who want stroller-grade convenience and safety.' },
      { type: 'rank', n: 10, name: 'Fjällräven', tag: 'Outdoor crossover', text: 'The Scandinavian outdoor brand’s dog gear suits cold-weather and adventure travel beautifully.' },
      { type: 'h2', text: 'The non-negotiable: safety first' },
      { type: 'p', text: 'However good a bag looks, the gear that matters most is what keeps your dog safe in a car or a cabin. Start there, then build the rest of the kit around the way you actually travel.' },
    ],
  },
  {
    slug: 'best-dog-tech-gps-cameras-trackers-ranked',
    title: 'The Best Dog Tech in 2026: GPS, Cameras and Smart Trackers, Ranked',
    authorId: 'eva',
    date: '2026-04-13',
    readingMinutes: 8,
    category: 'Brands',
    tags: ['dog tech', 'gps dog collar', 'dog camera'],
    excerpt: 'The smart collars, trackers and cameras worth your money — and the ones that are all marketing. Ranked for what actually helps.',
    metaDescription: 'A 2026 ranking of the best dog tech: GPS smart collars, activity trackers and home cameras, with honest notes on which features genuinely help.',
    accent: 'from-[rgba(93,132,140,0.13)] to-transparent',
    faqs: [
      { q: 'What is the best GPS tracker for dogs?', a: 'Fi and Tractive lead the category. Fi is favoured in the US for battery life and design; Tractive offers strong worldwide coverage and is popular across Europe.' },
      { q: 'Are dog cameras worth it?', a: 'For dogs prone to separation anxiety or owners who travel, a treat-dispensing camera like Furbo can be genuinely reassuring. For most dogs it is a nice-to-have rather than a need.' },
    ],
    blocks: [
      { type: 'p', text: 'Dog tech is having a moment, and most of it is noise. Here is what is actually worth the shelf space — ranked by how much it improves day-to-day life with a dog.' },
      { type: 'rank', n: 1, name: 'Fi', tag: 'Best GPS collar', text: 'Accurate location tracking, excellent battery life and genuinely useful activity data in a well-designed collar.', tip: 'The strongest tech partner for a travel and adventure audience.' },
      { type: 'rank', n: 2, name: 'Tractive', tag: 'Best global coverage', text: 'Worldwide GPS tracking on a subscription, with strong coverage across Europe — ideal for international travellers.' },
      { type: 'rank', n: 3, name: 'Whistle', tag: 'Best health tracking', text: 'Health and behaviour monitoring that flags changes in licking, scratching and activity — useful early-warning data.' },
      { type: 'rank', n: 4, name: 'Furbo', tag: 'Best camera', text: 'A treat-tossing camera with barking alerts — the reassurance standard for owners who travel or work away.' },
      { type: 'rank', n: 5, name: 'Petcube', tag: 'Best value camera', text: 'Solid two-way camera options at a friendlier price, with care plans that add vet chat.' },
      { type: 'rank', n: 6, name: 'Tile', tag: 'Best simple tracker', text: 'A no-subscription Bluetooth tracker for collars — limited range, but dependable for the basics.' },
      { type: 'rank', n: 7, name: 'SureFlap / SureFeed', tag: 'Best smart home', text: 'Microchip-activated feeders and doors that bring genuine convenience to multi-pet homes.' },
      { type: 'h2', text: 'What to actually look for' },
      { type: 'list', items: ['Battery life you can live with — daily charging kills adoption', 'Coverage in the places you travel, not just at home', 'Data that leads to action, not just numbers on a screen', 'A subscription cost you are willing to pay long-term'] },
    ],
  },
  {
    slug: 'premium-dog-food-brands-ranked',
    title: 'Premium Dog Food Brands Worth It: An Honest 2026 Ranking',
    authorId: 'eva',
    date: '2026-03-30',
    readingMinutes: 9,
    category: 'Brands',
    tags: ['premium dog food', 'fresh dog food', 'best dog food'],
    excerpt: 'Fresh, air-dried, whole-food — the premium dog food brands worth the money, ranked, with a clear note on who each one is for.',
    metaDescription: 'An honest 2026 ranking of premium dog food brands — fresh, air-dried and whole-food — covering ingredients, transparency and who each brand suits best.',
    accent: 'from-[rgba(196,98,45,0.13)] to-transparent',
    faqs: [
      { q: 'Is fresh dog food better than kibble?', a: 'Fresh, human-grade food offers excellent ingredient quality and digestibility, and many dogs thrive on it. The right choice depends on your dog’s needs, your budget and your vet’s guidance — premium kibble and air-dried options are also strong.' },
      { q: 'What is the most transparent dog food brand?', a: 'Open Farm is known for full ingredient traceability, letting you trace each batch to its source. The Honest Kitchen and Orijen are also praised for ingredient transparency.' },
    ],
    blocks: [
      { type: 'p', text: 'Food is the one premium category that affects your dog every single day. We ranked the brands worth the money on ingredient quality, transparency and who they genuinely suit — because the "best" food is the one that is right for your dog.' },
      { type: 'rank', n: 1, name: 'The Farmer’s Dog', tag: 'Best fresh', text: 'Human-grade fresh food, vet-formulated and portioned to your dog. The brand that made fresh feeding mainstream.', tip: 'Best for owners who want convenience and quality together.' },
      { type: 'rank', n: 2, name: 'Open Farm', tag: 'Most transparent', text: 'Ethically sourced and fully traceable — a leader for owners who care where food comes from.', tip: 'Ideal partner for a values-led, transparent brand.' },
      { type: 'rank', n: 3, name: 'Ollie', tag: 'Best personalised', text: 'Tailored fresh meals with smooth onboarding and clear portioning. A close peer to The Farmer’s Dog.' },
      { type: 'rank', n: 4, name: 'Ziwi Peak', tag: 'Best for travel', text: 'Air-dried, high-meat food that is shelf-stable and lightweight — excellent for travelling and on-the-go feeding.', tip: 'The natural food partner for a travel-focused audience.' },
      { type: 'rank', n: 5, name: 'Orijen & Acana', tag: 'Best premium kibble', text: 'Biologically appropriate, high-protein recipes for owners who prefer a premium dry food.' },
      { type: 'rank', n: 6, name: 'The Honest Kitchen', tag: 'Best whole-food', text: 'Dehydrated, human-grade whole foods — minimally processed and easy to rehydrate.' },
      { type: 'rank', n: 7, name: 'Bocce’s Bakery', tag: 'Best treats', text: 'Small-batch, limited-ingredient treats and bakery goods with a charming, giftable brand.', tip: 'A fun, lower-commitment first partnership.' },
      { type: 'rank', n: 8, name: 'Stella & Chewy’s', tag: 'Best raw-inspired', text: 'Freeze-dried raw and frozen options for owners exploring raw feeding without the full commitment.' },
      { type: 'h2', text: 'A word on choosing food' },
      { type: 'p', text: 'No ranking replaces your vet. Use this as a shortlist of brands that take quality seriously, then choose based on your dog’s age, health and preferences — and transition gradually whenever you switch.' },
    ],
  },
  {
    slug: 'dog-wellness-brands-ranked',
    title: 'Dog Wellness, Ranked: Supplements, Insurance and Care Brands to Know',
    authorId: 'eva',
    date: '2026-03-16',
    readingMinutes: 8,
    category: 'Brands',
    tags: ['dog wellness', 'dog supplements', 'pet insurance'],
    excerpt: 'The wellness brands genuinely worth knowing — supplements, insurance and preventive care — ranked, with what to actually check before you buy.',
    metaDescription: 'A 2026 ranking of the best dog wellness brands across supplements, pet insurance and preventive care, with practical advice on what to check before buying.',
    accent: 'from-[rgba(124,93,140,0.13)] to-transparent',
    faqs: [
      { q: 'Is pet insurance worth it?', a: 'For most owners, yes — it turns unpredictable, potentially large vet bills into a predictable monthly cost. Compare reimbursement rates, deductibles and exclusions, and enrol while your dog is young and healthy for the best terms.' },
      { q: 'Do dogs need supplements?', a: 'A dog on a complete, balanced diet often does not need supplements, but targeted ones — for joints, skin or digestion — can help specific issues. Always check with your vet before adding anything.' },
    ],
    blocks: [
      { type: 'p', text: 'Wellness is where marketing runs hottest, so we focused on brands with real substance — and on what you should actually verify before spending. Ranked for trust and usefulness.' },
      { type: 'rank', n: 1, name: 'Embark', tag: 'Best DNA & health screening', text: 'The most comprehensive DNA and genetic health screening — invaluable for understanding breed-specific risks early.', tip: 'A high-value, shareable partner product.' },
      { type: 'rank', n: 2, name: 'Trupanion', tag: 'Best comprehensive insurance', text: 'Straightforward, comprehensive coverage known for paying vets directly. A long-standing category leader.' },
      { type: 'rank', n: 3, name: 'Lemonade', tag: 'Best digital insurance', text: 'A slick, app-first insurance experience with fast claims — popular with younger, digital-first owners.', tip: 'Brand and audience align well with a modern pet platform.' },
      { type: 'rank', n: 4, name: 'Finn', tag: 'Best supplements', text: 'Vet-developed supplements with clean formulations for calming, hip and joint, and skin health.' },
      { type: 'rank', n: 5, name: 'Native Pet', tag: 'Best natural supplements', text: 'Simple, science-backed natural supplements — probiotics and joint support with transparent ingredients.' },
      { type: 'rank', n: 6, name: 'Dog Is Human', tag: 'Best clean formulations', text: 'Human-grade, clean-label wellness products for owners who read every ingredient.' },
      { type: 'rank', n: 7, name: 'Spot Pet Insurance', tag: 'Best flexible plans', text: 'Customisable plans with wellness add-ons for owners who want to tailor coverage.' },
      { type: 'h2', text: 'What to check before you buy' },
      { type: 'list', items: ['For insurance: reimbursement rate, deductible, annual limits and exclusions', 'For supplements: vet input, third-party testing and a clear reason your dog needs it', 'For any wellness product: transparent ingredients over bold claims', 'Always loop in your vet before adding something new'] },
      { type: 'quote', text: 'The best wellness spend is prevention: the right food, regular vet visits, and coverage that means a diagnosis is never a financial decision.' },
    ],
  },
];

export const BLOG_POSTS: BlogPost[] = [
  ...SILVIA_POSTS,
  ...EVA_POSTS,
];

/** Lookup helpers. */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getPostsByAuthor(authorId: AuthorId): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.authorId === authorId);
}

/** Newest first. */
export function getAllPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));
}
