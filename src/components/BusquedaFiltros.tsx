import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Filter } from 'lucide-react';
import { categorias } from '@/data/recetas';

interface BusquedaFiltrosProps {
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
  categoriaActiva: string;
  onCategoriaChange: (categoria: string) => void;
  onNuevaReceta: () => void;
}

export function BusquedaFiltros({
  busqueda,
  onBusquedaChange,
  categoriaActiva,
  onCategoriaChange,
  onNuevaReceta,
}: BusquedaFiltrosProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Buscar recetas..."
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        <Button
          onClick={onNuevaReceta}
          className="h-12 px-6 bg-primary hover:bg-primary/90"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Receta
        </Button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
        {categorias.map((cat) => (
          <Button
            key={cat.id}
            variant={categoriaActiva === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoriaChange(cat.id)}
            className={`flex-shrink-0 rounded-full transition-all ${
              categoriaActiva === cat.id
                ? 'shadow-md'
                : 'hover:bg-gray-100'
            }`}
          >
            {cat.nombre}
          </Button>
        ))}
      </div>
    </div>
  );
}
