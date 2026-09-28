import Link from 'next/link'

const links = [
  ['Browse', '/browse'],
  ['Post Item', '/post'],
  ['Account', '/login'],
  ['Privacy Policy', '/privacy'],
]

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-muted sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-[60ch] space-y-1">
          <p>© {new Date().getFullYear()} BukiFinds · Student marketplace in Bukidnon</p>
          <p>A student project. Not officially affiliated with any school, college or university.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="font-medium hover:text-primary hover:underline">
              {label}
            </Link>
          ))}
          <a href="mailto:ajtheo176@gmail.com" className="font-medium hover:text-primary hover:underline">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  )
}
