export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-fx-bg">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-4xl font-bold text-fx-text-primary font-heading">
          FlavorWheel México
        </h1>
        <p className="text-xl text-fx-text-secondary max-w-md">
          Discover the world in every sip - Your journey into authentic flavors begins here.
        </p>
        <div className="space-y-4">
          <button className="px-8 py-3 bg-fx-primary text-fx-text-inverse rounded-lg hover:bg-fx-primary-hover transition-colors min-h-[44px] touch-manipulation">
            Get Started
          </button>
          <div className="text-sm text-fx-text-muted">
            Testing minimal working version
          </div>
        </div>
      </div>
    </div>
  )
}