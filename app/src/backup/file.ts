import type { BackupDocument } from './backup'

export function backupFileName(doc: BackupDocument): string {
  return `kata-backup-${doc.exportedAt.slice(0, 10)}.json`
}

/** Share sheet when the browser can share this file, else a normal download. Returns false if the user cancelled. */
export async function saveBackupFile(doc: BackupDocument): Promise<boolean> {
  const name = backupFileName(doc)
  const json = JSON.stringify(doc)
  const file = new File([json], name, { type: 'application/json' })
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Kata backup' })
      return true
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return false
      // Share failed for another reason: fall through to a download.
    }
  }
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return true
}
