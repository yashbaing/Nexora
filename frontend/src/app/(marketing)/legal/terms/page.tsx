import type { Metadata } from "next";

import { PageHero } from "@/components/marketing/PageHero";
import { Prose } from "@/components/marketing/Prose";
import { Section } from "@/components/marketing/Section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "The terms that apply to the Nexora website and waitlist while the platform is in pre-launch testing.",
  alternates: { canonical: "/legal/terms" },
};

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of service"
        lead="Plain-language terms covering this website, the waitlist, and the pre-launch testnet application."
      />

      <Section className="pb-24">
        <Prose>
          <p>
            <strong>Last updated:</strong> this page describes {site.name} as it exists during
            pre-launch testing. A final agreement will be published before any mainnet launch,
            and you will be asked to accept it at that point.
          </p>

          <h2>1. What this covers</h2>
          <p>
            These terms apply to the {site.name} website, the waitlist, and the demonstration
            application available at {site.appPath}. They do not constitute a client agreement,
            a custody agreement, or a brokerage contract, because {site.name} is none of those
            things today.
          </p>

          <h2 id="risk">2. Risk disclosure</h2>
          <p>Please read this section carefully, because it is the part that matters most.</p>
          <ul>
            <li>
              <strong>This is pre-launch software.</strong> {site.name} runs on a test network.
              Contracts may be redeployed, balances may be reset, and features may change or be
              removed without notice.
            </li>
            <li>
              <strong>Equity tokens are not shares.</strong> A token tracks the price of a listed
              company. It grants no ownership, no voting rights, no dividend entitlement and no
              claim on the issuer.
            </li>
            <li>
              <strong>Prices shown are indicative.</strong> Quotes are derived from a
              market-linked feed for demonstration and may diverge from the price of the
              underlying security on its primary exchange.
            </li>
            <li>
              <strong>Digital assets are volatile.</strong> The value of anything you hold can
              fall to zero. Never commit funds you cannot afford to lose entirely.
            </li>
            <li>
              <strong>Self-custody is unforgiving.</strong> If you lose access to your wallet,
              your assets are unrecoverable. Neither {site.name} nor anyone else can restore them.
            </li>
            <li>
              <strong>Smart contracts carry risk.</strong> Code can contain defects. An audit
              reduces that risk; it does not eliminate it.
            </li>
          </ul>

          <h2>3. Not advice, not an offer</h2>
          <p>
            Nothing on this website is investment, legal, tax or financial advice, and nothing
            here is an offer to sell or a solicitation to buy any security or financial
            instrument in any jurisdiction. You are solely responsible for your own decisions and
            for determining whether using {site.name} is lawful where you live.
          </p>

          <h2>4. Eligibility and restrictions</h2>
          <p>
            You must be old enough to enter a binding contract in your jurisdiction. Access may be
            restricted or withdrawn in jurisdictions where offering these services would be
            unlawful, and you may not use {site.name} if you are subject to applicable sanctions.
          </p>

          <h2>5. Acceptable use</h2>
          <ul>
            <li>Do not attempt to attack, overload, or interfere with the service or its users.</li>
            <li>Do not use {site.name} to launder funds or to evade sanctions or tax obligations.</li>
            <li>Do not misrepresent your affiliation with {site.name}, including in referrals.</li>
            <li>Do not attempt to manipulate the waitlist queue through fraudulent signups.</li>
          </ul>

          <h2>6. Waitlist and referrals</h2>
          <p>
            Joining the waitlist reserves a place in a queue. It is not a contract, a guarantee of
            access, or a promise of any future token, allocation or reward. Referral positioning
            is a convenience feature and we may adjust or withdraw it — including disqualifying
            entries we believe to be fraudulent — at our discretion.
          </p>

          <h2>7. No warranty</h2>
          <p>
            The service is provided &quot;as is&quot; and &quot;as available&quot;, without
            warranties of any kind, express or implied. We do not warrant that it will be
            uninterrupted, error-free, or that any price, figure or balance displayed is accurate.
          </p>

          <h2>8. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, {site.name} and its contributors are not
            liable for any indirect, incidental, special or consequential losses, nor for lost
            profits, lost data, or loss of digital assets arising from your use of the service.
          </p>

          <h2>9. Changes</h2>
          <p>
            We may update these terms as the product develops. Material changes will be
            communicated to waitlist subscribers by email, and the updated version will always be
            available on this page.
          </p>

          <h2>10. Contact</h2>
          <p>
            Questions about these terms can be raised by replying to any {site.name} email, or
            through the channels linked in the footer of this site.
          </p>
        </Prose>
      </Section>
    </>
  );
}
