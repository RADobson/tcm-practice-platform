import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <header className="border-b border-dark-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-earth-300/20 flex items-center justify-center">
              <span className="text-earth-300 text-lg">针</span>
            </div>
            <span className="text-lg font-semibold text-white">TCM Practice</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">
              Log In
            </Link>
            <Link href="/auth/signup" className="btn-primary text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">Modern Practice Management for </span>
            <span className="text-gradient">TCM Practitioners</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Manage patients, appointments, clinical notes, tongue & pulse diagnosis, herbal formulas,
            and billing — all in one integrated platform with a patient portal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="btn-primary text-lg px-8 py-3">
              Start Free Trial
            </Link>
            <Link href="/auth/login" className="btn-secondary text-lg px-8 py-3">
              Practitioner Login
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Patient Records', icon: '📋' },
              { label: 'Tongue Analysis', icon: '👅' },
              { label: 'Pulse Diagnosis', icon: '🫀' },
              { label: 'Herbal Formulas', icon: '🌿' },
              { label: 'Appointments', icon: '📅' },
              { label: 'SOAP Notes', icon: '📝' },
              { label: 'Patient Portal', icon: '📱' },
              { label: 'Billing', icon: '💰' },
            ].map((feature) => (
              <div key={feature.label} className="card text-center">
                <div className="text-2xl mb-2">{feature.icon}</div>
                <div className="text-sm text-gray-300">{feature.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-dark-50 py-6 text-center text-sm text-gray-500">
        TCM Practice Platform — Built for acupuncturists and traditional Chinese medicine practitioners
      </footer>
    </div>
  );
}
