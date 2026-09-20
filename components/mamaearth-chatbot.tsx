'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Float, OrbitControls } from '@react-three/drei'
import { Leaf, MessageCircle, Mic, MicOff, Phone, PhoneOff, RotateCcw, Sparkles, Volume2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Group } from 'three'

function MamaMascot() {
  const group = useRef<Group>(null)
  useFrame((state) => { if (group.current) group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.12 })
  return (
    <Float speed={1.6} rotationIntensity={0.18} floatIntensity={0.55}>
      <group ref={group} position={[0, -0.22, 0]}>
        <mesh position={[0, 0.72, 0]} castShadow><sphereGeometry args={[0.7, 32, 32]} /><meshStandardMaterial color="#f5c7a9" roughness={0.72} /></mesh>
        <mesh position={[0, 1.32, 0]} castShadow><sphereGeometry args={[0.74, 32, 32]} /><meshStandardMaterial color="#3e3a35" roughness={0.9} /></mesh>
        <mesh position={[-0.25, 0.76, 0.62]}><sphereGeometry args={[0.065, 16, 16]} /><meshStandardMaterial color="#40352e" /></mesh>
        <mesh position={[0.25, 0.76, 0.62]}><sphereGeometry args={[0.065, 16, 16]} /><meshStandardMaterial color="#40352e" /></mesh>
        <mesh position={[0, 0.52, 0.67]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.13, 0.026, 10, 24, Math.PI]} /><meshStandardMaterial color="#a95555" /></mesh>
        <mesh position={[0, -0.2, 0]} castShadow><capsuleGeometry args={[0.65, 0.8, 12, 24]} /><meshStandardMaterial color="#6f9f58" roughness={0.65} /></mesh>
        <mesh position={[0, 0.05, 0.6]}><circleGeometry args={[0.18, 24]} /><meshBasicMaterial color="#f7f0dc" /></mesh>
        <mesh position={[-0.7, -0.06, 0]} rotation={[0, 0, -0.45]}><capsuleGeometry args={[0.14, 0.65, 10, 16]} /><meshStandardMaterial color="#f5c7a9" /></mesh>
        <mesh position={[0.7, -0.06, 0]} rotation={[0, 0, 0.45]}><capsuleGeometry args={[0.14, 0.65, 10, 16]} /><meshStandardMaterial color="#f5c7a9" /></mesh>
        <mesh position={[-0.25, -0.95, 0]}><capsuleGeometry args={[0.16, 0.55, 10, 16]} /><meshStandardMaterial color="#f5c7a9" /></mesh>
        <mesh position={[0.25, -0.95, 0]}><capsuleGeometry args={[0.16, 0.55, 10, 16]} /><meshStandardMaterial color="#f5c7a9" /></mesh>
      </group>
    </Float>
  )
}

export function MascotScene() {
  return <Canvas shadows camera={{ position: [0, 0.3, 4.8], fov: 33 }}><ambientLight intensity={2} /><directionalLight position={[3, 4, 4]} intensity={3} castShadow /><directionalLight position={[-3, 2, 2]} intensity={1.3} color="#d9f1b4" /><MamaMascot /><ContactShadows position={[0, -1.35, 0]} opacity={0.35} scale={3} blur={2.5} /><OrbitControls enableZoom={false} enablePan={false} minPolarAngle={1.35} maxPolarAngle={1.75} /></Canvas>
}

export function MamaearthChatbot() {
  const [open, setOpen] = useState(false)
  const [calling, setCalling] = useState(false)
  const [muted, setMuted] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!calling) return
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [calling])

  function startCall() { setOpen(true); setCalling(true); setElapsed(0); setMuted(false) }
  function endCall() { setCalling(false); setElapsed(0) }
  const time = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-4 sm:bottom-8 sm:right-8">
      {open && <section className="flex h-[min(650px,calc(100vh-116px))] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-[30px] border border-[#dfead2] bg-[#fffdf8] shadow-[0_24px_80px_rgba(44,76,36,0.22)]" aria-label="Mamaearth voice support">
        <header className="flex items-center justify-between border-b border-[#dcebd2] bg-[#e8f3d9] px-5 py-4">
          <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-full bg-[#6b9b58] text-white"><Leaf aria-hidden="true" size={22} /></div><div><p className="font-semibold text-[#29422c]">mama</p><p className="text-xs text-[#5f795b]">Natural care support</p></div></div>
          <button type="button" onClick={() => { setOpen(false); endCall() }} className="grid size-9 place-items-center rounded-full text-[#5f795b] hover:bg-white/60" aria-label="Close voice support"><X size={18} /></button>
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-[#f1f8e9] via-[#fffdf8] to-[#f7f1df] px-6 py-7">
          <div className="absolute -right-20 top-20 size-48 rounded-full bg-[#d9ebc8]/50 blur-2xl" />
          <div className="relative text-center"><div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64815a]"><span className={`size-1.5 rounded-full ${calling ? 'animate-pulse bg-[#6b9b58]' : 'bg-[#c59b53]'}`} />{calling ? 'Live voice support' : 'Ready when you are'}</div><h2 className="font-serif text-2xl text-[#29422c]">{calling ? 'I’m listening' : 'Talk to Mama'}</h2><p className="mt-1 text-sm text-[#6e8067]">{calling ? `Call in progress · ${time}` : 'A calm, caring conversation about your routine'}</p></div>
          <div className={`relative size-52 rounded-full transition-all duration-700 ${calling ? 'bg-[#dcefcf] shadow-[0_0_0_18px_rgba(220,239,207,0.45),0_0_0_36px_rgba(220,239,207,0.22)]' : 'bg-[#e8f3d9] shadow-[0_16px_38px_rgba(67,108,51,0.12)]'}`}><MascotScene /><div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-end gap-1 rounded-full bg-white/90 px-3 py-2 shadow-sm" aria-label={calling ? 'Voice activity' : 'Mama is ready'}>{[14, 24, 34, 20, 29, 17, 26].map((height, index) => <span key={index} className={`w-1 rounded-full bg-[#6b9b58] ${calling ? 'animate-pulse' : ''}`} style={{ height }} />)}</div></div>
          <div className="relative w-full rounded-2xl border border-[#e4eddc] bg-white/80 p-4 text-center backdrop-blur-sm"><div className="mx-auto mb-2 flex size-9 items-center justify-center rounded-full bg-[#eef6e8] text-[#6b9b58]"><Volume2 size={17} /></div><p className="text-sm font-medium text-[#3c513d]">{calling ? '“Hi, I’m Mama. Tell me what you need help with today.”' : 'Get personal guidance for skincare, haircare, and more.'}</p><p className="mt-1 text-xs text-[#879782]">{calling ? 'Speak naturally — no need to wait for a beep' : 'Your conversation stays gentle and simple'}</p></div>
        </div>

        <div className="flex items-center justify-center gap-5 border-t border-[#e6eedf] bg-white px-5 py-5">
          {calling ? <><button type="button" onClick={() => setMuted((value) => !value)} className={`grid size-14 place-items-center rounded-full transition ${muted ? 'bg-[#f7e9dc] text-[#a86743]' : 'bg-[#f1f5ed] text-[#52704e]'}`} aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}>{muted ? <MicOff size={21} /> : <Mic size={21} />}</button><button type="button" onClick={endCall} className="grid size-16 place-items-center rounded-full bg-[#c66b5b] text-white shadow-[0_8px_18px_rgba(174,82,69,0.25)] transition hover:bg-[#ae574a]" aria-label="End call"><PhoneOff size={24} /></button><button type="button" className="grid size-14 place-items-center rounded-full bg-[#f1f5ed] text-[#52704e]" aria-label="Speaker on"><Volume2 size={21} /></button></> : <button type="button" onClick={startCall} className="flex w-full items-center justify-center gap-3 rounded-full bg-[#6b9b58] px-5 py-4 font-semibold text-white shadow-[0_10px_22px_rgba(67,108,51,0.24)] transition hover:bg-[#547e45]"><Phone size={19} /> Start voice conversation</button>}
        </div>
      </section>}
      {!open && <div className="hidden items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium text-[#52704e] shadow-[0_8px_24px_rgba(44,76,36,0.12)] sm:flex"><Sparkles size={14} /> Talk to Mama</div>}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="group relative grid size-[68px] place-items-center rounded-full bg-[#6b9b58] text-white shadow-[0_14px_30px_rgba(67,108,51,0.3)] transition hover:-translate-y-1 hover:bg-[#547e45]"
        aria-label={open ? 'Close Mama voice support' : 'Open Mama voice support'}
      >
        <span className="absolute inset-0 rounded-full border border-white/30" />
        {open ? <X size={26} /> : <Phone size={28} />}
        {!open && <span className="absolute -right-0.5 -top-0.5 size-4 rounded-full border-2 border-white bg-[#e8ad5a]" />}
      </button>
    </div>
  )
}

