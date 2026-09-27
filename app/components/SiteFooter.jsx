import Link from 'next/link'
import { SITE_NAME } from '@/lib/site'

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-5 text-xs text-muted sm:px-6">
        <p>© {new Date().getFullYear()} {SITE_NAME} · Student marketplace in Bukidnon</p>
        <nav aria-label="Legal" className="flex gap-4">
          <Link href="/privacy" className="font-medium hover:text-primary hover:underline">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  )
}
