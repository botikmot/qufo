import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "What is QUFO?",
    answer:
      "QUFO is a business workflow management platform that helps you organize customers, quotations, approvals, jobs, payments, customer tracking, and reports in one connected workspace.",
  },
  {
    question: "Who is QUFO for?",
    answer:
      "QUFO is designed for service and production businesses such as printing shops, signage businesses, fabrication shops, customized product businesses, and other companies that manage customer orders from quotation to completion.",
  },
  {
    question: "How does the 30-day free trial work?",
    answer:
      "You can use the complete QUFO workflow for 30 days without entering a credit card. This gives you time to test QUFO using your actual business workflow before deciding whether to continue.",
  },
  {
    question: "What happens after the free trial?",
    answer:
      "After the trial, you can continue using QUFO under the available monthly subscription plan. You can cancel if QUFO is not the right fit for your business.",
  },
  {
    question: "Is there a setup fee?",
    answer:
      "No. QUFO currently has no setup fee, and you can start creating your workspace and business records during your free trial.",
  },
  {
    question: "Do my customers need a QUFO account?",
    answer:
      "No. Customers can review quotations, approve or request changes, and track job progress through secure customer links without creating their own QUFO account.",
  },
  {
    question: "Can QUFO handle partial payments?",
    answer:
      "Yes. QUFO can record deposits, partial payments, and full payments while automatically keeping track of the total paid and remaining balance for each job.",
  },
  {
    question: "Can customers track their orders?",
    answer:
      "Yes. QUFO can generate a customer tracking link that shows customer-facing job progress, status updates, and messages without exposing your internal business notes.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. QUFO does not require a long-term contract under the current subscription model.",
  },
  {
    question: "Who owns the business data stored in QUFO?",
    answer:
      "You retain ownership of the business and customer data you enter into QUFO. QUFO provides the platform used to store and manage that information.",
  },
];

export function FaqSection() {
  return (
    <section
      id="faq"
      className="relative border-t border-white/[0.05] py-24 sm:py-28"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[32rem] w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.04] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.07]">
            <HelpCircle className="size-5 text-cyan-300" />
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Frequently Asked Questions
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Questions?
            <span className="block text-slate-500">
              We&apos;ve got answers.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400">
            Everything you need to know before trying QUFO with your business.
          </p>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-12 max-w-3xl space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] transition hover:border-white/[0.12] open:border-emerald-400/15 open:bg-white/[0.035]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-5 text-left sm:px-6">
                <span className="text-sm font-medium leading-6 text-slate-200 sm:text-base">
                  {faq.question}
                </span>

                <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03]">
                  <span className="absolute h-px w-3 bg-slate-400 transition group-open:bg-emerald-300" />

                  <span className="absolute h-3 w-px bg-slate-400 transition-transform duration-200 group-open:rotate-90 group-open:opacity-0" />
                </span>
              </summary>

              <div className="border-t border-white/[0.05] px-5 py-5 sm:px-6">
                <p className="text-sm leading-7 text-slate-500">
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </div>

        {/* Bottom reassurance */}
        <div className="mx-auto mt-10 max-w-2xl text-center">
          <p className="text-sm text-slate-500">
            Still have questions? Try QUFO free and see how it fits your
            actual workflow.
          </p>
        </div>
      </div>
    </section>
  );
}