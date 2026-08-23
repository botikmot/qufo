"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  Bug,
  Lightbulb,
  LoaderCircle,
  Mail,
  MessageCircleQuestion,
  Send,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  supportService,
} from "@/services/support.service";

import type {
  SupportMessageType,
} from "@/types/support";

const SUPPORT_TYPE_LABELS: Record<
  SupportMessageType,
  string
> = {
  GENERAL:
    "General inquiry",

  BUG:
    "Report a bug",

  FEATURE:
    "Suggest a feature",
};

export function SupportForm() {
  const [
    type,
    setType,
  ] =
    useState<SupportMessageType>(
      "GENERAL",
    );

  const [
    subject,
    setSubject,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    success,
    setSuccess,
  ] =
    useState<string | null>(
      null,
    );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !subject.trim() ||
      !message.trim()
    ) {
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const response =
        await supportService.send({
          type,
          subject:
            subject.trim(),
          message:
            message.trim(),
        });

      setSuccess(
        response.message,
      );

      setSubject("");
      setMessage("");
      setType("GENERAL");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send your message.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="qufo-surface overflow-hidden rounded-3xl">
      <div className="border-b border-[var(--qufo-border)] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-400/[0.08] text-emerald-300">
            <MessageCircleQuestion
              size={18}
            />
          </div>

          <div>
            <h2 className="font-medium text-white">
              Help & feedback
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Ask a question,
              report a problem, or
              suggest something
              that could make QUFO
              better.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-6 p-6"
      >
        {/* Support type */}
        <div>
          <label className="mb-2 block text-sm text-slate-400">
            What can we help
            with?
          </label>

          <Select
            value={type}
            onValueChange={(
              value,
            ) => {
              if (!value) {
                return;
              }

              setType(
                value as SupportMessageType,
              );
            }}
          >
            <SelectTrigger className="qufo-input h-auto! w-full">
              <SelectValue>
                {
                  SUPPORT_TYPE_LABELS[
                    type
                  ]
                }
              </SelectValue>
            </SelectTrigger>

            <SelectContent align="start">
              <SelectItem value="GENERAL">
                <Mail
                  size={15}
                />

                General inquiry
              </SelectItem>

              <SelectItem value="BUG">
                <Bug
                  size={15}
                />

                Report a bug
              </SelectItem>

              <SelectItem value="FEATURE">
                <Lightbulb
                  size={15}
                />

                Suggest a feature
              </SelectItem>
            </SelectContent>
          </Select>
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
            onChange={(event) =>
              setSubject(
                event.target.value,
              )
            }
            className="qufo-input"
            placeholder={
              type === "BUG"
                ? "Briefly describe the problem"
                : type ===
                    "FEATURE"
                  ? "What would you like QUFO to do?"
                  : "How can we help?"
            }
          />
        </div>

        {/* Message */}
        <div>
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
            rows={7}
            value={message}
            onChange={(event) =>
              setMessage(
                event.target.value,
              )
            }
            className="qufo-input resize-none"
            placeholder={
              type === "BUG"
                ? "Tell us what happened, what you expected, and how we can reproduce the issue..."
                : type ===
                    "FEATURE"
                  ? "Describe your idea and how it would help your workflow..."
                  : "Tell us how we can help..."
            }
          />

          <div className="mt-2 text-right text-xs text-slate-600">
            {message.length}
            /5000
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        )}

        <div className="flex justify-end border-t border-[var(--qufo-border)] pt-5">
          <button
            type="submit"
            disabled={
              sending ||
              !subject.trim() ||
              message.trim()
                .length < 10
            }
            className="flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <Send
                size={16}
              />
            )}

            {sending
              ? "Sending..."
              : "Send message"}
          </button>
        </div>
      </form>
    </div>
  );
}