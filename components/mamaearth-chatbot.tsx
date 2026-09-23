'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Float, OrbitControls } from '@react-three/drei'
import { Mic, MicOff, Phone, PhoneOff, Send, Sparkles, Volume2, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { Group } from 'three'
import { MamaearthMark } from './mamaearth-logo'

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

type ChatMessage = { role: 'user' | 'assistant'; text: string }
type ApiMessage = { role: 'user' | 'assistant'; content: string }

const GREETING = "Hi, I'm Arjun! Tell me what you're looking for and I'll help you find the right face product for your skin."
const FALLBACK_ERROR_REPLY = "Sorry, I'm having trouble connecting right now. Please try again in a moment."

// Set this to the exact `name` of a voice from `speechSynthesis.getVoices()` to force it
// (run that in the browser console to see what's installed). "Rishi" is macOS's built-in
// Indian-English male voice. Leave empty to fall back to the automatic guess below.
const PREFERRED_VOICE_NAME = 'Rishi'

export function MamaearthChatbot() {
  const [open, setOpen] = useState(false)
  const [calling, setCalling] = useState(false)
  const [muted, setMuted] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [interimTranscript, setInterimTranscript] = useState('')
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [pending, setPending] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [speechSupported, setSpeechSupported] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const historyRef = useRef<ApiMessage[]>([])
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const shouldListenRef = useRef(false)
  const mutedRef = useRef(false)
  const restartTimeoutRef = useRef<number | null>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const supported = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    setSpeechSupported(supported)
    return () => {
      shouldListenRef.current = false
      recognitionRef.current?.abort()
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
      audioRef.current?.pause()
      audioRef.current = null
      if (restartTimeoutRef.current) window.clearTimeout(restartTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!calling) return
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [calling])

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, interimTranscript, pending])

  function speakWithBrowserVoice(text: string, onDone?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onDone?.()
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1.05
    const voices = window.speechSynthesis.getVoices()
    const preferred =
      voices.find((voice) => voice.name === PREFERRED_VOICE_NAME) ??
      voices.find((voice) => voice.lang?.toLowerCase() === 'en-in') ??
      voices.find((voice) => /female|samantha|zira|google us english/i.test(voice.name))
    if (preferred) utterance.voice = preferred
    utterance.onend = () => onDone?.()
    utterance.onerror = () => onDone?.()
    window.speechSynthesis.speak(utterance)
  }

  async function speak(text: string, onDone?: () => void) {
    window.speechSynthesis?.cancel()
    audioRef.current?.pause()
    audioRef.current = null

    const finish = () => { setSpeaking(false); onDone?.() }
    setSpeaking(true)

    try {
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!response.ok) throw new Error('Neural voice unavailable')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => { URL.revokeObjectURL(url); finish() }
      audio.onerror = () => { URL.revokeObjectURL(url); speakWithBrowserVoice(text, finish) }
      await audio.play()
    } catch {
      // Neural voice not available (terms not yet accepted, rate-limited, offline, etc.) — fall back seamlessly.
      speakWithBrowserVoice(text, finish)
    }
  }

  function pauseListening() {
    recognitionRef.current?.abort()
    recognitionRef.current = null
    setListening(false)
    setInterimTranscript('')
  }

  function startListening() {
    if (!shouldListenRef.current || mutedRef.current) return
    const Ctor = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined
    if (!Ctor) { setSpeechSupported(false); return }

    const recognition = new Ctor()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.continuous = true
    let finalTranscript = ''
    let silenceTimer: number | null = null
    let manualStop = false

    // Keeps listening across brief mid-sentence pauses; only finalizes once the
    // user has actually stopped talking for a full second.
    function scheduleFinalize() {
      if (silenceTimer) window.clearTimeout(silenceTimer)
      silenceTimer = window.setTimeout(() => {
        if (finalTranscript.trim()) {
          manualStop = true
          recognition.stop()
        }
      }, 1000)
    }

    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) finalTranscript += result[0].transcript
        else interim += result[0].transcript
      }
      setInterimTranscript((finalTranscript + interim).trim())
      scheduleFinalize()
    }
    recognition.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setError('Microphone error — check mic permissions and try again.')
      }
    }
    recognition.onend = () => {
      if (silenceTimer) window.clearTimeout(silenceTimer)
      setListening(false)
      setInterimTranscript('')
      recognitionRef.current = null
      if (manualStop && finalTranscript.trim()) {
        handleUserMessage(finalTranscript.trim())
      } else if (shouldListenRef.current && !mutedRef.current) {
        restartTimeoutRef.current = window.setTimeout(startListening, 400)
      }
    }

    recognitionRef.current = recognition
    setListening(true)
    setError(null)
    try {
      recognition.start()
    } catch {
      setListening(false)
    }
  }

  async function handleUserMessage(text: string) {
    setError(null)
    setMessages((prev) => [...prev, { role: 'user', text }])
    historyRef.current.push({ role: 'user', content: text })
    setPending(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyRef.current.slice(-12) }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Something went wrong')

      const reply = data.reply as string
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }])
      historyRef.current.push({ role: 'assistant', content: reply })
      setPending(false)
      speak(reply, () => {
        if (shouldListenRef.current && !mutedRef.current) startListening()
      })
    } catch (err) {
      setPending(false)
      setError(err instanceof Error ? err.message : 'Something went wrong')
      speak(FALLBACK_ERROR_REPLY, () => {
        if (shouldListenRef.current && !mutedRef.current) startListening()
      })
    }
  }

  function handleTextSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = textInput.trim()
    if (!text || pending) return
    setTextInput('')
    pauseListening()
    handleUserMessage(text)
  }

  function replayLastReply() {
    const last = [...messages].reverse().find((message) => message.role === 'assistant')
    if (last) speak(last.text)
  }

  function startCall() {
    setOpen(true)
    setCalling(true)
    setElapsed(0)
    setMuted(false)
    mutedRef.current = false
    setError(null)
    setMessages([{ role: 'assistant', text: GREETING }])
    historyRef.current = [{ role: 'assistant', content: GREETING }]
    shouldListenRef.current = true
    speak(GREETING, () => {
      if (shouldListenRef.current && !mutedRef.current) startListening()
    })
  }

  function endCall() {
    setCalling(false)
    setElapsed(0)
    shouldListenRef.current = false
    window.speechSynthesis?.cancel()
    audioRef.current?.pause()
    audioRef.current = null
    recognitionRef.current?.abort()
    recognitionRef.current = null
    if (restartTimeoutRef.current) window.clearTimeout(restartTimeoutRef.current)
    setListening(false)
    setSpeaking(false)
    setPending(false)
    setInterimTranscript('')
  }

  function toggleMute() {
    const next = !muted
    mutedRef.current = next
    setMuted(next)
    if (next) {
      pauseListening()
    } else if (shouldListenRef.current && !speaking && !pending) {
      startListening()
    }
  }

  const time = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`
  const statusLabel = !calling
    ? 'Ready when you are'
    : speaking
      ? 'Arjun is speaking'
      : pending
        ? 'Thinking…'
        : muted
          ? 'Microphone muted'
          : listening
            ? 'Listening…'
            : 'Live voice support'

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-4 sm:bottom-8 sm:right-8">
      {open && <section className="flex h-[min(650px,calc(100vh-116px))] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-[30px] border border-[#dfead2] bg-[#fffdf8] shadow-[0_24px_80px_rgba(44,76,36,0.22)]" aria-label="Mamaearth voice support">
        <header className="flex items-center justify-between border-b border-[#dcebd2] bg-[#e8f3d9] px-5 py-4">
          <div className="flex items-center gap-3"><MamaearthMark size={40} /><div><p className="font-semibold text-[#29422c]">arjun</p><p className="text-xs text-[#5f795b]">Natural care support</p></div></div>
          <button type="button" onClick={() => { setOpen(false); endCall() }} className="grid size-9 place-items-center rounded-full text-[#5f795b] hover:bg-white/60" aria-label="Close voice support"><X size={18} /></button>
        </header>

        {!calling && (
          <div className="relative flex min-h-0 flex-1 flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-[#f1f8e9] via-[#fffdf8] to-[#f7f1df] px-6 py-7">
            <div className="absolute -right-20 top-20 size-48 rounded-full bg-[#d9ebc8]/50 blur-2xl" />
            <div className="relative text-center"><div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64815a]"><span className="size-1.5 rounded-full bg-[#c59b53]" />Ready when you are</div><h2 className="font-serif text-2xl text-[#29422c]">Talk to Arjun</h2><p className="mt-1 text-sm text-[#6e8067]">Find the right face product for your skin</p></div>
            <div className="relative size-52 rounded-full bg-[#e8f3d9] shadow-[0_16px_38px_rgba(67,108,51,0.12)] transition-all duration-700"><MascotScene /><div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-end gap-1 rounded-full bg-white/90 px-3 py-2 shadow-sm" aria-label="Arjun is ready">{[14, 24, 34, 20, 29, 17, 26].map((height, index) => <span key={index} className="w-1 rounded-full bg-[#6b9b58]" style={{ height }} />)}</div></div>
            <div className="relative w-full rounded-2xl border border-[#e4eddc] bg-white/80 p-4 text-center backdrop-blur-sm"><div className="mx-auto mb-2 flex size-9 items-center justify-center rounded-full bg-[#eef6e8] text-[#6b9b58]"><Volume2 size={17} /></div><p className="text-sm font-medium text-[#3c513d]">Get face-care product picks matched to your skin type.</p><p className="mt-1 text-xs text-[#879782]">{speechSupported ? 'Your conversation stays gentle and simple' : 'Voice input isn’t supported here — you can still type once the call starts'}</p></div>
          </div>
        )}

        {calling && (
          <div className="relative flex min-h-0 flex-1 flex-col bg-gradient-to-b from-[#f1f8e9] via-[#fffdf8] to-[#f7f1df] px-5 pt-5">
            <div className="shrink-0 text-center">
              <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64815a]"><span className={`size-1.5 rounded-full ${listening || speaking ? 'animate-pulse bg-[#6b9b58]' : 'bg-[#c59b53]'}`} />{statusLabel}</div>
              <p className="text-xs text-[#6e8067]">Call in progress · {time}</p>
            </div>

            <div className="relative mx-auto my-3 size-28 shrink-0 overflow-hidden rounded-full bg-[#dcefcf] shadow-[0_0_0_10px_rgba(220,239,207,0.45),0_0_0_20px_rgba(220,239,207,0.22)]"><MascotScene /></div>

            <div ref={transcriptRef} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto rounded-2xl border border-[#e4eddc] bg-white/70 p-3 backdrop-blur-sm">
              {messages.map((message, index) => (
                <div key={index} className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-5 ${message.role === 'user' ? 'ml-auto bg-[#6b9b58] text-white' : 'bg-white text-[#3c513d] shadow-sm'}`}>{message.text}</div>
              ))}
              {interimTranscript && <div className="ml-auto max-w-[85%] rounded-2xl bg-[#6b9b58]/40 px-3.5 py-2 text-sm italic leading-5 text-[#2f4c26]">{interimTranscript}</div>}
              {pending && (
                <div className="flex w-fit items-center gap-1.5 rounded-2xl bg-white px-3.5 py-2.5 shadow-sm" aria-label="Arjun is thinking">
                  <span className="size-1.5 animate-bounce rounded-full bg-[#6b9b58] [animation-delay:0ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-[#6b9b58] [animation-delay:150ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-[#6b9b58] [animation-delay:300ms]" />
                </div>
              )}
            </div>

            {error && <p className="mt-2 shrink-0 text-center text-xs font-medium text-[#a86743]">{error}</p>}

            <form onSubmit={handleTextSubmit} className="my-3 flex shrink-0 items-center gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(event) => setTextInput(event.target.value)}
                placeholder={speechSupported ? 'Or type your question…' : 'Type your question…'}
                className="h-10 flex-1 rounded-full border border-[#dfead2] bg-white px-4 text-sm text-[#3c513d] outline-none placeholder:text-[#96a68e] focus:border-[#6b9b58]"
              />
              <button type="submit" disabled={!textInput.trim() || pending} className="grid size-10 shrink-0 place-items-center rounded-full bg-[#6b9b58] text-white transition disabled:opacity-40" aria-label="Send message"><Send size={16} /></button>
            </form>
          </div>
        )}

        <div className="flex items-center justify-center gap-5 border-t border-[#e6eedf] bg-white px-5 py-5">
          {calling ? <><button type="button" onClick={toggleMute} className={`grid size-14 place-items-center rounded-full transition ${muted ? 'bg-[#f7e9dc] text-[#a86743]' : 'bg-[#f1f5ed] text-[#52704e]'}`} aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}>{muted ? <MicOff size={21} /> : <Mic size={21} />}</button><button type="button" onClick={endCall} className="grid size-16 place-items-center rounded-full bg-[#c66b5b] text-white shadow-[0_8px_18px_rgba(174,82,69,0.25)] transition hover:bg-[#ae574a]" aria-label="End call"><PhoneOff size={24} /></button><button type="button" onClick={replayLastReply} disabled={messages.every((message) => message.role !== 'assistant')} className="grid size-14 place-items-center rounded-full bg-[#f1f5ed] text-[#52704e] transition disabled:opacity-40" aria-label="Replay last reply"><Volume2 size={21} /></button></> : <button type="button" onClick={startCall} className="flex w-full items-center justify-center gap-3 rounded-full bg-[#6b9b58] px-5 py-4 font-semibold text-white shadow-[0_10px_22px_rgba(67,108,51,0.24)] transition hover:bg-[#547e45]"><Phone size={19} /> Start voice conversation</button>}
        </div>
      </section>}
      {!open && <div className="hidden items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium text-[#52704e] shadow-[0_8px_24px_rgba(44,76,36,0.12)] sm:flex"><Sparkles size={14} /> Talk to Arjun</div>}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="group relative grid size-[68px] place-items-center rounded-full bg-[#6b9b58] text-white shadow-[0_14px_30px_rgba(67,108,51,0.3)] transition hover:-translate-y-1 hover:bg-[#547e45]"
        aria-label={open ? 'Close Arjun voice support' : 'Open Arjun voice support'}
      >
        <span className="absolute inset-0 rounded-full border border-white/30" />
        {open ? <X size={26} /> : <Phone size={28} />}
        {!open && <span className="absolute -right-0.5 -top-0.5 size-4 rounded-full border-2 border-white bg-[#e8ad5a]" />}
      </button>
    </div>
  )
}
