import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const message = body.message

  console.log('📝 Usuário perguntou:', message)

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: process.env.CHAT_SYSTEM_PROMPT || '' },
        { role: 'user', content: message },
      ],
    }),
  })

  const data = await res.json()

  console.log('🔁 Resposta do GPT:', JSON.stringify(data, null, 2))

  return NextResponse.json({
    response: data.choices?.[0]?.message?.content || '⚠️ No answer.',
  })
}
