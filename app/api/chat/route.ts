import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const SYSTEM_PROMPT = `You are "Mama", the warm, knowledgeable voice assistant for Mamaearth — a plant-first, toxin-free personal care brand for skin, hair, and baby care.

How to respond:
- Keep every reply short: 1 to 3 spoken sentences. You are on a live voice call, not writing an article.
- Never use markdown, bullet points, numbered lists, or emoji — your words are read aloud by a text-to-speech engine.
- Speak like a caring, knowledgeable friend: warm, simple, reassuring, never pushy or salesy.
- Help with skincare, haircare, and baby-care routines, ingredient questions (e.g. Vitamin C, Ubtan, onion, rice water, ceramides), and gentle product guidance for concerns like acne, dandruff, dryness, or sensitive baby skin.
- If asked for something you're not certain about — exact prices, stock, order status, or exact policy details — say so honestly and suggest checking the Mamaearth app or mamaearth.in rather than guessing.
- If the question is entirely unrelated to personal care, gently steer the conversation back to how you can help with their skin, hair, or baby-care routine.
- Do not ask "is there anything else" after every single reply; let the conversation breathe.`

const GROQ_MODEL = 'openai/gpt-oss-120b'

type IncomingMessage = { role: 'user' | 'assistant'; content: string }

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          'The assistant is not configured yet — add a free GROQ_API_KEY to .env.local (see .env.local.example) and restart the dev server.',
      },
      { status: 500 },
    )
  }

  let body: { messages?: IncomingMessage[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const history = Array.isArray(body.messages)
    ? body.messages.filter(
        (message): message is IncomingMessage =>
          !!message &&
          (message.role === 'user' || message.role === 'assistant') &&
          typeof message.content === 'string',
      )
    : []

  if (history.length === 0) {
    return NextResponse.json({ error: 'No message provided' }, { status: 400 })
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history.slice(-12)],
        temperature: 0.6,
        max_tokens: 220,
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      console.error('Groq API error', response.status, detail)
      return NextResponse.json(
        { error: 'The assistant is unavailable right now. Please try again shortly.' },
        { status: 502 },
      )
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content?.trim()
    if (!reply) {
      return NextResponse.json({ error: 'The assistant did not return a response.' }, { status: 502 })
    }

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Failed to reach Groq API', error)
    return NextResponse.json(
      { error: 'Could not reach the assistant. Check your connection and try again.' },
      { status: 502 },
    )
  }
}
