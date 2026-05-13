# Hey Lola — Concierge image assets

The site loads concierge portraits from this folder. **All paths are
lowercase, no spaces.** When a file is missing the UI falls back to a
soft branded placeholder so nothing ever breaks — but the experience
is best with the full set.

```
public/pets/
├── lola/
│   ├── lola_pose_01.png   ← canonical hero / avatar (REQUIRED)
│   ├── lola_pose_02.png
│   ├── ...
│   ├── lola_pose_10.png
│   └── lola_head.png       ← cropped head shot (REQUIRED)
├── taco/
│   ├── taco_pose_01.png    ← canonical hero / avatar (REQUIRED)
│   ├── ...
│   ├── taco_pose_10.png
│   └── taco_head.png
├── nuc/
│   ├── nuc_pose_01.png     ← canonical hero / avatar (REQUIRED)
│   ├── ...
│   ├── nuc_pose_10.png
│   └── nuc_head.png
└── toby/
    ├── toby_pose_01.png    ← canonical hero / avatar (REQUIRED)
    ├── ...
    ├── toby_pose_10.png
    └── toby_head.png
```

## Minimum to ship

If you only have time for one pose per concierge, ship these eight:

- `lola/lola_pose_01.png` + `lola/lola_head.png`
- `taco/taco_pose_01.png` + `taco/taco_head.png`
- `nuc/nuc_pose_01.png` + `nuc/nuc_head.png`
- `toby/toby_pose_01.png` + `toby/toby_head.png`

With those eight files the home page, brand book, community feed,
foundation pages and concierge cards all render in full quality.

## Image specs

- **Format**: PNG with transparent background.
- **Size**: 1080 × 1080 pixels minimum (the site downscales as needed).
- **Crop**: dog centred, no extra padding around the silhouette.
- **`*_head.png`**: tight crop on the head + collar, square frame.

## Canonical brand details (do not deviate)

| Concierge | Breed | Signature | Accent |
| --- | --- | --- | --- |
| **Lola** | Toy Poodle | Orange collar + gold heart tag | #C4622D |
| **Taco** | Shiba Inu | Green cap + reading glasses | #6E8C5D |
| **Nuc** | Dachshund | Red cape + gold star tag | #C2412B |
| **Toby** | Golden Retriever | Sunglasses + blue bandana | #3F6B8C |

Lola is **always** the orange version — never the red-glasses variant.
