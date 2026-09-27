import Link from 'next/link'
import { PURGE_AFTER_DAYS } from '@/lib/listings'
import { PRIVACY_EMAIL, PRIVACY_UPDATED, SITE_NAME } from '@/lib/site'

export const metadata = {
  title: 'Privacy Policy',
  description: `How ${SITE_NAME} collects, uses and protects your personal information under the Philippine Data Privacy Act of 2012 (RA 10173).`,
  alternates: { canonical: '/privacy' },
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-line pt-6">
      <h2 className="card-type text-xl font-bold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink/90">{children}</div>
    </section>
  )
}

function List({ children }) {
  return <ul className="list-disc space-y-1.5 pl-5 marker:text-muted">{children}</ul>
}

const mail = (
  <a href={`mailto:${PRIVACY_EMAIL}`} className="font-semibold text-primary hover:underline">
    {PRIVACY_EMAIL}
  </a>
)

export default function PrivacyPage() {
  return (
    <main className="flex-1 bg-surface py-8 sm:py-12">
      <article className="mx-auto w-full max-w-3xl rounded-2xl border border-line bg-white px-5 py-8 shadow-xs sm:px-10 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Data privacy</p>
        <h1 className="card-type mt-1 text-3xl font-extrabold text-ink sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted">Last updated {PRIVACY_UPDATED}</p>

        <p className="mt-6 text-[15px] leading-relaxed text-ink/90">
          {SITE_NAME} is a marketplace where college students in Bukidnon buy, sell and swap pre-loved school items. We
          respect your privacy and handle your personal information in line with the{' '}
          <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong>, its Implementing Rules and Regulations, and
          the issuances of the National Privacy Commission (NPC). This policy explains what we collect, why, who can see
          it, and the rights you have.
        </p>

        <nav aria-label="On this page" className="mt-6 rounded-xl bg-surface p-4 text-sm">
          <p className="font-semibold text-ink">On this page</p>
          <ol className="mt-2 grid list-decimal gap-1 pl-5 text-primary sm:grid-cols-2">
            {[
              ['collect', 'What we collect'],
              ['use', 'How we use it'],
              ['public', 'What other students can see'],
              ['share', 'Who we share it with'],
              ['keep', 'How long we keep it'],
              ['security', 'How we protect it'],
              ['rights', 'Your rights'],
              ['minors', 'Students under 18'],
              ['changes', 'Changes to this policy'],
              ['contact', 'Contact us'],
            ].map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="hover:underline">{label}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-8 space-y-8">
          <Section id="collect" title="1. What we collect">
            <p>We only collect what the marketplace needs to work:</p>
            <List>
              <li>
                <strong>Account details:</strong> your email address and password (stored scrambled by our sign-in
                provider; we can never see it). If you continue with Google, we receive your name, email address and
                Google profile photo.
              </li>
              <li>
                <strong>Profile:</strong> the name, university and profile photo you choose to show.
              </li>
              <li>
                <strong>Listings:</strong> item photos, title, description, price or swap wish, category, condition,
                size, university, meet-up spot, and the Facebook and Instagram usernames you add so buyers can message
                you. When you paste a Facebook, Messenger or Instagram link, our server opens it once to find your
                username; we keep only the username, not the link.
              </li>
              <li>
                <strong>Activity:</strong> listings you save, reviews you give or receive (rating, comment, your first
                name and the item title), and reports you file about a listing.
              </li>
              <li>
                <strong>Subscription payments:</strong> the screenshot of your GCash or GoTyme payment you upload, the
                amount, and the dates your request was sent, approved and expires.
              </li>
              <li>
                <strong>Technical data:</strong> your browser keeps a sign-in session so you stay logged in. Our hosting
                providers keep short-lived server logs (such as IP address and browser type) for security. We do{' '}
                <strong>not</strong> use advertising trackers or sell-your-data analytics.
              </li>
            </List>
          </Section>

          <Section id="use" title="2. How we use it">
            <List>
              <li>To create and secure your account and keep you signed in.</li>
              <li>To publish your listings and let buyers contact you by Messenger, Instagram or email.</li>
              <li>To show your seller profile, ratings and reviews so students can trade with confidence.</li>
              <li>To review reports and remove scams or inappropriate listings.</li>
              <li>To verify subscription payments and unlock the features you paid for.</li>
              <li>To fix problems and prevent abuse of the service.</li>
            </List>
            <p>
              We process your information based on your <strong>consent</strong>, which you give when you sign up and
              post, and because it is <strong>necessary to provide the service</strong> you asked for (Section 12 of RA
              10173). You can withdraw your consent at any time by deleting your listings or asking us to delete your
              account.
            </p>
          </Section>

          <Section id="public" title="3. What other students can see">
            <List>
              <li>
                <strong>Anyone, including search engines:</strong> your listings and their photos, your seller name,
                profile photo and university, your meet-up spot, your ratings and reviews, and the Facebook or Instagram
                username on your listings.
              </li>
              <li>
                <strong>Only signed-in students:</strong> the email address shown on a listing so buyers can reach you.
              </li>
              <li>
                <strong>Only you (and the site administrator):</strong> your saved listings, the reports you file, and
                your payment screenshots.
              </li>
            </List>
            <p>
              Please don’t put phone numbers, home addresses or other sensitive details in listing descriptions. Meet in
              public places on campus.
            </p>
          </Section>

          <Section id="share" title="4. Who we share it with">
            <p>We never sell your personal information. We share it only with services that run the site for us:</p>
            <List>
              <li>
                <strong>Supabase</strong> stores the database, sign-in accounts and photos.
              </li>
              <li>
                <strong>Vercel</strong> hosts the website.
              </li>
              <li>
                <strong>Google</strong> handles sign-in if you choose “Continue with Google”.
              </li>
              <li>
                <strong>Facebook, Messenger and Instagram</strong> receive the request when a buyer taps a message button,
                or when our server looks up a link you pasted.
              </li>
            </List>
            <p>
              These providers may store data on servers outside the Philippines. They are bound by their own privacy and
              security commitments, and we use them only for the purposes above. We may also disclose information when
              the law requires it, for example to comply with a lawful order.
            </p>
          </Section>

          <Section id="keep" title="5. How long we keep it">
            <List>
              <li>
                Listings marked sold or swapped, with their photos, are deleted automatically {PURGE_AFTER_DAYS} days
                later. Listings you delete are removed right away.
              </li>
              <li>Your account, profile, reviews and saved listings are kept until you ask us to delete your account.</li>
              <li>Payment records are kept while your account is active so we can answer questions about a payment.</li>
              <li>When you ask us to delete your account, we delete or anonymize your personal information.</li>
            </List>
          </Section>

          <Section id="security" title="6. How we protect it">
            <p>
              All traffic uses HTTPS. The database only lets each student read and change their own private records.
              Payment screenshots sit in a private storage area that only you and the administrator can open, and
              passwords are stored scrambled. No system is perfectly secure, so if we ever learn of a breach that puts
              your information at risk, we will notify you and the NPC as the law requires.
            </p>
          </Section>

          <Section id="rights" title="7. Your rights">
            <p>Under the Data Privacy Act, you have the right to:</p>
            <List>
              <li><strong>Be informed</strong> about how your data is collected and used (this policy).</li>
              <li><strong>Access</strong> the personal information we hold about you.</li>
              <li><strong>Correct</strong> wrong or outdated information. You can edit your profile and listings yourself.</li>
              <li><strong>Object</strong> to processing, or withdraw your consent.</li>
              <li><strong>Erase or block</strong> your information: delete your listings or ask us to delete your account.</li>
              <li><strong>Data portability:</strong> get a copy of your data in a common electronic format.</li>
              <li><strong>Claim damages</strong> if you are harmed by inaccurate, unlawfully obtained or misused data.</li>
              <li>
                <strong>File a complaint</strong> with the{' '}
                <a href="https://privacy.gov.ph" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                  National Privacy Commission
                </a>
                .
              </li>
            </List>
            <p>To use any of these rights, email us at {mail}. We will reply within 15 days.</p>
          </Section>

          <Section id="minors" title="8. Students under 18">
            <p>
              {SITE_NAME} is meant for college students. If you are under 18, please use it only with the permission of
              a parent or guardian. If you believe a minor gave us information without that permission, contact us and we
              will delete it.
            </p>
          </Section>

          <Section id="changes" title="9. Changes to this policy">
            <p>
              We may update this policy as the site changes. The date at the top shows the latest version. If a change
              affects how your information is used, we will let you know on the site before it takes effect.
            </p>
          </Section>

          <Section id="contact" title="10. Contact us">
            <p>
              For privacy questions, requests or complaints, email {mail}. You can also reach the National Privacy
              Commission at{' '}
              <a href="https://privacy.gov.ph" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                privacy.gov.ph
              </a>
              .
            </p>
          </Section>
        </div>

        <p className="mt-10 border-t border-line pt-6 text-sm text-muted">
          <Link href="/browse" className="font-semibold text-primary hover:underline">Back to browsing</Link>
        </p>
      </article>
    </main>
  )
}
