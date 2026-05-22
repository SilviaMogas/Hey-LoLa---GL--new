/**
 * Hey Lola Foundation — partner shelters and their adoptable dogs.
 *
 * The Foundation currently operates in the Americas (New York). Each shelter
 * gets its own card on /foundation; inside, its dogs are listed as Hey Lola
 * profiles with an "Adopt" tag. Tapping Adopt opens a form; the submission is
 * sent to Hey Lola (foundation_interests) and distributed manually to the
 * shelter.
 *
 * Dog data is a starting snapshot from each partner's site. Listings change
 * often — keep the shelter `website` link so visitors can see live availability,
 * and refresh the dogs here as Hey Lola onboards them.
 */
export interface ShelterDog {
  id: string;
  name: string;
  breed: string;
  age: string;
  sex?: 'Male' | 'Female';
  photo?: string;
  bio: string;
}

export interface Shelter {
  id: string;
  name: string;
  city: string;
  region: string;
  blurb: string;
  website: string;
  dogs: ShelterDog[];
}

const DOG_FALLBACK = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80';

export const FOUNDATION_LOCATION = { region: 'Americas', city: 'New York' };

export const SHELTERS: Shelter[] = [
  {
    id: 'bobbi-and-the-strays',
    name: 'Bobbi and the Strays',
    city: 'Queens & Long Island, NY',
    region: 'Americas',
    blurb: 'A no-kill organization rescuing and rehabilitating orphaned, stray, abused and special-needs cats and dogs across New York City and Long Island.',
    website: 'https://bobbiandthestrays.org/adopt-a-dog/',
    dogs: [
      { id: 'bobbi-kobe', name: 'Kobe', breed: 'Mixed breed', age: 'Adult', sex: 'Male', photo: 'https://bobbiandthestrays.org/wp-content/uploads/2026/05/687790397_10231092517156832_6892784445848073292_n-881x1024.jpg', bio: 'Energetic and affectionate boy given up due to his owner’s illness, now searching for a loving home.' },
      { id: 'bobbi-kash', name: 'Kash', breed: 'Mixed breed', age: 'Young', sex: 'Male', photo: 'https://bobbiandthestrays.org/wp-content/uploads/2026/05/686932896_3108594562681428_24388995081482222_n-611x1024.jpg', bio: 'His smile will brighten your day! Given up through no fault of his own and ready for his family.' },
      { id: 'bobbi-pepper', name: 'Pepper', breed: 'Mixed breed', age: 'Adult', sex: 'Male', photo: 'https://bobbiandthestrays.org/wp-content/uploads/2026/05/690641748_10231095472270708_4305997250677485513_n-1024x689.jpg', bio: 'Pepper wants to sprinkle his joy all over his new family. Make his dreams come true!' },
    ],
  },
  {
    id: 'badass-animal-rescue',
    name: 'Badass Animal Rescue',
    city: 'Brooklyn, NY',
    region: 'Americas',
    blurb: 'A foster-based 501(c)3 saving and rehabilitating loving dogs from high-kill shelters since 2011 — over 4,000 dogs rescued.',
    website: 'https://badassanimalrescue.com/find-a-dog-new',
    dogs: [
      { id: 'badass-scout', name: 'Scout', breed: 'Mixed breed', age: 'Young', sex: 'Female', photo: DOG_FALLBACK, bio: 'Rescued from a high-kill shelter and thriving in foster care. Sweet, smart and ready for her forever family.' },
      { id: 'badass-finn', name: 'Finn', breed: 'Hound mix', age: 'Adult', sex: 'Male', photo: DOG_FALLBACK, bio: 'A gentle, easygoing boy who loves people. Looking for a calm home to call his own.' },
    ],
  },
  {
    id: 'ama-animal-rescue',
    name: 'AMA Animal Rescue',
    city: 'Brooklyn, NY',
    region: 'Americas',
    blurb: 'Angels for Mistreated Animals — a no-kill rescue in Brooklyn rehabilitating abused and injured dogs and cats and giving them loving futures.',
    website: 'https://amaanimalrescue.org/pet-type/dogs/',
    dogs: [
      { id: 'ama-penny', name: 'Penny', breed: 'Terrier mix', age: 'Adult', sex: 'Female', photo: DOG_FALLBACK, bio: 'Sweet and loving, Penny is looking for the forever home she has always deserved.' },
      { id: 'ama-theodore', name: 'Theodore', breed: 'Beagle', age: 'Adult', sex: 'Male', photo: DOG_FALLBACK, bio: 'A friendly, curious beagle with a big heart and a great nose for fun.' },
      { id: 'ama-simon', name: 'Simon', breed: 'Beagle', age: 'Adult', sex: 'Male', photo: DOG_FALLBACK, bio: 'Gentle and people-loving, Simon would make a wonderful companion.' },
    ],
  },
  {
    id: 'social-tees',
    name: 'Social Tees Animal Rescue',
    city: 'East Village, NYC',
    region: 'Americas',
    blurb: 'A foster-based, strictly no-kill rescue in the East Village that takes abandoned animals from kill shelters into safe homes, matching each one with the right family.',
    website: 'https://socialteesnyc.org/see-our-animals',
    dogs: [
      { id: 'star-loki', name: 'Loki', breed: 'Mixed breed', age: 'Young', sex: 'Male', photo: DOG_FALLBACK, bio: 'Saved from a kill shelter, Loki is playful, affectionate and ready to find his people.' },
      { id: 'star-nala', name: 'Nala', breed: 'Mixed breed', age: 'Adult', sex: 'Female', photo: DOG_FALLBACK, bio: 'A gentle soul who loves cozy company. She is looking for a calm, loving forever home.' },
    ],
  },
  {
    id: 'animal-haven',
    name: 'Animal Haven',
    city: 'Manhattan, NYC',
    region: 'Americas',
    blurb: 'Serving New York City since 1967 with top-quality care, behavior support and enrichment for abandoned cats and dogs across the Tri-State area.',
    website: 'https://animalhaven.org/adopt/dogs',
    dogs: [
      { id: 'ah-marcia', name: 'Marcia', breed: 'Mixed breed', age: '1 yr', sex: 'Female', photo: 'https://new-s3.shelterluv.com/profile-pictures/6d99fd93a8542ca16d0cf30e6f3a497a/0a63c68292bc9103202c5222036e9c25.jpg', bio: 'A sweet young girl ready to start her next chapter with a loving family.' },
      { id: 'ah-darcy', name: 'Darcy', breed: 'Puppy', age: '2 mo', sex: 'Female', photo: 'https://new-s3.shelterluv.com/profile-pictures/ad2a9e6d6516ec881f696ba41773f9f0/eb1765b94ad08b2324b8f58598ad653e.jpg', bio: 'A tiny, playful puppy with a whole life of love ahead of her.' },
      { id: 'ah-wiggly-diggly', name: 'Wiggly Diggly', breed: 'Senior', age: '14 yrs', sex: 'Female', photo: 'https://new-s3.shelterluv.com/profile-pictures/9ea04b5122ba2540b9c9e34c73f52b5d/9b1ac0de4ef8ff0a368b649482b61fd2.jpg', bio: 'A gentle senior sweetheart hoping for a soft place to land in her golden years.' },
    ],
  },
];

export function dogSlug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
