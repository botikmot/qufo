"use client";

import { FormEvent, useState } from "react";

import {
  Bug,
  CheckCircle2,
  Lightbulb,
  LoaderCircle,
  Mail,
  MessageCircleQuestion,
  Send,
  TriangleAlert,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { supportService } from "@/services/support.service";

import type { SupportMessageType } from "@/types/support";

const SUPPORT_TYPE_LABELS: Record<SupportMessageType, string> = {
  GENERAL: "General inquiry",
  BUG: "Report a bug",
  FEATURE: "Suggest a feature",
};

const SUPPORT_MODE = process.env.NEXT_PUBLIC_SUPPORT_MODE ?? "api";

const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@qufo.im";

export function SupportForm() {
  const [type, setType] = useState<SupportMessageType>("GENERAL");

  const [subject, setSubject] = useState("");

  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanSubject = subject.trim();

    const cleanMessage = message.trim();

    if (!cleanSubject || !cleanMessage) {
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      if (SUPPORT_MODE === "mailto") {
        const typeLabel = SUPPORT_TYPE_LABELS[type];

        const emailSubject = encodeURIComponent(
          `[QUFO Support] ${typeLabel} - ${cleanSubject}`,
        );

        const emailBody = encodeURIComponent(
          [
            `Support type: ${typeLabel}`,
            "",
            cleanMessage,
            "",
            "Sent from QUFO Self-Hosted",
          ].join("\n"),
        );

        window.location.href =
          `mailto:${SUPPORT_EMAIL}` +
          `?subject=${emailSubject}` +
          `&body=${emailBody}`;

        return;
      }

      const response = await supportService.send({
        type,
        subject: cleanSubject,
        message: cleanMessage,
      });

      setSuccess(response.message);

      setSubject("");
      setMessage("");
      setType("GENERAL");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to send your message.",
      );
    } finally {
      setSending(false);
    }
  }

  const typeDescription =
    type === "BUG"
      ? "Tell us what happened, what you expected, and how we can reproduce it."
      : type === "FEATURE"
        ? "Describe the idea and how it would improve your workflow."
        : "Ask a question about QUFO or your workspace.";

  return (
    <section className="qufo-surface min-w-0 overflow-hidden rounded-2xl">
      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className="flex items-center gap-3 border-b border-[var(--qufo-border)] px-5 py-4 sm:px-6">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-300">
          <MessageCircleQuestion size={18} />
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-white">Help & feedback</h2>

          <p className="mt-1 text-xs text-slate-500">
            {SUPPORT_MODE === "mailto"
              ? "Contact QUFO support using your email application."
              : "Ask a question, report a problem, or suggest something that could make QUFO better."}
          </p>
        </div>
      </div>

      {/* =========================================================
          FORM
      ========================================================= */}

      <form onSubmit={handleSubmit} className="p-5 sm:p-6">
        <div className="grid min-w-0 gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          {/* =====================================================
              LEFT
          ===================================================== */}

          <div className="min-w-0 space-y-5">
            {/* Support type */}

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                What can we help with?
              </label>

              <Select
                value={type}
                onValueChange={(value) => {
                  if (!value) {
                    return;
                  }

                  setType(value as SupportMessageType);
                }}
              >
                <SelectTrigger className="qufo-input h-11! w-full">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {type === "BUG" ? (
                        <Bug size={15} />
                      ) : type === "FEATURE" ? (
                        <Lightbulb size={15} />
                      ) : (
                        <Mail size={15} />
                      )}

                      {SUPPORT_TYPE_LABELS[type]}
                    </div>
                  </SelectValue>
                </SelectTrigger>

                <SelectContent align="start">
                  <SelectItem value="GENERAL">
                    <Mail size={15} />
                    General inquiry
                  </SelectItem>

                  <SelectItem value="BUG">
                    <Bug size={15} />
                    Report a bug
                  </SelectItem>

                  <SelectItem value="FEATURE">
                    <Lightbulb size={15} />
                    Suggest a feature
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="mt-3 rounded-xl border border-cyan-400/10 bg-cyan-400/[0.025] px-4 py-3">
                <div className="flex gap-2.5">
                  <MessageCircleQuestion
                    size={15}
                    className="mt-0.5 shrink-0 text-cyan-300"
                  />

                  <p className="text-xs leading-5 text-slate-500">
                    {typeDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Subject */}

            <div>
              <label
                htmlFor="support-subject"
                className="mb-2 block text-sm text-slate-400"
              >
                Subject
              </label>

              <input
                id="support-subject"
                required
                minLength={3}
                maxLength={150}
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="qufo-input h-11"
                placeholder={
                  type === "BUG"
                    ? "Briefly describe the problem"
                    : type === "FEATURE"
                      ? "What would you like QUFO to do?"
                      : "How can we help?"
                }
              />

              <p className="mt-2 text-xs text-slate-600">
                Keep it short so the request is easy to identify.
              </p>
            </div>
          </div>

          {/* =====================================================
              RIGHT
          ===================================================== */}

          <div className="min-w-0">
            <label
              htmlFor="support-message"
              className="mb-2 block text-sm text-slate-400"
            >
              Message
            </label>

            <textarea
              id="support-message"
              required
              minLength={10}
              maxLength={5000}
              rows={9}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="qufo-input min-h-[230px] resize-none"
              placeholder={
                type === "BUG"
                  ? "Tell us what happened, what you expected, and how we can reproduce the issue..."
                  : type === "FEATURE"
                    ? "Describe your idea and how it would help your workflow..."
                    : "Tell us how we can help..."
              }
            />

            <div className="mt-2 flex items-center justify-between gap-4">
              <p className="text-xs text-slate-600">
                Maximum 5,000 characters.
              </p>

              <span className="shrink-0 text-xs text-slate-600">
                {message.length}/5000
              </span>
            </div>
          </div>
        </div>

        {/* =======================================================
            FEEDBACK
        ======================================================= */}

        {(error || success) && (
          <div className="mt-5">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
                <TriangleAlert size={16} className="mt-0.5 shrink-0" />

                {error}
              </div>
            )}

            {!error && success && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3 text-sm text-emerald-300">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />

                {success}
              </div>
            )}
          </div>
        )}

        {/* =======================================================
            FOOTER
        ======================================================= */}

        <div className="mt-5 flex flex-col gap-3 border-t border-[var(--qufo-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-600">
            {SUPPORT_MODE === "mailto"
              ? `Opens your email app and addresses ${SUPPORT_EMAIL}.`
              : "Your message will be sent securely to QUFO support."}
          </p>

          <button
            type="submit"
            disabled={sending || !subject.trim() || message.trim().length < 10}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}

            {sending
              ? "Sending..."
              : SUPPORT_MODE === "mailto"
                ? "Email support"
                : "Send message"}
          </button>
        </div>
      </form>
    </section>
  );
}
