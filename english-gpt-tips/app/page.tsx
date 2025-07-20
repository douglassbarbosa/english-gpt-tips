'use client'

import { useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastSent, setLastSent] = useState<number>(0)

  const getrobotdog = useRef<HTMLInputElement>(null)

  const handleSend = async () => {
    if (!input.trim() || input.trim().split(' ').length > 20) {
      alert('Please enter a short sentence (max 20 words).')
      return
    }

    if (getrobotdog.current?.value) {
      alert('Bot detection triggered.')
      return
    }

    const now = Date.now()
    if (now - lastSent < 5000) {
      alert('Please wait 5 seconds before sending again.')
      return
    }
    setLastSent(now)

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
      setResponse('Hmmm sorry! Something went wrong.')
      console.error('Error fetching response:', error)
      return
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
    const allPresent = results.every((res) => res !== null)
    if (!allPresent) {
      return [
        "⚠️ I couldn't understand your sentence. Try something like:",
        "💬 Can you help me with this?",
      ]
    }
    return results as string[]
  }
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <section className="space-y-4">
          <h1 className="flex items-center justify-center text-4xl font-bold text-blue-700">ThreeTone English ✨ </h1>
          <div className="relative group inline-block">
            <p className="text-center text-gray-500 text-lg">Type a sentence and master English in Informal, Neutral, and Formal tones.</p>
            {/* <span tabIndex={0} className="text-red-500 hover:text-blue-600 cursor-pointer">?</span>

            <span className="absolute bottom-full mb-2 hidden group-hover:inline-block group-focus:inline-block bg-black text-white text-sm rounded py-1 px-2 whitespace-nowrap">
              Enter one sentence to get 3 styles. You can use it for translating too.
            </span> */}
          </div>
          <form
            className="flex flex-col sm:flex-row gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}>
            <input
              type="text"
              placeholder="Type your sentence here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              ref={getrobotdog}
              type="text"
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Send'}
            </button>
          </form>
        </section>
        {response && (
          <section className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
            <h2 className="font-semibold text-2xl text-blue-700 flex items-center gap-2">📝 Native Phrases</h2>
            {parseResponse(response).map((line, idx) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-4 text-base">
                <p><strong>{line.split(':')[0]}:</strong> {line.split(':').slice(1).join(':').trim()}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
