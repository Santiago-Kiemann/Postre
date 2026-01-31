import type { Receta } from '@/types/receta';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TrendingUp,
  DollarSign,
  Users,
  ChefHat,
  Package,
  Calculator,
  Info,
  Edit3,
  ListOrdered,
} from 'lucide-react';

interface RecetaDetalleModalProps {
  receta: Receta | null;
  open: boolean;
  onClose: () => void;
  onEdit?: () => void; // NUEVO: para editar
}

export function RecetaDetalleModal({
  receta,
  open,
  onClose,
  onEdit,
}: RecetaDetalleModalProps) {
  if (!receta) return null;

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <Badge
                variant="outline"
                className={`mb-2 ${getColorCategoria(receta.categoria)}`}
              >
                {receta.categoria}
              </Badge>
              <DialogTitle className="text-2xl font-bold">
                {receta.nombre}
              </DialogTitle>
              {receta.notas && (
                <p className="text-gray-500 mt-2">{receta.notas}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onEdit();
                  }}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar
                </Button>
              )}
              <div className="bg-primary/10 p-3 rounded-full">
                <ChefHat className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="costos" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="costos" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Costos
            </TabsTrigger>
            <TabsTrigger value="ingredientes" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Ingredientes
            </TabsTrigger>
            <TabsTrigger value="preparacion" className="flex items-center gap-2">
              <ListOrdered className="w-4 h-4" />
              Preparación
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              Info
            </TabsTrigger>
          </TabsList>

          {/* Tab Costos (igual que antes) */}
          <TabsContent value="costos" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">
                    Margen
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {receta.margenGanancia.toFixed(1)}%
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700 font-medium">
                    Ganancia Total
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  ${receta.gananciaTotal.toFixed(2)}
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-700 font-medium">
                    Precio Venta
                  </span>
                </div>
                <p className="text-2xl font-bold text-purple-700">
                  ${receta.precioVentaTotal.toFixed(2)}
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-700 font-medium">
                    Porciones
                  </span>
                </div>
                <p className="text-2xl font-bold text-orange-700">
                  {receta.numeroPorciones}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                Desglose de Costos
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Costo Ingredientes:</span>
                  <span className="font-medium">
                    ${(receta.costoTotal - receta.manoDeObra.precio).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mano de Obra:</span>
                  <span className="font-medium">
                    ${receta.manoDeObra.precio.toFixed(2)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Costo Total:</span>
                  <span>${receta.costoTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Costo por Porción:</span>
                  <span className="font-medium">
                    ${receta.costoPorPorcion.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab Ingredientes (igual) */}
          <TabsContent value="ingredientes">
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingrediente</TableHead>
                    <TableHead className="text-right">Precio Compra</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Usado</TableHead>
                    <TableHead className="text-right">Costo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receta.ingredientes.map((ing, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{ing.nombre}</TableCell>
                      <TableCell className="text-right">
                        ${ing.precioCompra.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {ing.cantidadCompra} {ing.unidadCompra}
                      </TableCell>
                      <TableCell className="text-right">
                        {ing.cantidadUsada} {ing.unidadUsada}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${ing.costoSegunUso.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-gray-50">
                    <TableCell colSpan={4} className="font-semibold">
                      Mano de Obra
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ${receta.manoDeObra.precio.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* NUEVA TAB: Preparación */}
          <TabsContent value="preparacion">
            <div className="mt-4 space-y-4">
              {receta.pasos && receta.pasos.length > 0 ? (
                <div className="space-y-3">
                  {receta.pasos.map((paso, index) => (
                    <div 
                      key={index} 
                      className="flex gap-4 p-4 bg-amber-50 rounded-lg border border-amber-100"
                    >
                      <div className="flex-shrink-0">
                        <span className="flex items-center justify-center w-8 h-8 bg-amber-200 text-amber-800 rounded-full font-bold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 leading-relaxed">{paso}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <ListOrdered className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay pasos de preparación registrados</p>
                  {onEdit && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        onClose();
                        onEdit();
                      }}
                      className="mt-3"
                    >
                      Agregar preparación
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab Info (igual) */}
          <TabsContent value="info">
            <div className="space-y-4 mt-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Información General
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Categoría:</span>
                    <p className="font-medium">{receta.categoria}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Porciones:</span>
                    <p className="font-medium">{receta.numeroPorciones}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Ingredientes:</span>
                    <p className="font-medium">{receta.ingredientes.length}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Mano de Obra:</span>
                    <p className="font-medium">
                      ${receta.manoDeObra.precio.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {receta.manoDeObra.descripcion && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Descripción de Mano de Obra
                  </h4>
                  <p className="text-blue-700">{receta.manoDeObra.descripcion}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}