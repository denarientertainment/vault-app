import { Link } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";

const gold = "#c9a84c";
const navy = "#0d0f1a";
const cardBg = "#111827";
const border = "#1e2a3a";
const textMuted = "#6b7280";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="text-lg font-bold mb-3" style={{ color: gold, fontFamily: "'Playfair Display', serif" }}>
      {title}
    </h2>
    <div className="text-gray-300 text-sm leading-relaxed space-y-3">{children}</div>
  </section>
);

export default function TermsPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: navy }}>
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: border }}>
        <div className="flex items-center gap-3">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663517971188/nf4Xt8otg4dvxmj2NL9EPH/vault-logo-shield_fae65497.png"
            alt="SecureVault"
            className="w-8 h-8 object-contain"
          />
          <div>
            <h1 className="text-lg font-bold font-['Playfair_Display'] text-white">SecureVault</h1>
            <p className="text-xs" style={{ color: textMuted }}>Terms of Service</p>
          </div>
        </div>
        <Link href="/" className="flex items-center gap-1 text-sm hover:text-white transition-colors" style={{ color: gold }}>
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: `${gold}20`, color: gold }}>
            <Shield size={11} /> Legal
          </div>
          <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Terms of Service
          </h1>
          <p className="text-sm" style={{ color: textMuted }}>
            Last updated: April 7, 2026. By purchasing or using SecureVault, you agree to these terms.
          </p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: cardBg, border: `1px solid ${border}` }}>

          <Section title="1. Product Overview">
            <p>
              SecureVault is a web-based password and secret management application. It uses AES-256 client-side encryption to store your passwords, notes, payment cards, identities, and images. All encryption and decryption occurs on your device — SecureVault's servers never have access to your unencrypted data.
            </p>
          </Section>

          <Section title="2. One-Time Purchase &amp; Lifetime Access">
            <p>
              SecureVault is sold as a <strong className="text-white">one-time payment of $4.99 USD</strong>. This grants you lifetime access to the application with no recurring subscription fees, no hidden charges, and no expiration.
            </p>
            <p>
              Your access is tied to the account used at the time of purchase. You may not transfer, resell, or share your license with other individuals.
            </p>
          </Section>

          <Section title="3. 30-Day Money-Back Guarantee">
            <p>
              We offer a <strong className="text-white">30-day money-back guarantee</strong> from the date of your purchase. If you are not satisfied with SecureVault for any reason within this window, you may contact us to request a full refund.
            </p>
            <p>
              <strong className="text-amber-400">Important Clause — Referral Reward Forfeiture:</strong> If you have received a referral reward (i.e., a $1 credit earned by successfully referring a friend who purchased SecureVault) at any point within your first 30 days of purchase, the 30-day money-back guarantee is <strong className="text-white">null and void</strong> and no longer applies to your account. By accepting a referral reward, you acknowledge that you have derived material benefit from the application and waive your right to a refund under this guarantee.
            </p>
            <p>
              Refund requests must be submitted via the contact information provided in Section 9. Refunds will be processed to the original payment method within 5–10 business days.
            </p>
          </Section>

          <Section title="4. Referral Program">
            <p>
              SecureVault offers a referral program that rewards you for inviting others to purchase the application. Here is how it works:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Each user receives a unique referral link and code upon signing in.</li>
              <li>When a person you referred completes a purchase using your link or code, you earn a <strong className="text-white">$1.00 USD credit</strong>.</li>
              <li>This reward applies to every successful referral — there is no cap on the number of friends you can refer.</li>
              <li>Referral credits accumulate in your account balance and can be requested as a payout via the Refer &amp; Earn section.</li>
              <li>Payout requests are processed manually and may take up to 10 business days.</li>
              <li>Referral rewards are non-transferable and have no cash value outside of the payout process.</li>
              <li>SecureVault reserves the right to withhold or reverse rewards in cases of suspected fraud, self-referral, or abuse of the referral system.</li>
            </ul>
          </Section>

          <Section title="5. User Responsibilities">
            <p>
              You are solely responsible for maintaining the security of your master passcode. SecureVault uses a zero-knowledge architecture — we cannot recover your passcode or your encrypted data if it is lost. Please store your passcode in a safe place and use the encrypted export feature to back up your vault regularly.
            </p>
            <p>
              You agree not to use SecureVault for any unlawful purpose, including but not limited to storing credentials obtained through unauthorized access to third-party systems.
            </p>
          </Section>

          <Section title="6. Data &amp; Privacy">
            <p>
              SecureVault stores your vault data in encrypted form on your device (via browser localStorage). Images uploaded to the Image Vault are stored in encrypted cloud storage (Amazon S3) and are accessible only through your authenticated session.
            </p>
            <p>
              We collect minimal account information (name, email) via OAuth login for authentication purposes only. We do not sell, rent, or share your personal information with third parties, except as required by law.
            </p>
          </Section>

          <Section title="7. Intellectual Property">
            <p>
              SecureVault and all associated content, design, code, and trademarks are the exclusive property of the SecureVault team. You may not copy, modify, distribute, or reverse-engineer any part of the application without prior written consent.
            </p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>
              SecureVault is provided "as is" without warranties of any kind. To the maximum extent permitted by law, SecureVault shall not be liable for any loss of data, loss of profits, or any indirect, incidental, or consequential damages arising from your use of the application. Your sole remedy for dissatisfaction is to discontinue use and request a refund within the guarantee window (subject to the conditions in Section 3).
            </p>
          </Section>

          <Section title="9. Changes to These Terms">
            <p>
              We reserve the right to update these Terms of Service at any time. Continued use of SecureVault after changes are posted constitutes your acceptance of the revised terms. We will make reasonable efforts to notify users of material changes.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              For refund requests, payout inquiries, or any questions about these terms, please use the contact form or payout request feature within the application. We aim to respond within 2 business days.
            </p>
          </Section>
        </div>

        <p className="text-center text-xs mt-8" style={{ color: textMuted }}>
          © 2026 SecureVault. All rights reserved.
        </p>
      </main>
    </div>
  );
}
