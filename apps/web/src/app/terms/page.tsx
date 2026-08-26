import Link from "next/link";

import { LegalPageShell } from "@/components/marketing/legal-page-shell";

export const metadata = {
  title: "Terms of Service | QUFO",
  description: "Terms governing the use of QUFO.",
};

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Legal"
      title="Terms of Service"
      description="These Terms govern your access to and use of QUFO and its business workflow services."
      updatedAt="August 26, 2026"
    >
      <section>
        <h2>1. Acceptance of These Terms</h2>

        <p>
          By creating an account, accessing, or using QUFO, you agree to these
          Terms of Service. If you are using QUFO on behalf of a business or
          organization, you represent that you have authority to accept these
          Terms on its behalf.
        </p>

        <p className="mt-3">
          If you do not agree with these Terms, you should not use QUFO.
        </p>
      </section>

      <section>
        <h2>2. About QUFO</h2>

        <p>
          QUFO is a business workflow management platform designed to help
          businesses manage customers, quotations, approvals, jobs, production
          progress, payments, customer tracking, reports, and related business
          activities.
        </p>

        <p className="mt-3">
          QUFO may add, modify, improve, or discontinue features as the platform
          evolves.
        </p>
      </section>

      <section>
        <h2>3. Accounts</h2>

        <p>
          You are responsible for providing accurate account information and
          maintaining the confidentiality of your login credentials.
        </p>

        <p className="mt-3">
          You are responsible for activities performed through your account and
          for ensuring that people you authorize to use your workspace use QUFO
          appropriately.
        </p>

        <p className="mt-3">
          You must notify us promptly if you believe your account has been
          accessed without authorization.
        </p>
      </section>

      <section>
        <h2>4. Your Business Data</h2>

        <p>
          <strong>
            You retain ownership of the business and customer data that you
            submit to QUFO.
          </strong>
        </p>

        <p className="mt-3">
          This may include customer information, quotation details, job
          records, payment records, notes, attachments, tracking information,
          and other information created through your workspace.
        </p>

        <p className="mt-3">
          You grant QUFO the limited rights necessary to host, store, process,
          transmit, back up, and display this data solely as needed to provide,
          secure, maintain, and improve the service.
        </p>
      </section>

      <section>
        <h2>5. Customer and Third-Party Information</h2>

        <p>
          You are responsible for ensuring that you have an appropriate legal
          basis or authorization to enter, store, and process information about
          your customers, employees, suppliers, or other individuals through
          QUFO.
        </p>

        <p className="mt-3">
          You should only collect information that is reasonably necessary for
          your legitimate business activities and applicable legal
          obligations.
        </p>
      </section>

      <section>
        <h2>6. Customer Links</h2>

        <p>
          QUFO may allow you to generate links for quotation review, customer
          approval, job tracking, or similar customer-facing functionality.
        </p>

        <p className="mt-3">
          You are responsible for sharing these links with the intended
          recipients and for protecting them from unauthorized disclosure.
        </p>

        <p className="mt-3">
          Customers using these links may not be required to create a QUFO
          account.
        </p>
      </section>

      <section>
        <h2>7. Payment Records</h2>

        <p>
          QUFO may allow you to record payments, deposits, balances, and other
          financial information associated with business transactions.
        </p>

        <p className="mt-3">
          Unless explicitly stated otherwise, QUFO records and organizes this
          information but does not itself act as your bank, accounting firm,
          payment processor, or financial adviser.
        </p>

        <p className="mt-3">
          You remain responsible for verifying the accuracy of financial
          records and complying with your accounting and tax obligations.
        </p>
      </section>

      <section>
        <h2>8. Free Trial and Subscription</h2>

        <p>
          Eligible new accounts may receive a free trial for the period
          displayed when registering or on the QUFO website.
        </p>

        <p className="mt-3">
          After the trial ends, continued access to paid functionality may
          require an active subscription.
        </p>

        <p className="mt-3">
          Current subscription prices and available plans are displayed on the
          QUFO website and may change for future purchases or renewals. Where
          required, we will provide appropriate notice of material pricing
          changes.
        </p>
      </section>

      <section>
        <h2>9. Cancellation</h2>

        <p>
          You may cancel your subscription according to the cancellation
          options available through QUFO or by contacting us.
        </p>

        <p className="mt-3">
          Cancellation prevents future renewals but does not automatically
          erase your business records.
        </p>

        <p className="mt-3">
          Any applicable refund rights will be determined by the terms shown at
          purchase and applicable law.
        </p>
      </section>

      <section>
        <h2>10. Acceptable Use</h2>

        <p>You may not use QUFO to:</p>

        <ul className="mt-3">
          <li>Violate applicable laws or regulations.</li>
          <li>Access another user&apos;s account without authorization.</li>
          <li>Upload malicious software or intentionally disrupt the service.</li>
          <li>
            Attempt to bypass security controls or probe the platform for
            unauthorized purposes.
          </li>
          <li>
            Use QUFO to distribute unlawful, fraudulent, abusive, or harmful
            content.
          </li>
          <li>
            Misuse customer information or personal data obtained through the
            platform.
          </li>
        </ul>
      </section>

      <section>
        <h2>11. Service Availability</h2>

        <p>
          We work to keep QUFO reliable and available, but we do not guarantee
          uninterrupted or error-free operation.
        </p>

        <p className="mt-3">
          The service may occasionally be unavailable because of maintenance,
          infrastructure failures, security incidents, third-party service
          disruptions, upgrades, or circumstances beyond our reasonable
          control.
        </p>
      </section>

      <section>
        <h2>12. Security</h2>

        <p>
          We use reasonable administrative and technical measures intended to
          protect information processed through QUFO.
        </p>

        <p className="mt-3">
          However, no internet-based service can guarantee absolute security.
          You are also responsible for using strong credentials and protecting
          access to your account.
        </p>
      </section>

      <section>
        <h2>13. Intellectual Property</h2>

        <p>
          QUFO, including its software, interface, branding, design, logo,
          documentation, and platform technology, remains the property of QUFO
          and its respective rights holders.
        </p>

        <p className="mt-3">
          These Terms do not transfer ownership of QUFO software or
          intellectual property to you.
        </p>
      </section>

      <section>
        <h2>14. Suspension or Termination</h2>

        <p>
          We may suspend or restrict access when reasonably necessary to
          protect the service, investigate suspected misuse, respond to legal
          requirements, address non-payment, or prevent harm to QUFO, its
          users, or third parties.
        </p>

        <p className="mt-3">
          Where practical and appropriate, we will attempt to provide notice
          before taking such action.
        </p>
      </section>

      <section>
        <h2>15. Disclaimer</h2>

        <p>
          QUFO is provided on an &quot;as available&quot; basis. To the extent
          permitted by applicable law, we do not guarantee that the service
          will meet every business requirement or that it will always operate
          without interruption or error.
        </p>
      </section>

      <section>
        <h2>16. Limitation of Liability</h2>

        <p>
          To the extent permitted by applicable law, QUFO will not be liable
          for indirect, incidental, special, consequential, or punitive damages
          arising from your use of the service.
        </p>

        <p className="mt-3">
          Nothing in these Terms excludes rights or liabilities that cannot
          legally be excluded.
        </p>
      </section>

      <section>
        <h2>17. Changes to These Terms</h2>

        <p>
          We may update these Terms as QUFO evolves or as legal and operational
          requirements change.
        </p>

        <p className="mt-3">
          When material changes are made, we will update the effective date
          and, where appropriate, provide additional notice.
        </p>
      </section>

      <section>
        <h2>18. Privacy</h2>

        <p>
          Our collection and processing of personal information is described in
          our{" "}
          <Link href="/privacy">
            Privacy Policy
          </Link>
          .
        </p>
      </section>

      <section>
        <h2>19. Contact</h2>

        <p>
          Questions regarding these Terms may be sent to:
        </p>

        <p className="mt-3">
          <strong>QUFO</strong>
          <br />
          Website:{" "}
          <a href="https://qufo.im">
            qufo.im
          </a>
          <br />
          Email:{" "}
          <a href="mailto:support@nxtasq.site">
            support@nxtasq.site
          </a>
        </p>
      </section>
    </LegalPageShell>
  );
}