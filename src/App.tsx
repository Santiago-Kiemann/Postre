import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
  // 1. TODOS los useState primero
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [recetasFiltradas, setRecetasFiltradas] = useState<Receta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [listo, setListo] = useState(false); // Empieza en false para la animación de entrada
  
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('todas');
  const [vistaActiva, setVistaActiva] = useState<Vista>('dashboard');
  const [recetaSeleccionada, setRecetaSeleccionada] = useState<Receta | null>(null);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [recetaEditar, setRecetaEditar] = useState<Receta | null>(null);

  // 2. TODOS los useEffect después de los useState
  useEffect(() => {
    // Pequeño delay para la animación de entrada
    const timer = setTimeout(() => setListo(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let cancelado = false;
    
    const cargarRecetas = async () => {
      setCargando(true);
      try {
        const { data, error } = await supabase
          .from('recetas')
          .select(`
            *,
            receta_ingredientes (
              *,
              ingredientes (*)
            )
          `)
          .order('created_at', { ascending: false });
          
        if (cancelado) return;
        
        if (error) {
          toast.error('Error al cargar recetas');
        } else {
          const formateadas = data?.map(item => ({
            id: item.id,
            nombre: item.nombre,
            categoria: item.categoria_id,
            ingredientes: item.receta_ingredientes?.map((ri: any) => ({
              nombre: ri.ingredientes.nombre,
              precioCompra: ri.ingredientes.precio_compra,
              cantidadCompra: ri.ingredientes.cantidad_compra,
              unidadCompra: ri.ingredientes.unidad_compra,
              cantidadUsada: ri.cantidad_usada,
              unidadUsada: ri.unidad_usada,
              precioPorUnidad: ri.precio_por_unidad,
              costoSegunUso: ri.costo_segundo_uso,
            })) || [],
            manoDeObra: {
              precio: item.mano_obra_precio,
              descripcion: item.mano_obra_descripcion || '',
            },
            numeroPorciones: item.numero_porciones,
            precioVentaTotal: item.precio_venta_total,
            costoTotal: item.costo_total,
            costoPorPorcion: item.costo_por_porcion,
            gananciaTotal: item.ganancia_total,
            gananciaPorPorcion: item.ganancia_por_porcion || 0,
            margenGanancia: item.margen_ganancia,
            notas: item.notas || '',
          })) || [];
          setRecetas(formateadas);
        }
      } catch (err) {
        if (!cancelado) {
          toast.error('Error de conexión');
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };
    
    cargarRecetas();
    
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      let filtradas = recetas;
      
      if (busqueda) {
        filtradas = filtradas.filter(r => 
          r.nombre.toLowerCase().includes(busqueda.toLowerCase())
        );
      }
      
      if (categoriaActiva !== 'todas') {
        filtradas = filtradas.filter(r => r.categoria === categoriaActiva);
      }
      
      setRecetasFiltradas(filtradas);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [recetas, busqueda, categoriaActiva]);

  // 3. LOS RETURNS CONDICIONALES AL FINAL (después de todos los hooks)
  if (!listo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-gray-600">Cargando recetas...</p>
      </div>
    );
  }

  // 4. EL RESTO DEL COMPONENTE (funciones y JSX)
  const estadisticas = {
    totalRecetas: recetas.length,
    gananciaTotal: recetas.reduce((acc, r) => acc + (r.gananciaTotal || 0), 0),
    costoTotal: recetas.reduce((acc, r) => acc + r.costoTotal, 0),
    margenPromedio: recetas.length
      ? recetas.reduce((acc, r) => acc + r.margenGanancia, 0) / recetas.length 
      : 0,
    productoMasRentable: recetas.length > 0 
      ? (() => {
          const r = recetas.reduce((p, c) => p.margenGanancia > c.margenGanancia ? p : c);
          return { nombre: r.nombre, margenGanancia: r.margenGanancia };
        })()
      : { nombre: '-', margenGanancia: 0 }
  };

  const handleRecetaClick = (receta: Receta) => {
    setRecetaSeleccionada(receta);
    setModalDetalleOpen(true);
  };

  const handleNuevaReceta = () => {
    setRecetaEditar(null);
    setModalFormOpen(true);
  };

  const handleGuardarReceta = async (receta: Omit<Receta, 'id'>): Promise<void> => {
    try {
      const { data: recetaData, error: recetaError } = await supabase
        .from('recetas')
        .insert({
          nombre: receta.nombre,
          categoria_id: receta.categoria,
          notas: receta.notas,
          numero_porciones: receta.numeroPorciones,
          precio_venta_total: receta.precioVentaTotal,
          mano_obra_precio: receta.manoDeObra?.precio || 0,
          mano_obra_descripcion: receta.manoDeObra?.descripcion,
        })
        .select()
        .single();
        
      if (recetaError) throw recetaError;
      
      for (const ing of receta.ingredientes) {
        let ingredienteId;
        const { data: existente } = await supabase
          .from('ingredientes')
          .select('id')
          .eq('nombre', ing.nombre)
          .single();
          
        if (existente) {
          ingredienteId = existente.id;
        } else {
          const { data: nuevo } = await supabase
            .from('ingredientes')
            .insert({
              nombre: ing.nombre,
              precio_compra: ing.precioCompra,
              cantidad_compra: ing.cantidadCompra,
              unidad_compra: ing.unidadCompra,
            })
            .select()
            .single();
          ingredienteId = nuevo!.id;
        }
        
        await supabase.from('receta_ingredientes').insert({
          receta_id: recetaData.id,
          ingrediente_id: ingredienteId,
          cantidad_usada: ing.cantidadUsada,
          unidad_usada: ing.unidadUsada,
          precio_por_unidad: ing.precioPorUnidad,
          costo_segundo_uso: ing.costoSegunUso,
        });
      }
      
      toast.success('¡Receta guardada!');
      
      // Recargar recetas
      const { data: nuevasRecetas } = await supabase
        .from('recetas')
        .select(`
          *,
          receta_ingredientes (
            *,
            ingredientes (*)
          )
        `)
        .order('created_at', { ascending: false });
        
      if (nuevasRecetas) {
        const formateadas = nuevasRecetas.map((item: any) => ({
          id: item.id,
          nombre: item.nombre,
          categoria: item.categoria_id,
          ingredientes: item.receta_ingredientes?.map((ri: any) => ({
            nombre: ri.ingredientes.nombre,
            precioCompra: ri.ingredientes.precio_compra,
            cantidadCompra: ri.ingredientes.cantidad_compra,
            unidadCompra: ri.ingredientes.unidad_compra,
            cantidadUsada: ri.cantidad_usada,
            unidadUsada: ri.unidad_usada,
            precioPorUnidad: ri.precio_por_unidad,
            costoSegunUso: ri.costo_segundo_uso,
          })) || [],
          manoDeObra: {
            precio: item.mano_obra_precio,
            descripcion: item.mano_obra_descripcion || '',
          },
          numeroPorciones: item.numero_porciones,
          precioVentaTotal: item.precio_venta_total,
          costoTotal: item.costo_total,
          costoPorPorcion: item.costo_por_porcion,
          gananciaTotal: item.ganancia_total,
          gananciaPorPorcion: item.ganancia_por_porcion || 0,
          margenGanancia: item.margen_ganancia,
          notas: item.notas || '',
        }));
        setRecetas(formateadas);
      }
      
      setModalFormOpen(false);
    } catch (err: any) {
      toast.error('Error: ' + err.message);
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
                <Button variant="outline" onClick={() => setVistaActiva('catalogo')}>
                  Ver Todas
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recetas.slice(0, 3).map((receta) => (
                  <RecetaCard key={receta.id} receta={receta} onClick={() => handleRecetaClick(receta)} />
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
                <RecetaCard key={receta.id} receta={receta} onClick={() => handleRecetaClick(receta)} />
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
                Usa esta herramienta para calcular rápidamente los costos de una receta sin guardarla.
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
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <Calculator className="w-8 h-8 mb-3" />
                <h3 className="text-lg font-bold mb-2">Costo Promedio</h3>
                <p className="text-3xl font-bold">
                  ${(estadisticas.costoTotal / recetas.length || 0).toFixed(2)}
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
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Recetas y Costos</h1>
                <p className="text-xs text-gray-500">Sistema de Repostería</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              <Button variant={vistaActiva === 'dashboard' ? 'default' : 'ghost'} onClick={() => setVistaActiva('dashboard')} className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Dashboard
              </Button>
              <Button variant={vistaActiva === 'catalogo' ? 'default' : 'ghost'} onClick={() => setVistaActiva('catalogo')} className="gap-2">
                <BookOpen className="w-4 h-4" />
                Catálogo
              </Button>
              <Button variant={vistaActiva === 'calculadora' ? 'default' : 'ghost'} onClick={() => setVistaActiva('calculadora')} className="gap-2">
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
        <div className="md:hidden border-t">
          <div className="flex overflow-x-auto">
            <Button variant={vistaActiva === 'dashboard' ? 'default' : 'ghost'} onClick={() => setVistaActiva('dashboard')} className="flex-shrink-0 rounded-none">
              <TrendingUp className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button variant={vistaActiva === 'catalogo' ? 'default' : 'ghost'} onClick={() => setVistaActiva('catalogo')} className="flex-shrink-0 rounded-none">
              <BookOpen className="w-4 h-4 mr-2" />
              Catálogo
            </Button>
            <Button variant={vistaActiva === 'calculadora' ? 'default' : 'ghost'} onClick={() => setVistaActiva('calculadora')} className="flex-shrink-0 rounded-none">
              <Calculator className="w-4 h-4 mr-2" />
              Calculadora
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderVista()}
      </main>

      <RecetaDetalleModal receta={recetaSeleccionada} open={modalDetalleOpen} onClose={() => setModalDetalleOpen(false)} />
      <RecetaFormModal open={modalFormOpen} onClose={() => setModalFormOpen(false)} onSave={handleGuardarReceta} recetaEditar={recetaEditar} />
      <Toaster position="top-right" />
    </div>
  );
}


export default App;