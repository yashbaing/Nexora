import type { Metadata } from "next";

import { PageHero } from "@/components/marketing/PageHero";
import { Prose } from "@/components/marketing/Prose";
import { Section } from "@/components/marketing/Section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "Exactly what Nexora stores when you join the waitlist, why, and how to have it deleted.",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy policy"
        lead="Short version: an email address and a referral code, used to run the waitlist and tell you when it's your turn. Nothing sold, nothing shared for advertising."
      />

      <Section className="pb-24">
        <Prose>
          <h2>What we collect</h2>
          <ul>
            <li>
              <strong>Your email address</strong>, because a waitlist without a way to reach you
              is not a waitlist.
            </li>
            <li>
              <strong>A referral code</strong> generated for you, plus the code of whoever
              referred you, so queue positions can be calculated.
            </li>
            <li>
              <strong>Which page you signed up from</strong> and the time you signed up, so we can
              tell which parts of the site are working.
            </li>
          </ul>
          <p>
            We do not ask for your name, phone number, address, date of birth, or any payment
            details, and we do not require you to connect a wallet to join the waitlist.
          </p>

          <h2>What we do with it</h2>
          <ul>
            <li>Send you your early-access invitation when your cohort comes up.</li>
            <li>Send occasional product updates — at most monthly, with a one-click unsubscribe.</li>
            <li>Calculate your position in the queue, including any referral credit.</li>
            <li>Understand aggregate signup volume.</li>
          </ul>
          <p>
            We do not sell your data. We do not share it with advertisers or data brokers. We do
            not use it to build a profile of you.
          </p>

          <h2>Stored in your browser</h2>
          <p>
            When you join, your queue position and referral code are saved in your browser&apos;s
            local storage so the site can greet you correctly on your next visit. That entry is
            local to your device and clearing your browser data removes it. We do not set
            advertising or cross-site tracking cookies on this website.
          </p>

          <h2>The trading application</h2>
          <p>
            The demonstration application at {site.appPath} is separate from this website. When you
            use it, your wallet address and on-chain transactions are recorded — but that is a
            property of public blockchains, not something {site.name} adds. Anything written to a
            blockchain is permanent and publicly readable by anyone, and cannot be deleted by us
            or by you. Please keep that in mind before transacting.
          </p>

          <h2>How long we keep it</h2>
          <p>
            Waitlist records are kept until launch is complete or until you ask us to remove
            them, whichever comes first. Unsubscribing stops the emails; asking for deletion
            removes the record entirely.
          </p>

          <h2>Your choices</h2>
          <ul>
            <li>Unsubscribe from any email we send, using the link in that email.</li>
            <li>
              Ask us to delete your waitlist record. Reply to any {site.name} email and we will
              remove it, which also gives up your queue position.
            </li>
            <li>Ask us for a copy of what we hold about you.</li>
          </ul>

          <h2>Third parties</h2>
          <p>
            This site is served by a web host, and waitlist entries are stored in a managed
            database. Those providers process data on our behalf under their own security
            commitments. Market prices shown on this site are fetched from a third-party market
            data feed; that request does not carry your email address.
          </p>

          <h2>Children</h2>
          <p>
            {site.name} is not intended for anyone under the age at which they can enter a binding
            contract in their jurisdiction, and we do not knowingly collect their data.
          </p>

          <h2>Changes</h2>
          <p>
            If this policy changes in a way that affects how your data is used, we will email
            waitlist subscribers before the change takes effect.
          </p>
        </Prose>
      </Section>
    </>
  );
}
