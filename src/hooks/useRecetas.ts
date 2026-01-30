import { useState, useCallback, useMemo } from 'react';
import type { Receta, Ingrediente } from '@/types/receta';
import { recetasIniciales } from '@/data/recetas';

export function useRecetas() {
  const [recetas, setRecetas] = useState<Receta[]>(recetasIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('todas');

  // Filtrar recetas
  const recetasFiltradas = useMemo(() => {
    return recetas.filter((receta) => {
      const coincideBusqueda = receta.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase());
      const coincideCategoria =
        categoriaActiva === 'todas' || receta.categoria === categoriaActiva;
      return coincideBusqueda && coincideCategoria;
    });
  }, [recetas, busqueda, categoriaActiva]);

  // Estadísticas
  const estadisticas = useMemo(() => {
    const totalRecetas = recetas.length;
    const gananciaTotal = recetas.reduce(
      (sum, r) => sum + r.gananciaTotal,
      0
    );
    const costoTotal = recetas.reduce((sum, r) => sum + r.costoTotal, 0);
    const margenPromedio =
      recetas.reduce((sum, r) => sum + r.margenGanancia, 0) / totalRecetas;
    const productoMasRentable = recetas.reduce((max, r) =>
      r.margenGanancia > max.margenGanancia ? r : max
    );

    return {
      totalRecetas,
      gananciaTotal,
      costoTotal,
      margenPromedio,
      productoMasRentable,
    };
  }, [recetas]);

  // Agregar receta
  const agregarReceta = useCallback((receta: Omit<Receta, 'id'>) => {
    const nuevaReceta: Receta = {
      ...receta,
      id: Date.now().toString(),
    };
    setRecetas((prev) => [...prev, nuevaReceta]);
    return nuevaReceta;
  }, []);

  // Actualizar receta
  const actualizarReceta = useCallback(
    (id: string, recetaActualizada: Partial<Receta>) => {
      setRecetas((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...recetaActualizada } : r))
      );
    },
    []
  );

  // Eliminar receta
  const eliminarReceta = useCallback((id: string) => {
    setRecetas((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Obtener receta por ID
  const obtenerReceta = useCallback(
    (id: string) => {
      return recetas.find((r) => r.id === id);
    },
    [recetas]
  );

  // Calcular costos automáticamente
  const calcularCostos = useCallback(
    (
      ingredientes: Omit<Ingrediente, 'precioPorUnidad' | 'costoSegunUso'>[],
      manoDeObraPrecio: number,
      numeroPorciones: number,
      precioVentaTotal: number
    ) => {
      const ingredientesCalculados: Ingrediente[] = ingredientes.map((ing) => {
        const precioPorUnidad = ing.precioCompra / ing.cantidadCompra;
        const costoSegunUso = precioPorUnidad * ing.cantidadUsada;
        return {
          ...ing,
          precioPorUnidad,
          costoSegunUso,
        };
      });

      const costoIngredientes = ingredientesCalculados.reduce(
        (sum, ing) => sum + ing.costoSegunUso,
        0
      );
      const costoTotal = costoIngredientes + manoDeObraPrecio;
      const costoPorPorcion = costoTotal / numeroPorciones;
      const gananciaTotal = precioVentaTotal - costoTotal;
      const gananciaPorPorcion = gananciaTotal / numeroPorciones;
      const margenGanancia = (gananciaTotal / precioVentaTotal) * 100;

      return {
        ingredientes: ingredientesCalculados,
        costoTotal,
        costoPorPorcion,
        gananciaTotal,
        gananciaPorPorcion,
        margenGanancia,
      };
    },
    []
  );

  return {
    recetas,
    recetasFiltradas,
    busqueda,
    setBusqueda,
    categoriaActiva,
    setCategoriaActiva,
    estadisticas,
    agregarReceta,
    actualizarReceta,
    eliminarReceta,
    obtenerReceta,
    calcularCostos,
  };
}
