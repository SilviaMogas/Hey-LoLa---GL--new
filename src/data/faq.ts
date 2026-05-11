// FAQ source content. Lives in /data so the duplicate-line scanner doesn't
// flag the unavoidably parallel `{ q, a }` shape — the value is the copy,
// not the structure (same rationale as translations.ts and curatedPlaces.ts).

export interface FaqQA { q: string; a: string }
export interface FaqCategory { id: string; label: string; questions: FaqQA[] }

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'pet-parents',
    label: 'Pet Parents',
    questions: [
      { q: 'What is Hey Lola?', a: 'Hey Lola is a boutique lifestyle concierge for dog parents. It helps you organise your dog\'s essentials, discover trusted dog-friendly places, and access curated local perks.' },
      { q: 'Is Hey Lola only for dog owners?', a: 'Hey Lola is designed for dog parents. Our curated city guides, partner network and concierge experience are all built around life with a dog. Cat parents and pet lovers are welcome to join the community.' },
      { q: 'Which cities are available first?', a: 'Hey Lola is launching first in Miami, with New York City and Barcelona coming next.' },
      { q: 'Can I use Hey Lola if I do not have a pet yet?', a: 'Yes. You can join as a pet lover, explore guides and save places.' },
      { q: 'What are City Rewards?', a: 'City Rewards are local perks unlocked through your membership, profile activity or partner offers. They can include discounts, welcome gifts, treats, priority access or exclusive local benefits.' },
      { q: 'What does "Unlocking Records" mean?', a: 'It means your pet profile becomes more useful as you add information such as vaccines, chip details, documents or passport notes. This prepares your profile for future records and passport features.' },
    ],
  },
  {
    id: 'founding-members',
    label: 'Founding Members',
    questions: [
      { q: 'What is a Founding Member Pass?', a: 'It is early access to Hey Lola before the full public launch. Founding Members get access to early city guides, local perks, pet profile features and future member benefits.' },
      { q: 'What is included in the $29 Founding Member Pass?', a: 'Early access to selected dog-friendly places, selected guides, basic pet profile features and a founding member badge.' },
      { q: 'What is included in the $79 Founding Member Plus Pass?', a: 'Full early access to city guides, local perks, favourites, pet profile features and future member benefits.' },
      { q: 'What is included in the $149 VIP Pet Concierge Pass?', a: 'Premium early access, travel and local perks, priority recommendations, early passport/document features and VIP support where available.' },
      { q: 'Will Founding Members keep their price?', a: 'Yes. Founding members keep their early access price for the benefits included in their founding plan.' },
      { q: 'Are all perks available immediately?', a: 'Some perks will launch progressively as Hey Lola verifies partners and activates local collaborations.' },
    ],
  },
  {
    id: 'creators',
    label: 'Creators / Influencers',
    questions: [
      { q: 'What is a Hey Lola Creator Partner?', a: 'A Creator Partner is a dog creator, blogger or local pet parent who shares trusted dog-friendly recommendations and gets featured on Hey Lola.' },
      { q: 'How do creators earn money?', a: 'Creators receive a referral code. When someone joins a paid Hey Lola membership through their code, the creator can earn commission.' },
      { q: 'What kind of creators are you looking for?', a: 'Dog lifestyle creators, dog travel creators, dog-friendly city bloggers and local pet parents with strong community trust.' },
      { q: 'Do I need a large following to apply?', a: 'No. Hey Lola values trust, content quality and local knowledge. Micro-creators with strong engagement are welcome.' },
      { q: 'Will my content be credited?', a: 'Yes. Creator recommendations should always include credit, links to social profiles or blogs, and source attribution where relevant.' },
      { q: 'What content can creators submit?', a: 'Examples include "My 5 favourite dog-friendly places in Miami", "A perfect dog-friendly day in Miami", "Best dog-friendly brunch spots" or "What I wish I knew as a dog parent in Miami".' },
    ],
  },
  {
    id: 'businesses',
    label: 'Businesses / Venues',
    questions: [
      { q: 'How can my business join Hey Lola?', a: 'Businesses can be listed, claim their profile and apply to become a Verified Founding Partner.' },
      { q: 'What types of businesses can join?', a: 'Restaurants, cafes, hotels, groomers, vets, pet stores, daycares, dog trainers, pet-friendly spaces and local experiences.' },
      { q: 'What is a Verified Founding Partner?', a: 'A Verified Founding Partner is a business that has claimed its profile and completed Hey Lola\'s email or manual verification process.' },
      { q: 'What is included in the Verified Founding Partner fee?', a: 'It includes a verified profile, badge, business link, community promotion, city guide inclusion and the ability to offer perks to Hey Lola members.' },
      { q: 'Can I offer a perk to Hey Lola members?', a: 'Yes. Partner venues can offer perks such as discounts, welcome gifts, dog treats, priority access or member-only offers.' },
      { q: 'Can I be listed for free?', a: 'Yes. Basic listings can appear for free, but they will remain pending verification until claimed and checked.' },
    ],
  },
  {
    id: 'vets',
    label: 'Vets and Pet Professionals',
    questions: [
      { q: 'Is Hey Lola a veterinary platform?', a: 'Not yet. Phase 1 focuses on the local pet parent ecosystem. Vet features, verified records and compliance workflows are part of the future roadmap.' },
      { q: 'Can vets join as business partners?', a: 'Yes. Vets can be listed, claim their profile and participate as trusted local pet professionals.' },
      { q: 'Will Hey Lola verify vaccines or medical records?', a: 'In Phase 1, users can store or add basic information. Formal verification by vets is a future feature and will only be shown when properly checked.' },
      { q: 'Can Hey Lola replace a vet or official passport?', a: 'No. Hey Lola does not replace official veterinary advice, legal documents or government-issued pet passports.' },
    ],
  },
  {
    id: 'verification',
    label: 'Verification and Trust',
    questions: [
      { q: 'What does "Pending verification" mean?', a: 'It means the information has been submitted but has not yet been checked by Hey Lola.' },
      { q: 'What does "Verified" mean?', a: 'It means Hey Lola has checked the information through email verification, manual review or a trusted future integration.' },
      { q: 'Why are some places pending verification?', a: 'Some places are added from public sources, creator recommendations or community input. They remain pending until the business claims the profile or Hey Lola verifies them.' },
      { q: 'Can users trust creator recommendations?', a: 'Creator recommendations are credited and sourced, but they are not the same as verified business information unless Hey Lola has checked the venue.' },
      { q: 'Can a business pay to become verified?', a: 'A business can pay for a partner package, but the verified badge only appears after the claim or manual verification process is complete.' },
    ],
  },
  {
    id: 'memberships',
    label: 'Memberships and Payments',
    questions: [
      { q: 'Is Hey Lola free?', a: 'Yes. The Free plan is active and gives you access to pet records, the curated city guide and the community. Local, Plus and Black memberships are coming soon.' },
      { q: 'What are the membership options?', a: 'Hey Lola includes Free, Local, Plus and Black tiers. Free is active today; Local, Plus and Black are coming soon and will activate once our partner network in each city is verified.' },
      { q: 'Can I cancel later?', a: 'Yes. Once paid memberships go live, you will be able to cancel anytime from your account.' },
      { q: 'Are paid memberships active now?', a: 'Not yet. We are activating paid memberships only after our partner network in each city is verified. Until then, the waitlist buttons let you join early access.' },
      { q: 'Do referral codes give a discount?', a: 'Referral codes may unlock special offers, creator benefits or early access depending on the campaign.' },
    ],
  },
  {
    id: 'privacy',
    label: 'Privacy and Pet Records',
    questions: [
      { q: 'What pet information can I store?', a: 'You can add basic pet information such as name, type, breed, birthday, chip number, vaccine notes and document notes.' },
      { q: 'Is my pet data private?', a: 'User and pet information is private by default and only visible to the account owner unless the user chooses to share it.' },
      { q: 'Will Hey Lola sell my pet data?', a: 'No. Hey Lola does not sell personal or pet data.' },
      { q: 'Can I delete my account or pet profile?', a: 'Yes. Users can request deletion of their account and pet profile data.' },
      { q: 'Are documents officially verified?', a: 'Not in Phase 1 unless explicitly marked as verified. Uploaded or entered records are user-provided until checked by a trusted party.' },
    ],
  },
];
