import { db, type KataDB } from './db'

/** Accepts only http(s) URLs. Returns the normalised URL or null. */
export function normaliseLink(input: string): string | null {
  const text = input.trim()
  if (!text) return null
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

export async function getExerciseLink(exerciseId: string, store: KataDB = db): Promise<string | undefined> {
  return (await store.exerciseLinks.get(exerciseId))?.url
}

/** Sets or replaces the personal video link. Returns false when the text is not a valid link. */
export async function setExerciseLink(exerciseId: string, input: string, store: KataDB = db): Promise<boolean> {
  const url = normaliseLink(input)
  if (!url) return false
  await store.exerciseLinks.put({ exerciseId, url })
  return true
}

export async function removeExerciseLink(exerciseId: string, store: KataDB = db): Promise<void> {
  await store.exerciseLinks.delete(exerciseId)
}
