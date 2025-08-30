/**
 * Calculate Jaro-Winkler similarity between two strings
 * Returns a similarity score between 0 and 1
 */
export function jaroWinklerSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0

  const len1 = s1.length
  const len2 = s2.length

  if (len1 === 0 || len2 === 0) return 0.0

  const maxDist = Math.floor(Math.max(len1, len2) / 2) - 1
  const matchFlags1 = new Array(len1).fill(false)
  const matchFlags2 = new Array(len2).fill(false)

  // Count matches
  let matches = 0
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - maxDist)
    const end = Math.min(len2, i + maxDist + 1)

    for (let j = start; j < end; j++) {
      if (!matchFlags2[j] && s1[i] === s2[j]) {
        matchFlags1[i] = true
        matchFlags2[j] = true
        matches++
        break
      }
    }
  }

  if (matches === 0) return 0.0

  // Count transpositions
  let transpositions = 0
  let j = 0
  for (let i = 0; i < len1; i++) {
    if (matchFlags1[i]) {
      while (!matchFlags2[j]) j++
      if (s1[i] !== s2[j]) transpositions++
      j++
    }
  }

  const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3

  // Jaro-Winkler adjustment
  let prefixLength = 0
  const maxPrefix = Math.min(4, Math.min(len1, len2))
  for (let i = 0; i < maxPrefix; i++) {
    if (s1[i] === s2[i]) {
      prefixLength++
    } else {
      break
    }
  }

  const winklerAdjustment = 0.1 * prefixLength
  return jaro + winklerAdjustment * (1 - jaro)
}

export function matchFlavors() { return []; }
