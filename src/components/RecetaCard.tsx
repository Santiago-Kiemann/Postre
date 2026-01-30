import type { Receta } from '@/types/receta';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Users, ChefHat } from 'lucide-react';

interface RecetaCardProps {
  receta: Receta;
  onClick: () => void;
}

export function RecetaCard({ receta, onClick }: RecetaCardProps) {
  const getColorCategoria = (categoria: string) => {
    const colores: Record<string, string> = {
      Postres: 'bg-pink-100 text-pink-800 border-pink-200',
      Pasteles: 'bg-amber-100 text-amber-800 border-amber-200',
      Gelatinas: 'bg-red-100 text-red-800 border-red-200',
      Tradicionales: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Especiales: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colores[categoria] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Card
      className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <Badge
              variant="outline"
              className={`mb-2 ${getColorCategoria(receta.categoria)}`}
            >
              {receta.categoria}
            </Badge>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              {receta.nombre}
            </h3>
          </div>
          <div className="bg-primary/10 p-2 rounded-full">
            <ChefHat className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {receta.notas || 'Sin descripción'}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs text-green-700 font-medium">Margen</span>
            </div>
            <p className="text-lg font-bold text-green-700">
              {receta.margenGanancia.toFixed(1)}%
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs text-blue-700 font-medium">Ganancia</span>
            </div>
            <p className="text-lg font-bold text-blue-700">
              ${receta.gananciaTotal.toFixed(2)}
            </p>
          </div>

          <div className="bg-orange-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-orange-600" />
              <span className="text-xs text-orange-700 font-medium">Porciones</span>
            </div>
            <p className="text-lg font-bold text-orange-700">
              {receta.numeroPorciones}
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-xs text-purple-700 font-medium">Precio</span>
            </div>
            <p className="text-lg font-bold text-purple-700">
              ${receta.precioVentaTotal.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Costo por porción:</span>
            <span className="font-semibold text-gray-700">
              ${receta.costoPorPorcion.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
