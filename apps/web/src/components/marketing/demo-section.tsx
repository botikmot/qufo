import {
  CheckCircle2,
  CirclePlay,
  Clock3,
  MonitorPlay,
} from "lucide-react";

export function DemoSection() {
  return (
    <section
      id="demo"
      className="relative scroll-mt-20 overflow-hidden py-24 sm:py-28"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[34rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.06] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.07] shadow-[0_0_30px_rgba(34,211,238,.08)]">
            <CirclePlay className="size-6 text-cyan-300" />
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Product Demo
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            See QUFO in action.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400">
            See how a customer transaction moves from quotation to approval,
            production, payment, tracking, and completion — all inside one
            connected workflow.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500 sm:text-sm">
            <span className="flex items-center gap-2">
              <Clock3 className="size-4 text-emerald-400" />
              About 3 minutes
            </span>

            <span className="flex items-center gap-2">
              <MonitorPlay className="size-4 text-cyan-400" />
              Real QUFO workflow
            </span>

            <span className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-blue-400" />
              No sign-up required to watch
            </span>
          </div>
        </div>

        {/* Video */}
        <div className="relative mx-auto mt-12 max-w-6xl">
          <div className="absolute inset-x-[12%] bottom-[-3rem] h-28 rounded-full bg-cyan-400/[0.08] blur-[90px]" />

          <div className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.10] bg-white/[0.035] p-1.5 shadow-[0_40px_120px_rgba(0,0,0,.65)] backdrop-blur-xl sm:rounded-[2rem] sm:p-3">
            <div className="overflow-hidden rounded-[1.15rem] border border-white/[0.07] bg-black sm:rounded-[1.5rem]">
              {/* Browser style top bar */}
              <div className="flex h-9 items-center border-b border-white/[0.06] bg-[#091522] px-3 sm:h-11 sm:px-4">
                <div className="flex gap-1.5">
                  <span className="size-2 rounded-full bg-white/10 sm:size-2.5" />
                  <span className="size-2 rounded-full bg-white/10 sm:size-2.5" />
                  <span className="size-2 rounded-full bg-white/10 sm:size-2.5" />
                </div>

                <div className="mx-auto hidden rounded-lg border border-white/[0.05] bg-black/10 px-10 py-1 text-[10px] text-slate-600 sm:block">
                  qufo.im
                </div>
              </div>

              <video
                controls
                playsInline
                preload="metadata"
                poster="/images/qufo-dashboard2.png"
                className="aspect-video w-full bg-black object-contain"
              >
                <source src="/videos/qufo-demo.mp4" type="video/mp4" />

                Your browser does not support the video element.
              </video>
            </div>
          </div>
        </div>

        {/* Bottom message */}
        <div className="mx-auto mt-10 max-w-3xl text-center">
          <p className="text-sm leading-7 text-slate-500">
            Customer
            <span className="mx-2 text-emerald-400">→</span>
            Quotation
            <span className="mx-2 text-emerald-400">→</span>
            Approval
            <span className="mx-2 text-emerald-400">→</span>
            Job
            <span className="mx-2 text-emerald-400">→</span>
            Payment
            <span className="mx-2 text-emerald-400">→</span>
            Completion
          </p>
        </div>
      </div>
    </section>
  );
}