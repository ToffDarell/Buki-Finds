import { ShieldIcon } from '@/app/components/icons'

// Shown to buyers on the item page, under the contact button. BukiFinds has no payments or
// delivery of its own, so these are about the hand-off the students arrange themselves.
export default function SafetyTips({ delivery = false, className = '' }) {
  const tips = [
    'Meet in a busy, public spot on campus, during the day.',
    'Check the item before you pay. Count your change or confirm the GCash transfer together.',
    'Never share your password or a code sent to your phone.',
  ]
  if (delivery) tips.splice(2, 0, 'For delivery, agree on the shipping fee first and ask for more photos before you send money.')

  return (
    <div className={`rounded-md border border-line bg-surface px-3.5 py-3 ${className}`}>
      <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
        <ShieldIcon className="h-4 w-4 text-primary" />
        Stay safe when you meet up
      </p>
      <ul className="mt-2 flex flex-col gap-1.5 text-sm leading-relaxed text-muted">
        {tips.map((tip) => (
          <li key={tip} className="flex gap-2">
            <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
