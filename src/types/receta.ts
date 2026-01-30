export interface Ingrediente {
  nombre: string;
  precioCompra: number;
  cantidadCompra: number;
  unidadCompra: string;
  cantidadUsada: number;
  unidadUsada: string;
  precioPorUnidad: number;
  costoSegunUso: number;
}

export interface Receta {
  id: string;
  nombre: string;
  categoria: string;
  ingredientes: Ingrediente[];
  manoDeObra: {
    precio: number;
    descripcion?: string;
  };
  numeroPorciones: number;
  precioVentaTotal: number;
  costoTotal: number;
  costoPorPorcion: number;
  gananciaTotal: number;
  gananciaPorPorcion: number;
  margenGanancia: number;
  notas?: string;
  pasos?: string[];
  imagen?: string;
}

export type CategoriaReceta = 
  | 'Postres' 
  | 'Pasteles' 
  | 'Gelatinas' 
  | 'Tradicionales' 
  | 'Especiales';
