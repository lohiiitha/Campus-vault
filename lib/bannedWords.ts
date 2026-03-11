export const BANNED_WORDS = [
  'gun', 'guns', 'pistol', 'rifle', 'revolver', 'shotgun', 'firearm', 'ammo', 'ammunition', 'bullet',
  'drug', 'drugs', 'weed', 'marijuana', 'cocaine', 'heroin', 'meth', 'narcotics', 'cannabis', 'ganja',
  'alcohol', 'whiskey', 'vodka', 'beer', 'liquor', 'wine',
  'cigar', 'cigars', 'cigarette', 'cigarettes', 'tobacco', 'vape',
  'knife', 'knives', 'blade', 'dagger', 'weapon', 'weapons', 'explosive', 'bomb',
  'porn', 'adult', 'xxx',
]

// Checks whole words only — avoids false positives like "medication" matching "meds"
export function containsBannedWord(text: string): string | null {
  const lower = text.toLowerCase()
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    if (regex.test(lower)) return word
  }
  return null
}
