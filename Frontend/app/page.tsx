import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Observatorio de Datos Sanitarios</h1>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Ingresar
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Bienvenido al Observatorio de Datos Sanitarios
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Accede a la información más reciente sobre indicadores de salud y analiza
          datos importantes para la toma de decisiones en el sector sanitario.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Inicia Sesión
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 font-semibold"
          >
            Regístrate Ahora
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Características
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-200 rounded-lg">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Datos en Tiempo Real
              </h4>
              <p className="text-gray-600">
                Accede a información sanitaria actualizada constantemente.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Análisis Avanzado
              </h4>
              <p className="text-gray-600">
                Herramientas poderosas para analizar e interpretar datos.
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Reportes Personalizados
              </h4>
              <p className="text-gray-600">
                Genera reportes ajustados a tus necesidades específicas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
