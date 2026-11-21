import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  Code2,
  Layers3,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";

const capabilities = [
  {
    icon: MessageSquareText,
    number: "01",
    title: "Think through ideas",
    description: "Turn rough thoughts into clear explanations, plans, and useful next steps.",
  },
  {
    icon: Code2,
    number: "02",
    title: "Build with code",
    description: "Explore code, debug problems, and move from concept to implementation.",
  },
  {
    icon: BrainCircuit,
    number: "03",
    title: "Create with focus",
    description: "Draft, rewrite, research, and shape your work without losing momentum.",
  },
];

const workflow = [
  ["01", "Ask naturally", "Start with a question, a rough idea, or a problem you need to solve."],
  ["02", "Choose your model", "Switch between available AI models to match the task at hand."],
  ["03", "Keep moving", "Continue the conversation, refine the result, and save your chat history."],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07070A] text-[#F5F3FA] selection:bg-violet-500/40">
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute left-1/2 top-[-28rem] h-[46rem] w-[64rem] -translate-x-1/2 rounded-full bg-violet-700/15 blur-[140px]" />
        <div className="absolute right-[-18rem] top-[52rem] h-[30rem] w-[30rem] rounded-full bg-indigo-700/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-500/15 text-violet-200 shadow-[0_0_32px_rgba(124,58,237,.2)]">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-[-0.05em]">AETHER<span className="text-violet-400">.ai</span></span>
        </Link>

        <nav className="hidden items-center gap-9 text-sm text-white/55 md:flex">
          <a href="#capabilities" className="transition hover:text-white">Capabilities</a>
          <a href="#workflow" className="transition hover:text-white">How it works</a>
          <a href="#about" className="transition hover:text-white">About</a>
        </nav>

        <Link href="/chat" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-medium transition hover:border-violet-300/40 hover:bg-violet-500/10">
          Open workspace <ArrowUpRight className="h-4 w-4" />
        </Link>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100svh-84px)] w-full max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:px-12 lg:pb-28 lg:pt-10">
        <div className="max-w-3xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/[0.07] px-3.5 py-2 text-xs font-medium tracking-wide text-violet-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)]" />
            YOUR AI WORKSPACE
            <span className="text-white/25">/</span>
            BUILT TO THINK WITH YOU
          </div>

          <h1 className="max-w-4xl text-[clamp(3.3rem,8vw,6.8rem)] font-semibold leading-[.98] tracking-[-.075em]">
            Make space for
            <span className="block bg-gradient-to-r from-violet-200 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">better thinking.</span>
          </h1>

          <p className="mt-8 max-w-xl text-base leading-8 text-white/50 sm:text-lg">
            A focused AI workspace for exploring ideas, solving problems, and turning conversations into meaningful progress.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/chat" className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-[#8152F3] px-7 text-sm font-semibold text-white shadow-[0_12px_45px_rgba(124,58,237,.28)] transition hover:-translate-y-0.5 hover:bg-[#925FFF]">
              Start a conversation <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <a href="#capabilities" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-7 text-sm font-medium text-white/75 transition hover:border-white/20 hover:bg-white/[0.07]">
              Explore capabilities
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-white/[0.08] pt-7 text-xs text-white/40">
            <span className="inline-flex items-center gap-2"><Zap className="h-4 w-4 text-violet-300" /> Streaming responses</span>
            <span className="inline-flex items-center gap-2"><Layers3 className="h-4 w-4 text-violet-300" /> Multiple models</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-violet-300" /> Private API handling</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[560px]">
          <div className="absolute -inset-8 rounded-[3rem] bg-violet-600/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.12] bg-[#101016]/90 p-3 shadow-[0_35px_120px_rgba(0,0,0,.55)] backdrop-blur-xl sm:p-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-3 pb-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-400/80" />
                <span className="h-2 w-2 rounded-full bg-amber-300/80" />
                <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
              </div>
              <span className="text-[10px] font-medium tracking-[.2em] text-white/35">AETHER WORKSPACE</span>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] text-emerald-300">READY</span>
            </div>

            <div className="flex items-center justify-between px-3 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/15 text-violet-200"><Sparkles className="h-4 w-4" /></span>
                <div><p className="text-xs font-semibold">New conversation</p><p className="mt-0.5 text-[10px] text-white/35">AETHER assistant</p></div>
              </div>
              <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[10px] text-white/55">deepseek-v4-flash</span>
            </div>

            <div className="space-y-5 px-3 pb-5 pt-7 sm:px-5">
              <div className="ml-auto max-w-[84%] rounded-2xl rounded-br-md border border-violet-300/20 bg-violet-500/20 px-4 py-3 text-sm leading-6 text-violet-50">
                Help me turn a complex idea into a clear product plan.
              </div>
              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-200"><Sparkles className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-sm leading-7 text-white/75">Let’s break it down into three parts: the problem, the people you’re building for, and the smallest useful version of the product.</p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {["Problem", "Audience", "MVP"].map((item) => <div key={item} className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-2 py-3 text-center text-[11px] font-medium text-white/60">{item}</div>)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-2 mb-2 flex items-center justify-between rounded-2xl border border-white/10 bg-[#08080C] px-4 py-3.5">
              <span className="text-xs text-white/30">Message AETHER...</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500 text-white"><ArrowRight className="h-4 w-4" /></span>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-white/10 bg-[#15141C] px-4 py-3 shadow-2xl sm:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300"><Workflow className="h-4 w-4" /></span>
            <div><p className="text-xs font-semibold">One focused workspace</p><p className="mt-1 text-[10px] text-white/40">Ideas → conversations → progress</p></div>
          </div>
        </div>
      </section>

      <section id="capabilities" className="relative z-10 border-y border-white/[0.07] bg-white/[0.018]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-12">
          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div><p className="text-xs font-semibold tracking-[.24em] text-violet-300">CAPABILITIES</p><h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-.055em] sm:text-5xl">One space. Many ways to move forward.</h2></div>
            <p className="max-w-sm text-sm leading-7 text-white/45">AETHER brings useful AI interactions into a simple interface that stays out of your way.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {capabilities.map(({ icon: Icon, number, title, description }) => (
              <article key={number} className="group rounded-3xl border border-white/[0.08] bg-[#101015]/75 p-7 transition duration-300 hover:-translate-y-1 hover:border-violet-300/25 hover:bg-[#15131D] sm:p-8">
                <div className="flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-300/15 bg-violet-400/[0.08] text-violet-200"><Icon className="h-5 w-5" /></span><span className="text-xs tracking-widest text-white/25">{number}</span></div>
                <h3 className="mt-10 text-xl font-semibold tracking-tight">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/45">{description}</p>
                <div className="mt-8 h-px w-full bg-gradient-to-r from-violet-400/40 to-transparent" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="relative z-10 mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr]">
          <div><p className="text-xs font-semibold tracking-[.24em] text-violet-300">A SIMPLE WORKFLOW</p><h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-.055em] sm:text-5xl">Less friction.<br />More momentum.</h2><p className="mt-6 max-w-sm text-sm leading-7 text-white/45">Start small, ask better questions, and keep the useful parts of the conversation close.</p><Link href="/chat" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-violet-200 transition hover:text-white">Try the workspace <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {workflow.map(([number, title, description]) => <div key={number} className="grid gap-4 py-7 sm:grid-cols-[64px_1fr]"><span className="text-sm font-medium text-violet-300">{number}</span><div><h3 className="text-lg font-semibold">{title}</h3><p className="mt-2 max-w-lg text-sm leading-7 text-white/45">{description}</p></div></div>)}
          </div>
        </div>
      </section>

      <section id="about" className="relative z-10 px-5 pb-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-violet-300/15 bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,.2),transparent_55%),linear-gradient(135deg,#15121f,#0d0d12_65%)] px-7 py-14 text-center sm:px-12 sm:py-20">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-violet-200"><Sparkles className="h-5 w-5" /></span>
          <p className="mt-6 text-xs font-semibold tracking-[.24em] text-violet-200">YOUR NEXT IDEA STARTS HERE</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-[-.06em] sm:text-5xl">Bring the question.<br />We’ll work from there.</h2>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-white/45">Open your workspace and turn your next thought into a conversation.</p>
          <Link href="/chat" className="mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#8152F3] px-6 text-sm font-semibold text-white transition hover:bg-[#925FFF]">Start chatting <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.07]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <Link href="/" className="text-sm font-semibold tracking-[-.04em] text-white/70">AETHER<span className="text-violet-400">.ai</span></Link>
          <p>AI workspace for ideas, problem-solving, and creation.</p>
          <p>© {new Date().getFullYear()} AETHER.ai</p>
        </div>
      </footer>
    </main>
  );
}
