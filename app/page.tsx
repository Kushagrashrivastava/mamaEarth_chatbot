import { MamaearthChatbot } from '@/components/mamaearth-chatbot'
import { MamaearthLogo } from '@/components/mamaearth-logo'

export default function Page() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfaf5] text-[#283c2b]">
      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-12 lg:px-24">
        <MamaearthLogo size={38} tagline />
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#3c513d] md:flex">
          <a href="#" className="hover:text-[#547e45]">Skin</a>
          <a href="#" className="hover:text-[#547e45]">Hair</a>
          <a href="#" className="hover:text-[#547e45]">Baby Care</a>
          <a href="#" className="hover:text-[#547e45]">Rewards</a>
        </nav>
        <button
          type="button"
          className="rounded-full bg-[#547e45] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(67,108,51,0.24)] transition hover:bg-[#3f6b2e]"
        >
          Shop Now
        </button>
      </header>
      <section className="relative flex min-h-[calc(100vh-88px)] items-center px-6 py-16 sm:px-12 lg:px-24">
        <div className="absolute -left-32 -top-36 size-[420px] rounded-full bg-[#edf5e4]" />
        <div className="absolute -bottom-40 right-[-8%] size-[480px] rounded-full bg-[#f6ead5]" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#d5e5c9] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#64835d]"><span className="size-2 rounded-full bg-[#83ae68]" /> Conscious care, made simple</div>
            <h1 className="max-w-lg text-5xl font-semibold leading-[1.04] tracking-[-0.05em] text-[#29422c] sm:text-7xl">Goodness that feels <span className="font-serif italic text-[#709a5d]">like you.</span></h1>
            <p className="mt-7 max-w-md text-lg leading-8 text-[#6b7866]">Discover gentle, thoughtful care for your skin, hair, and everyday rituals. Mama is here whenever you need a little guidance.</p>
            <div className="mt-9 flex flex-wrap items-center gap-3 text-sm text-[#587052]"><div className="rounded-full bg-[#edf5e5] px-4 py-2">Plant-first ingredients</div><div className="rounded-full bg-[#f7eddc] px-4 py-2">Kind to you & earth</div></div>
          </div>
          <div className="relative min-h-[350px] overflow-hidden rounded-[40px] bg-[#e9f2df] p-10 sm:min-h-[480px]">
            <div className="absolute right-8 top-8 max-w-[170px] rounded-2xl rounded-br-sm bg-white/90 px-4 py-3 text-sm leading-6 text-[#496148] shadow-sm">Your best skin day starts with a little care.</div>
            <div className="absolute bottom-0 left-1/2 h-[90%] w-[90%] -translate-x-1/2"><div className="h-full w-full rounded-[50%] bg-[#d7e9c8]" /></div>
            <div className="relative z-10 h-[330px] sm:h-[450px]"><MascotPreview /></div>
            <div className="absolute bottom-7 left-8 text-xs font-semibold uppercase tracking-[0.18em] text-[#76956c]">Meet Mama</div>
          </div>
        </div>
      </section>
      <MamaearthChatbot />
    </main>
  )
}

function MascotPreview() {
  return <div className="grid h-full place-items-center"><div className="relative mt-10 flex flex-col items-center"><div className="relative z-10 size-40 rounded-full bg-[#f5c7a9] shadow-[inset_-14px_-10px_0_rgba(191,134,104,0.12)]"><div className="absolute -top-8 left-1/2 size-44 -translate-x-1/2 rounded-[50%_50%_40%_40%] bg-[#413d37]" /><div className="absolute left-10 top-[70px] size-3 rounded-full bg-[#40352e]" /><div className="absolute right-10 top-[70px] size-3 rounded-full bg-[#40352e]" /><div className="absolute left-1/2 top-[94px] h-4 w-8 -translate-x-1/2 rounded-b-full border-b-4 border-[#a95555]" /></div><div className="-mt-3 h-48 w-44 rounded-[45%_45%_20%_20%] bg-[#6f9f58] shadow-[inset_-14px_-12px_0_rgba(48,91,48,0.12)]"><div className="mx-auto mt-10 size-12 rounded-full bg-[#f7f0dc]" /></div><div className="absolute -bottom-4 left-[-42px] h-24 w-8 rotate-[-28deg] rounded-full bg-[#f5c7a9]" /><div className="absolute -bottom-4 right-[-42px] h-24 w-8 rotate-[28deg] rounded-full bg-[#f5c7a9]" /></div></div>
}
