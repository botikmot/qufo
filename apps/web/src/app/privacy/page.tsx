import { LegalPageShell } from "@/components/marketing/legal-page-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how QUFO collects, uses, stores, and protects personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="Privacy"
      title="Privacy Policy"
      description="This Privacy Policy explains how information is collected, used, stored, and protected when you use QUFO."
      updatedAt="August 26, 2026"
    >
      <section>
        <h2>1. Introduction</h2>

        <p>
          QUFO respects your privacy and is committed to handling personal
          information responsibly.
        </p>

        <p className="mt-3">
          This Privacy Policy explains the types of information processed
          through QUFO, why that information is processed, how it may be
          shared, and the choices and rights available to individuals.
        </p>
      </section>

      <section>
        <h2>2. Information We Collect</h2>

        <h3>Account information</h3>

        <p>
          When you register for QUFO, we may collect information such as your
          name, email address, account credentials, and related profile
          information.
        </p>

        <h3 className="mt-5">Business information</h3>

        <p>
          We may collect information about the business or organization
          associated with your workspace, including business name, contact
          information, address, and business settings.
        </p>

        <h3 className="mt-5">Information entered into your workspace</h3>

        <p>
          QUFO processes information that users enter while using the service,
          including customer details, quotations, jobs, notes, payment records,
          tracking updates, and related business records.
        </p>

        <h3 className="mt-5">Technical information</h3>

        <p>
          We may process technical information needed to operate and secure the
          service, such as IP address, browser or device information, login
          activity, error information, and security logs.
        </p>
      </section>

      <section>
        <h2>3. How We Use Information</h2>

        <p>We may use information to:</p>

        <ul className="mt-3">
          <li>Provide and maintain the QUFO service.</li>
          <li>Create and manage user accounts and workspaces.</li>
          <li>Process quotations, jobs, payments, and tracking information.</li>
          <li>Authenticate users and protect account security.</li>
          <li>Provide customer support.</li>
          <li>Improve performance, reliability, and functionality.</li>
          <li>Detect misuse, fraud, or security threats.</li>
          <li>Comply with legal and regulatory obligations.</li>
          <li>
            Communicate important account, service, security, or subscription
            information.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Business Customer Data</h2>

        <p>
          Businesses using QUFO may enter personal information relating to
          their own customers, employees, suppliers, or other contacts.
        </p>

        <p className="mt-3">
          The business using QUFO generally determines why this information is
          collected and how it is used for its business activities.
        </p>

        <p className="mt-3">
          QUFO processes this information as necessary to provide the platform
          and related services to that business.
        </p>
      </section>

      <section>
        <h2>5. Legal Basis and Privacy Principles</h2>

        <p>
          Where applicable, personal information is processed according to
          appropriate legal grounds and principles including transparency,
          legitimate purpose, and proportionality.
        </p>

        <p className="mt-3">
          Depending on the circumstances, processing may be necessary to
          provide the service, perform a contract, comply with legal
          obligations, protect legitimate interests, or occur with appropriate
          consent.
        </p>
      </section>

      <section>
        <h2>6. How Information May Be Shared</h2>

        <p>
          QUFO does not sell your personal information or your business
          customer data.
        </p>

        <p className="mt-3">
          Information may be shared with trusted infrastructure or service
          providers where reasonably necessary to operate QUFO, such as
          hosting, database, email, storage, security, monitoring, or payment
          services.
        </p>

        <p className="mt-3">
          We may also disclose information where required by law, legal
          process, or reasonably necessary to protect users, QUFO, or others
          from fraud, abuse, security threats, or unlawful activity.
        </p>
      </section>

      <section>
        <h2>7. Data Retention</h2>

        <p>
          Personal information is retained only for as long as reasonably
          necessary for the purposes described in this Policy, to provide the
          service, maintain legitimate business records, resolve disputes, or
          meet legal obligations.
        </p>

        <p className="mt-3">
          Retention periods may differ depending on the type of information and
          the reason it is being processed.
        </p>
      </section>

      <section>
        <h2>8. Security</h2>

        <p>
          QUFO uses reasonable administrative and technical safeguards
          intended to protect personal information against unauthorized
          access, disclosure, alteration, loss, or misuse.
        </p>

        <p className="mt-3">
          No online system can guarantee absolute security, and users are also
          responsible for protecting their account credentials and devices.
        </p>
      </section>

      <section>
        <h2>9. International Processing</h2>

        <p>
          QUFO may use infrastructure or service providers located in countries
          different from the country where you or your customers are located.
        </p>

        <p className="mt-3">
          Where information is transferred or processed internationally, we
          take reasonable steps intended to protect it in accordance with
          applicable legal requirements.
        </p>
      </section>

      <section>
        <h2>10. Your Privacy Rights</h2>

        <p>
          Depending on applicable law and your relationship with QUFO, you may
          have rights regarding your personal information, including rights to
          be informed, request access, request correction, object to certain
          processing, or request deletion or blocking where applicable.
        </p>

        <p className="mt-3">
          If your information was provided to QUFO by a business that uses our
          platform, you may need to contact that business first because it may
          control how your information is used.
        </p>
      </section>

      <section>
        <h2>11. Cookies and Similar Technologies</h2>

        <p>
          QUFO may use cookies or similar browser technologies that are
          necessary for authentication, security, preferences, and basic
          operation of the service.
        </p>

        <p className="mt-3">
          If optional analytics or marketing technologies are introduced, this
          Policy and any required consent controls may be updated accordingly.
        </p>
      </section>

      <section>
        <h2>12. Children&apos;s Privacy</h2>

        <p>
          QUFO is intended for businesses and professional users and is not
          designed as a service directed toward children.
        </p>
      </section>

      <section>
        <h2>13. Changes to This Privacy Policy</h2>

        <p>
          We may update this Privacy Policy when our services, practices, or
          legal obligations change.
        </p>

        <p className="mt-3">
          The latest version will be published on this page with an updated
          revision date.
        </p>
      </section>

      <section>
        <h2>14. Contact Us</h2>

        <p>
          If you have questions about this Privacy Policy or would like to make
          a privacy-related request, contact:
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