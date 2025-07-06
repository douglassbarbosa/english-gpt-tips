'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || input.trim().split(' ').length > 20) {
      alert('Please enter a short sentence (max 20 words).')
      return
    }
    setLoading(true)
    setResponse('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: input }),
      })
      const data = await res.json()
      setResponse(data.response)
    } catch (error) {
      setResponse('Something went wrong.')
    }

    setLoading(false)
  }

  const parseResponse = (text: string) => {
    const lines = text.split('\n').filter(Boolean)
    const labels = ['Informal', 'Neutral', 'Formal']
    return labels.map((label) => {
      const line = lines.find((l) => l.toLowerCase().startsWith(label.toLowerCase()))
      return line ? `${label}: ${line.split(':').slice(1).join(':').trim()}` : `${label}: ...`
    })
  }

  return (
    <main className="min-h-screen bg-white text-gray-900 p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <section className="space-y-4">
          <h1 className="text-3xl font-bold text-center">English GPT Tips</h1>
          <p className="text-center text-gray-600">Enter a sentence to get informal, neutral, and formal versions.</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a sentence..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-4 py-2"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Send'}
            </button>
          </div>
        </section>

        {response && (
          <section className="bg-gray-50 border border-gray-200 rounded p-4 space-y-2">
            <h2 className="font-semibold text-lg">📝 Correção gramatical</h2>
            {parseResponse(response).map((line, idx) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-4">
                <p><strong>{line.split(':')[0]}:</strong> {line.split(':').slice(1).join(':').trim()}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
