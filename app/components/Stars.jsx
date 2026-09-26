import { StarIcon } from '@/app/components/icons'

// Read-only star row; the number is the accessible text. A star only fills from x.75 up,
// so 4.5 shows four stars next to "4.5" instead of overstating it as five.
export default function Stars({ rating, className = 'h-4 w-4' }) {
  const filled = Math.floor(rating + 0.25)
  return (
    <span className="inline-flex items-center gap-0.5 text-primary" role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} className={`${className} ${n <= filled ? '' : 'text-line'}`} fill={n <= filled ? 'currentColor' : 'none'} />
      ))}
    </span>
  )
}
