import { useState, useEffect } from 'react'

interface Data {
  goal: number
  entries: Array<Entry>
  progress: number
}

interface Entry {
  date: string
  distance: number
}

function App() {
  // Data fetching state
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          'https://opensheet.elk.sh/1-NoixvCzNPUHnL_4_l2LPd753ftTxqUZFwlF0kysohU/1'
        )

        if (!res.ok) {
          throw new Error()
        }
        setHasError(false)

        const data = await res.json()

        const entries: Array<Entry> = data.map((obj: Record<string, string>): Entry => {
          const values = Object.values(obj)
          return {
            date: values[0],
            distance: parseFloat(values[1]),
          }
        })

        const progress = entries.map(entry => entry.distance).reduce((prev, curr) => prev + curr)

        const transformedData: Data = {
          goal: parseInt(Object.values(data[0])[2] as string),
          entries,
          progress,
        }

        setData(transformedData)
      } catch (error) {
        console.log(error)
        setHasError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="app bg-slate-50 text-slate-800 min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-10 text-center">
        <Header />
        {!data && loading && <Loading />}
        {hasError && <ErrorMessage />}
        {data && !hasError && (
          <div>
            <EntryText goal={data.goal} />
            <Progress goal={data.goal} progress={data.progress} />
          </div>
        )}
      </div>
    </div>
  )
}

function Header() {
  return (
    <div>
      <img
        src="https://emojicdn.elk.sh/🚲"
        alt="Bike Emoji"
        width={64}
        height={64}
        className="w-16 mx-auto"
      />
      <h1 className="font-bold text-2xl mt-3">Cycling Log</h1>
    </div>
  )
}

function EntryText({ goal }: { goal: number }) {
  return (
    <div className="mt-5">
      <p>
        This year I want to ride my bike at least{' '}
        <strong className="font-semibold">{goal} km</strong>.
      </p>
    </div>
  )
}

function Progress({ goal, progress }: { goal: number; progress: number }) {
  const progressInPercent = (progress / (goal / 100)).toFixed(2)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setWidth(parseFloat(progressInPercent))
    }, 500)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="mt-5">
      <span className="block">Current progress:</span>
      <span className="block mt-1 text-2xl font-semibold text-indigo-500">
        {progress}/{goal} km
      </span>

      <div className="bg-slate-300 h-4 mt-7 rounded-md overflow-hidden">
        <div
          className="bg-slate-700 h-full transition-all duration-500"
          style={{ width: `${width}%` }}
        ></div>
      </div>
      <span className="block mt-2 text-sm">{progressInPercent}%</span>
    </div>
  )
}

function Loading() {
  return <div className="mt-5">Loading...</div>
}

function ErrorMessage() {
  return <div className="mt-5 text-red-600">An error occured.</div>
}

export default App
