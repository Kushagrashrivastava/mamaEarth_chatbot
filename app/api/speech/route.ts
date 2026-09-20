import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Groq's free-tier neural TTS. Swap the voice name for another Orpheus voice
// (e.g. "leah", "jess", "leo", "dan", "mia", "zac", "zoe") to change how Mama sounds.
const GROQ_TTS_MODEL = 'canopylabs/orpheus-v1-english'
const GROQ_TTS_VOICE = 'tara'

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GROQ_API_KEY is not configured.' }, { status: 500 })
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
    const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_TTS_MODEL,
        input: text,
        voice: GROQ_TTS_VOICE,
        response_format: 'wav',
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      console.error('Groq TTS error', response.status, detail)
      return NextResponse.json({ error: 'Text-to-speech is unavailable right now.' }, { status: 502 })
    }

    const audio = await response.arrayBuffer()
    return new NextResponse(audio, {
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Failed to reach Groq TTS API', error)
    return NextResponse.json({ error: 'Could not reach the speech service.' }, { status: 502 })
  }
}
