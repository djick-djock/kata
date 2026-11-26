/** Logo mark (docs/brand/logo/kata-mark.svg): three rounded blocks on pale sage. Colours are brand constants. */
export function KataMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 84 84" role="img" aria-label="Kata">
      <rect width="84" height="84" rx="22" fill="#E3EEDF" />
      <rect x="10" y="50" width="26" height="22" rx="8" fill="#1F2422" />
      <rect x="30" y="31" width="26" height="22" rx="8" fill="#E6C79C" />
      <rect x="48" y="12" width="26" height="22" rx="8" fill="#A3BFD9" />
    </svg>
  )
}
