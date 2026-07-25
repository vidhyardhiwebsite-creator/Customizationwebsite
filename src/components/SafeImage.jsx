// Fallback placeholder — SVG data URI, no network request needed
const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f0fafa'/%3E%3Crect x='140' y='120' width='120' height='120' rx='12' fill='none' stroke='%234DB6AC' stroke-width='3' opacity='0.5'/%3E%3Cpath d='M170 180 L200 150 L230 180 L220 210 L180 210Z' fill='none' stroke='%234DB6AC' stroke-width='2' opacity='0.4'/%3E%3Ctext x='200' y='310' text-anchor='middle' fill='%234DB6AC' font-size='14' opacity='0.6' font-family='Georgia'%3EVidhyrathi%3C/text%3E%3C/svg%3E"

export default function SafeImage({ src, alt = '', className = '', ...props }) {
  const handleError = (e) => {
    if (e.target.src !== FALLBACK) {
      e.target.src = FALLBACK
    }
  }

  return (
    <img
      src={src || FALLBACK}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  )
}
