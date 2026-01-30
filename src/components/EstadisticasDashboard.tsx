import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  PieChart,
  Award,
  BookOpen,
  Percent,
} from 'lucide-react';

interface EstadisticasProps {
  estadisticas: {
    totalRecetas: number;
    gananciaTotal: number;
    costoTotal: number;
    margenPromedio: number;
    productoMasRentable: {
      nombre: string;
      margenGanancia: number;
    };
  };
}

export function EstadisticasDashboard({ estadisticas }: EstadisticasProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Total Recetas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{estadisticas.totalRecetas}</p>
          <p className="text-xs text-blue-100 mt-1">En tu catálogo</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-100 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Ganancia Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            ${estadisticas.gananciaTotal.toFixed(2)}
          </p>
          <p className="text-xs text-green-100 mt-1">Si vendes todo</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-orange-100 flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Costo Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            ${estadisticas.costoTotal.toFixed(2)}
          </p>
          <p className="text-xs text-orange-100 mt-1">Inversión total</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-purple-100 flex items-center gap-2">
            <Percent className="w-4 h-4" />
            Margen Promedio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {estadisticas.margenPromedio.toFixed(1)}%
          </p>
          <p className="text-xs text-purple-100 mt-1">Rentabilidad media</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-amber-100 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Más Rentable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-bold truncate">
            {estadisticas.productoMasRentable.nombre}
          </p>
          <p className="text-xs text-amber-100 mt-1">
            {estadisticas.productoMasRentable.margenGanancia.toFixed(1)}% margen
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
