import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// ElevenLabs TTS. Free tier: 10,000 characters/month, recurring, no credit card.
// ELEVENLABS_VOICE_ID picks which voice speaks — see .env.local.example for how to find one.
const ELEVENLABS_MODEL = 'eleven_multilingual_v2'

export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  const voiceId = process.env.ELEVENLABS_VOICE_ID
  if (!apiKey || !voiceId) {
    return NextResponse.json(
      {
        error:
          'ElevenLabs is not configured yet — add ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID to .env.local (see .env.local.example) and restart the dev server.',
      },
      { status: 500 },
    )
  }

  let body: { text?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const text = body.text?.trim()
  if (!text) {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 })
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: ELEVENLABS_MODEL,
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      console.error('ElevenLabs TTS error', response.status, detail)
      return NextResponse.json({ error: 'Text-to-speech is unavailable right now.' }, { status: 502 })
    }

    const audio = await response.arrayBuffer()
    return new NextResponse(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Failed to reach ElevenLabs API', error)
    return NextResponse.json({ error: 'Could not reach the speech service.' }, { status: 502 })
  }
}
