export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Flavatix</h1>
        <p className="text-xl mb-8">Testing basic functionality</p>
        <a
          href="/en/landing"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Go to Landing
        </a>
      </div>
    </div>
  )
}
