import type { Receta } from '@/types/receta';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';

interface RecetaCardProps {
  receta: Receta;
  onClick: () => void;
  onEliminar?: () => void;
}

export function RecetaCard({ receta, onClick, onEliminar }: RecetaCardProps) {
  const getColorCategoria = (categoria: string) => {
    const colores: Record<string, string> = {
      Postres: 'bg-pink-100 text-pink-800',
      Pasteles: 'bg-amber-100 text-amber-800',
      Gelatinas: 'bg-red-100 text-red-800',
      Tradicionales: 'bg-yellow-100 text-yellow-800',
      Especiales: 'bg-purple-100 text-purple-800',
    };
    return colores[categoria] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow group relative"
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Botón eliminar (aparece al hacer hover) */}
        {onEliminar && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Evitar que se abra el modal al hacer click
              onEliminar();
            }}
            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
            title="Eliminar receta"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <div className="flex justify-between items-start mb-2">
          <Badge className={getColorCategoria(receta.categoria)}>
            {receta.categoria}
          </Badge>
          <span className="text-lg font-bold text-green-600">
            ${receta.precioVentaTotal.toFixed(2)}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 mb-1 truncate pr-6">
          {receta.nombre}
        </h3>
        
        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
          {receta.notas || 'Sin descripción'}
        </p>

        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>{receta.ingredientes.length} ingredientes</span>
          <span>{receta.numeroPorciones} porciones</span>
        </div>

        {/* Margen de ganancia */}
        <div className="mt-2 pt-2 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Margen:</span>
            <span className={`font-medium ${
              receta.margenGanancia > 30 ? 'text-green-600' : 
              receta.margenGanancia > 15 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {receta.margenGanancia.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}