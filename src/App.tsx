import { useState } from 'react';
import { useRecetas } from '@/hooks/useRecetas';
import { EstadisticasDashboard } from '@/components/EstadisticasDashboard';
import { BusquedaFiltros } from '@/components/BusquedaFiltros';
import { RecetaCard } from '@/components/RecetaCard';
import { RecetaDetalleModal } from '@/components/RecetaDetalleModal';
import { RecetaFormModal } from '@/components/RecetaFormModal';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import {
  ChefHat,
  Calculator,
  BookOpen,
  TrendingUp,
  Settings,
} from 'lucide-react';
import type { Receta } from '@/types/receta';

type Vista = 'dashboard' | 'catalogo' | 'calculadora';

function App() {
  const {
    recetas,
    recetasFiltradas,
    busqueda,
    setBusqueda,
    categoriaActiva,
    setCategoriaActiva,
    estadisticas,
    agregarReceta,
    actualizarReceta,
  } = useRecetas();

  const [vistaActiva, setVistaActiva] = useState<Vista>('dashboard');
  const [recetaSeleccionada, setRecetaSeleccionada] = useState<Receta | null>(
    null
  );
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [recetaEditar, setRecetaEditar] = useState<Receta | null>(null);

  const handleRecetaClick = (receta: Receta) => {
    setRecetaSeleccionada(receta);
    setModalDetalleOpen(true);
  };

  const handleNuevaReceta = () => {
    setRecetaEditar(null);
    setModalFormOpen(true);
  };

  const handleGuardarReceta = (receta: Omit<Receta, 'id'>) => {
    if (recetaEditar) {
      actualizarReceta(recetaEditar.id, receta);
      toast.success('Receta actualizada correctamente');
    } else {
      agregarReceta(receta);
      toast.success('Receta creada correctamente');
    }
  };

  const renderVista = () => {
    switch (vistaActiva) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <EstadisticasDashboard estadisticas={estadisticas} />

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Recetas Destacadas
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setVistaActiva('catalogo')}
                >
                  Ver Todas
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recetas.slice(0, 3).map((receta) => (
                  <RecetaCard
                    key={receta.id}
                    receta={receta}
                    onClick={() => handleRecetaClick(receta)}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 'catalogo':
        return (
          <div className="space-y-6">
            <BusquedaFiltros
              busqueda={busqueda}
              onBusquedaChange={setBusqueda}
              categoriaActiva={categoriaActiva}
              onCategoriaChange={setCategoriaActiva}
              onNuevaReceta={handleNuevaReceta}
            />

            <div className="flex items-center justify-between">
              <p className="text-gray-500">
                Mostrando {recetasFiltradas.length} de {recetas.length} recetas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {recetasFiltradas.map((receta) => (
                <RecetaCard
                  key={receta.id}
                  receta={receta}
                  onClick={() => handleRecetaClick(receta)}
                />
              ))}
            </div>

            {recetasFiltradas.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No se encontraron recetas
                </h3>
                <p className="text-gray-500">
                  Intenta con otra búsqueda o crea una nueva receta
                </p>
              </div>
            )}
          </div>
        );

      case 'calculadora':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Calculadora de Costos
              </h2>
              <p className="text-gray-500 mb-6">
                Usa esta herramienta para calcular rápidamente los costos de una
                receta sin guardarla. Ingresa los ingredientes, cantidades y
                precios para obtener el desglose completo.
              </p>
              <Button onClick={handleNuevaReceta} className="w-full md:w-auto">
                <Calculator className="w-5 h-5 mr-2" />
                Abrir Calculadora
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <TrendingUp className="w-8 h-8 mb-3" />
                <h3 className="text-lg font-bold mb-2">Margen Promedio</h3>
                <p className="text-3xl font-bold">
                  {estadisticas.margenPromedio.toFixed(1)}%
                </p>
                <p className="text-green-100 text-sm mt-1">
                  Rentabilidad media de tus productos
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <Calculator className="w-8 h-8 mb-3" />
                <h3 className="text-lg font-bold mb-2">Costo Promedio</h3>
                <p className="text-3xl font-bold">
                  ${(estadisticas.costoTotal / recetas.length).toFixed(2)}
                </p>
                <p className="text-blue-100 text-sm mt-1">
                  Por receta en promedio
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Recetas y Costos
                </h1>
                <p className="text-xs text-gray-500">Sistema de Repostería</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <Button
                variant={vistaActiva === 'dashboard' ? 'default' : 'ghost'}
                onClick={() => setVistaActiva('dashboard')}
                className="gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Dashboard
              </Button>
              <Button
                variant={vistaActiva === 'catalogo' ? 'default' : 'ghost'}
                onClick={() => setVistaActiva('catalogo')}
                className="gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Catálogo
              </Button>
              <Button
                variant={vistaActiva === 'calculadora' ? 'default' : 'ghost'}
                onClick={() => setVistaActiva('calculadora')}
                className="gap-2"
              >
                <Calculator className="w-4 h-4" />
                Calculadora
              </Button>
            </nav>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t">
          <div className="flex overflow-x-auto">
            <Button
              variant={vistaActiva === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => setVistaActiva('dashboard')}
              className="flex-shrink-0 rounded-none"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={vistaActiva === 'catalogo' ? 'default' : 'ghost'}
              onClick={() => setVistaActiva('catalogo')}
              className="flex-shrink-0 rounded-none"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Catálogo
            </Button>
            <Button
              variant={vistaActiva === 'calculadora' ? 'default' : 'ghost'}
              onClick={() => setVistaActiva('calculadora')}
              className="flex-shrink-0 rounded-none"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calculadora
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderVista()}
      </main>

      {/* Modals */}
      <RecetaDetalleModal
        receta={recetaSeleccionada}
        open={modalDetalleOpen}
        onClose={() => setModalDetalleOpen(false)}
      />

      <RecetaFormModal
        open={modalFormOpen}
        onClose={() => setModalFormOpen(false)}
        onSave={handleGuardarReceta}
        recetaEditar={recetaEditar}
      />

      <Toaster position="top-right" />
    </div>
  );
}

export default App;
