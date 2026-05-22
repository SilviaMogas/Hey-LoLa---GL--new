/**
 * Hey Lola Foundation — partner shelters and their adoptable dogs.
 *
 * The Foundation currently operates in the Americas (New York). Each shelter
 * gets its own card on /foundation; inside, its dogs are listed as Hey Lola
 * profiles with an "Adopt" tag. Tapping Adopt opens a form; the submission is
 * sent to Hey Lola (foundation_interests) and distributed manually to the
 * shelter.
 *
 * TODO(Silvia): replace the 5 placeholder shelter names + dogs below with the
 * real ones. Keep the shape; just swap name/blurb/dogs.
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
  dogs: ShelterDog[];
}

const DOG_FALLBACK = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80';

export const FOUNDATION_LOCATION = { region: 'Americas', city: 'New York' };

export const SHELTERS: Shelter[] = [
  {
    id: 'shelter-1',
    name: 'Shelter One', // TODO: real name
    city: 'New York',
    region: 'Americas',
    blurb: 'A Hey Lola rescue partner in New York.',
    dogs: [
      { id: 'shelter-1-dog-1', name: 'Coco', breed: 'Mixed breed', age: '2 yrs', sex: 'Female', photo: DOG_FALLBACK, bio: 'Gentle, playful and great with other dogs. Loves long park mornings.' },
      { id: 'shelter-1-dog-2', name: 'Rocky', breed: 'Labrador mix', age: '4 yrs', sex: 'Male', photo: DOG_FALLBACK, bio: 'Calm, loyal and house-trained. Perfect companion for a relaxed home.' },
    ],
  },
  {
    id: 'shelter-2',
    name: 'Shelter Two',
    city: 'New York',
    region: 'Americas',
    blurb: 'A Hey Lola rescue partner in New York.',
    dogs: [
      { id: 'shelter-2-dog-1', name: 'Maple', breed: 'Terrier mix', age: '1 yr', sex: 'Female', photo: DOG_FALLBACK, bio: 'Curious and affectionate. Still learning the world and full of joy.' },
    ],
  },
  {
    id: 'shelter-3',
    name: 'Shelter Three',
    city: 'New York',
    region: 'Americas',
    blurb: 'A Hey Lola rescue partner in New York.',
    dogs: [
      { id: 'shelter-3-dog-1', name: 'Bruno', breed: 'Shepherd mix', age: '3 yrs', sex: 'Male', photo: DOG_FALLBACK, bio: 'Smart and protective, knows his basic commands. Bonds deeply.' },
    ],
  },
  {
    id: 'shelter-4',
    name: 'Shelter Four',
    city: 'New York',
    region: 'Americas',
    blurb: 'A Hey Lola rescue partner in New York.',
    dogs: [
      { id: 'shelter-4-dog-1', name: 'Luna', breed: 'Poodle mix', age: '2 yrs', sex: 'Female', photo: DOG_FALLBACK, bio: 'Soft, hypoallergenic coat and a sweet temperament. Adores cuddles.' },
    ],
  },
  {
    id: 'shelter-5',
    name: 'Shelter Five',
    city: 'New York',
    region: 'Americas',
    blurb: 'A Hey Lola rescue partner in New York.',
    dogs: [
      { id: 'shelter-5-dog-1', name: 'Milo', breed: 'Beagle', age: '5 yrs', sex: 'Male', photo: DOG_FALLBACK, bio: 'Friendly and easygoing. Great with kids and other pets.' },
    ],
  },
];

export function dogSlug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
