import { NextRequest, NextResponse } from 'next/server'

const OPENAI_API_URL = 'https://api.openai.com/v1/responses'
const MODEL_NAME = 
  process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini";

const REQUEST_TIMEOUT_MS = 20000
const MAX_OPENAI_ATTEMPTS = 3

type OpenAIResponseContent = {
  type?: string
  text?: string
}

type OpenAIResponseOutput = {
  type?: string
  content?: OpenAIResponseContent[]
}

type OpenAIResponsesApiResponse = {
  error?: {
    message?: string
  }
  output?: OpenAIResponseOutput[]
}

function jsonResponse(body: Record<string, string>, status: number) {
  return NextResponse.json(body, { status })
}

function extractResponseText(data: OpenAIResponsesApiResponse): string {
  for (const outputItem of data.output ?? []) {
    for (const contentItem of outputItem.content ?? []) {
      if (
        contentItem.type === 'output_text' &&
        typeof contentItem.text === 'string'
      ) {
        return contentItem.text.trim()
      }
    }
  }

  return ''
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
    const res = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          model: MODEL_NAME,
          instructions: systemPrompt,
          input: message,
          max_output_tokens: 220,
          store: false,
        }
      ),
    })

  const data = (await res.json()) as OpenAIResponsesApiResponse

    if (!res.ok) {
      const providerMessage = data.error?.message ?? 'Upstream provider request failed.'
      console.error('OpenAI request failed with status %s.', res.status)
      return jsonResponse({ error: providerMessage }, res.status)
    }

    const response = extractResponseText(data)

    if (!response) {
      console.error('OpenAI response did not include output text.') 
      return jsonResponse({ error: 'No answer returned by the AI service.' }, 502)
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Unexpected chat route error.', error)
    return jsonResponse({ error: 'Unable to reach the AI service right now.' }, 
      502
    )
  }
}
