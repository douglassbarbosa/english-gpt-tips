'use client'

import { useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

const MAX_WORDS = 20
const COOLDOWN_MS = 5000

type ChatSuccess = {
  response: string
}

type ChatError = {
  error?: string
}

export default function Home() {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastSent, setLastSent] = useState<number>(0)

  const honeypotRef = useRef<HTMLInputElement>(null)

  const handleSend = async () => {
    const trimmedInput = input.trim()
    const wordCount = trimmedInput.split(/\s+/).filter(Boolean).length

    if (!trimmedInput || wordCount > MAX_WORDS) {
      setError(`Please enter a short sentence with up to ${MAX_WORDS} words.`)
      setResponse('')
      return
    }

    if (honeypotRef.current?.value) {
      setError('Bot detection triggered.')
      setResponse('')
      return
    }

    const now = Date.now()
    if (now - lastSent < COOLDOWN_MS) {
      setError(`Please wait ${COOLDOWN_MS / 1000} seconds before sending again.`)
      setResponse('')
      return
    }

    setLastSent(now)
    setLoading(true)
    setError('')
    setResponse('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: trimmedInput }),
      })

      const data = (await res.json()) as ChatSuccess & ChatError

      if (!res.ok) {
        setError(data.error ?? 'Sorry, something went wrong while generating your answer.')
        return
      }

      setResponse(data.response)
    } catch (fetchError) {
      console.error('Error fetching response:', fetchError)
      setError('Sorry, something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const parseResponse = (text: string) => {
    const lines = text.split('\n').filter(Boolean)
    const labels = ['Informal', 'Neutral', 'Formal']
    const results = labels.map((label) => {
      const line = lines.find((entry) => entry.toLowerCase().startsWith(label.toLowerCase()))
      return line ? `${label}: ${line.split(':').slice(1).join(':').trim()}` : null
    })

    const allPresent = results.every((result) => result !== null)

    if (!allPresent) {
      return [
        "⚠️ I couldn't understand the answer format. Try rephrasing your sentence.",
        '💬 Example: Can you help me with this?',
      ]
    }

    return results as string[]
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <section className="space-y-4">
          <h1 className="flex items-center justify-center text-4xl font-bold text-blue-700">ThreeTone English ✨</h1>
          <p className="text-center text-gray-500 text-lg">
            Type a sentence and master English in Informal, Neutral, and Formal tones.
          </p>
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-start"
            onSubmit={(event) => {
              event.preventDefault()
              void handleSend()
            }}
          >
            <div className="flex-1 space-y-2">
              <label htmlFor="english-input" className="block text-sm font-medium text-gray-700">
                Sentence to rewrite
              </label>
              <input
                id="english-input"
                type="text"
                placeholder="Type your sentence here..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
                aria-describedby="english-input-help english-status"
                className="w-full border border-gray-300 rounded px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p id="english-input-help" className="text-sm text-gray-500">
                Enter one sentence with up to {MAX_WORDS} words.
              </p>
            </div>
            <input
              ref={honeypotRef}
              type="text"
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center sm:mt-7"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" aria-hidden="true" /> : 'Send'}
            </button>
          </form>
          <div id="english-status" aria-live="polite" className="min-h-6">
            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
            {loading ? <p className="text-sm text-blue-700">Generating your three tone options...</p> : null}
          </div>
        </section>
        {response && (
          <section className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
            <h2 className="font-semibold text-2xl text-blue-700 flex items-center gap-2">📝 Native Phrases</h2>
            {parseResponse(response).map((line, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 text-base">
                <p>
                  <strong>{line.split(':')[0]}:</strong> {line.split(':').slice(1).join(':').trim()}
                </p>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
