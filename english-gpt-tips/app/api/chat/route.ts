import { NextRequest, NextResponse } from 'next/server'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
const MODEL_NAME = 'gpt-4.1-mini'
const REQUEST_TIMEOUT_MS = 20000
const MAX_OPENAI_ATTEMPTS = 3

type OpenAIChatCompletionResponse = {
  error?: {
    message?: string
  }
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

function jsonResponse(body: Record<string, string>, status: number) {
  return NextResponse.json(body, { status })
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getRetryDelayMs(attempt: number) {
  return 400 * 2 ** (attempt - 1)
}

async function callOpenAIWithRetry(message: string, systemPrompt: string) {
  for (let attempt = 1; attempt <= MAX_OPENAI_ATTEMPTS; attempt += 1) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const res = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
        }),
        signal: controller.signal,
      })

      const payloadText = await res.text()
      const data = payloadText ? (JSON.parse(payloadText) as OpenAIChatCompletionResponse) : {}

      if (res.ok) {
        return { res, data }
      }

      const retriableStatus = [408, 409, 425, 429, 500, 502, 503, 504]
      const shouldRetry = retriableStatus.includes(res.status) && attempt < MAX_OPENAI_ATTEMPTS

      if (shouldRetry) {
        await delay(getRetryDelayMs(attempt))
        continue
      }

      return { res, data }
    } catch (error) {
      const canRetry = attempt < MAX_OPENAI_ATTEMPTS

      if (!canRetry) {
        throw error
      }

      await delay(getRetryDelayMs(attempt))
    } finally {
      clearTimeout(timeoutId)
    }
  }

  throw new Error('Failed to contact AI service after retries.')
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY environment variable.')
    return jsonResponse({ error: 'Server misconfiguration. Missing API key.' }, 500)
  }

  const systemPrompt = process.env.CHAT_SYSTEM_PROMPT?.trim()

  if (!systemPrompt) {
    console.error('Missing CHAT_SYSTEM_PROMPT environment variable.')
    return jsonResponse({ error: 'Server misconfiguration. Missing system prompt.' }, 500)
  }

  let body: { message?: unknown }

  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body.' }, 400)
  }

  const message = typeof body.message === 'string' ? body.message.trim() : ''

  if (!message) {
    return jsonResponse({ error: 'Message is required.' }, 400)
  }

  try {
    const { res, data } = await callOpenAIWithRetry(message, systemPrompt)

    if (!res.ok) {
      const providerMessage = data.error?.message ?? 'Upstream provider request failed.'
      console.error('OpenAI request failed with status %s.', res.status)
      return jsonResponse({ error: providerMessage }, res.status)
    }

    const response = data.choices?.[0]?.message?.content?.trim()

    if (!response) {
      console.error('OpenAI response did not include message content.')
      return jsonResponse({ error: 'No answer returned by the AI service.' }, 502)
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Unexpected chat route error.', error)
    return jsonResponse({ error: 'Unable to reach the AI service right now.' }, 502)
  }
}
