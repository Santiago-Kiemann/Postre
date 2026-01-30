import { useState } from 'react';
import type { Receta, Ingrediente, CategoriaReceta } from '@/types/receta';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { categorias } from '@/data/recetas';

interface RecetaFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (receta: Omit<Receta, 'id'>) => void;
  recetaEditar?: Receta | null;
}

interface IngredienteForm {
  nombre: string;
  precioCompra: string;
  cantidadCompra: string;
  unidadCompra: string;
  cantidadUsada: string;
  unidadUsada: string;
}

const UNIDADES = ['g', 'kg', 'ml', 'l', 'unidad', 'uni', 'caja', 'botellon'];

export function RecetaFormModal({
  open,
  onClose,
  onSave,
  recetaEditar,
}: RecetaFormModalProps) {
  const [paso, setPaso] = useState(1);
  const [ingredientes, setIngredientes] = useState<IngredienteForm[]>(
    recetaEditar
      ? recetaEditar.ingredientes.map((ing) => ({
          nombre: ing.nombre,
          precioCompra: ing.precioCompra.toString(),
          cantidadCompra: ing.cantidadCompra.toString(),
          unidadCompra: ing.unidadCompra,
          cantidadUsada: ing.cantidadUsada.toString(),
          unidadUsada: ing.unidadUsada,
        }))
      : [
          {
            nombre: '',
            precioCompra: '',
            cantidadCompra: '',
            unidadCompra: 'g',
            cantidadUsada: '',
            unidadUsada: 'g',
          },
        ]
  );

  const [datosBasicos, setDatosBasicos] = useState({
    nombre: recetaEditar?.nombre || '',
    categoria: recetaEditar?.categoria || 'Postres',
    notas: recetaEditar?.notas || '',
    numeroPorciones: recetaEditar?.numeroPorciones.toString() || '',
    precioVentaTotal: recetaEditar?.precioVentaTotal.toString() || '',
    manoDeObra: recetaEditar?.manoDeObra.precio.toString() || '',
  });

  const agregarIngrediente = () => {
    setIngredientes([
      ...ingredientes,
      {
        nombre: '',
        precioCompra: '',
        cantidadCompra: '',
        unidadCompra: 'g',
        cantidadUsada: '',
        unidadUsada: 'g',
      },
    ]);
  };

  const eliminarIngrediente = (index: number) => {
    if (ingredientes.length > 1) {
      setIngredientes(ingredientes.filter((_, i) => i !== index));
    }
  };

  const actualizarIngrediente = (
    index: number,
    campo: keyof IngredienteForm,
    valor: string
  ) => {
    const nuevos = [...ingredientes];
    nuevos[index][campo] = valor;
    setIngredientes(nuevos);
  };

  const calcularCostos = () => {
    const ingredientesCalc: Ingrediente[] = ingredientes.map((ing) => {
      const precioCompra = parseFloat(ing.precioCompra) || 0;
      const cantidadCompra = parseFloat(ing.cantidadCompra) || 1;
      const cantidadUsada = parseFloat(ing.cantidadUsada) || 0;
      const precioPorUnidad = precioCompra / cantidadCompra;
      const costoSegunUso = precioPorUnidad * cantidadUsada;

      return {
        nombre: ing.nombre,
        precioCompra,
        cantidadCompra,
        unidadCompra: ing.unidadCompra,
        cantidadUsada,
        unidadUsada: ing.unidadUsada,
        precioPorUnidad,
        costoSegunUso,
      };
    });

    const costoIngredientes = ingredientesCalc.reduce(
      (sum, ing) => sum + ing.costoSegunUso,
      0
    );
    const manoDeObraPrecio = parseFloat(datosBasicos.manoDeObra) || 0;
    const costoTotal = costoIngredientes + manoDeObraPrecio;
    const numeroPorciones = parseFloat(datosBasicos.numeroPorciones) || 1;
    const precioVentaTotal = parseFloat(datosBasicos.precioVentaTotal) || 0;
    const costoPorPorcion = costoTotal / numeroPorciones;
    const gananciaTotal = precioVentaTotal - costoTotal;
    const gananciaPorPorcion = gananciaTotal / numeroPorciones;
    const margenGanancia =
      precioVentaTotal > 0 ? (gananciaTotal / precioVentaTotal) * 100 : 0;

    return {
      ingredientes: ingredientesCalc,
      costoTotal,
      costoPorPorcion,
      gananciaTotal,
      gananciaPorPorcion,
      margenGanancia,
    };
  };

  const handleGuardar = () => {
    const costos = calcularCostos();

    const receta: Omit<Receta, 'id'> = {
      nombre: datosBasicos.nombre,
      categoria: datosBasicos.categoria as CategoriaReceta,
      notas: datosBasicos.notas,
      numeroPorciones: parseFloat(datosBasicos.numeroPorciones) || 1,
      precioVentaTotal: parseFloat(datosBasicos.precioVentaTotal) || 0,
      manoDeObra: {
        precio: parseFloat(datosBasicos.manoDeObra) || 0,
      },
      ingredientes: costos.ingredientes,
      costoTotal: costos.costoTotal,
      costoPorPorcion: costos.costoPorPorcion,
      gananciaTotal: costos.gananciaTotal,
      gananciaPorPorcion: costos.gananciaPorPorcion,
      margenGanancia: costos.margenGanancia,
    };

    onSave(receta);
    onClose();
  };

  const costosPreview = calcularCostos();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {recetaEditar ? 'Editar Receta' : 'Nueva Receta'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={`paso${paso}`} onValueChange={(v) => setPaso(parseInt(v.replace('paso', '')))}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="paso1">Datos Básicos</TabsTrigger>
            <TabsTrigger value="paso2">Ingredientes</TabsTrigger>
            <TabsTrigger value="paso3" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Resumen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="paso1" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="nombre">Nombre de la Receta *</Label>
                <Input
                  id="nombre"
                  value={datosBasicos.nombre}
                  onChange={(e) =>
                    setDatosBasicos({ ...datosBasicos, nombre: e.target.value })
                  }
                  placeholder="Ej: Chocoflan Especial"
                />
              </div>

              <div>
                <Label htmlFor="categoria">Categoría *</Label>
                <Select
                  value={datosBasicos.categoria}
                  onValueChange={(v) =>
                    setDatosBasicos({ ...datosBasicos, categoria: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias
                      .filter((c) => c.id !== 'todas')
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="porciones">Número de Porciones *</Label>
                <Input
                  id="porciones"
                  type="number"
                  value={datosBasicos.numeroPorciones}
                  onChange={(e) =>
                    setDatosBasicos({
                      ...datosBasicos,
                      numeroPorciones: e.target.value,
                    })
                  }
                  placeholder="Ej: 8"
                />
              </div>

              <div>
                <Label htmlFor="precioVenta">Precio de Venta Total ($) *</Label>
                <Input
                  id="precioVenta"
                  type="number"
                  step="0.01"
                  value={datosBasicos.precioVentaTotal}
                  onChange={(e) =>
                    setDatosBasicos({
                      ...datosBasicos,
                      precioVentaTotal: e.target.value,
                    })
                  }
                  placeholder="Ej: 24.00"
                />
              </div>

              <div>
                <Label htmlFor="manoDeObra">Mano de Obra ($) *</Label>
                <Input
                  id="manoDeObra"
                  type="number"
                  step="0.01"
                  value={datosBasicos.manoDeObra}
                  onChange={(e) =>
                    setDatosBasicos({
                      ...datosBasicos,
                      manoDeObra: e.target.value,
                    })
                  }
                  placeholder="Ej: 3.00"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="notas">Notas / Descripción</Label>
                <Input
                  id="notas"
                  value={datosBasicos.notas}
                  onChange={(e) =>
                    setDatosBasicos({ ...datosBasicos, notas: e.target.value })
                  }
                  placeholder="Descripción breve de la receta"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setPaso(2)}>Siguiente</Button>
            </div>
          </TabsContent>

          <TabsContent value="paso2" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Ingredientes</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={agregarIngrediente}
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar
              </Button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {ingredientes.map((ing, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-3 rounded-lg"
                >
                  <div className="col-span-3">
                    <Label className="text-xs">Nombre</Label>
                    <Input
                      value={ing.nombre}
                      onChange={(e) =>
                        actualizarIngrediente(index, 'nombre', e.target.value)
                      }
                      placeholder="Ej: Huevos"
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Precio ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={ing.precioCompra}
                      onChange={(e) =>
                        actualizarIngrediente(
                          index,
                          'precioCompra',
                          e.target.value
                        )
                      }
                      placeholder="0.00"
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Cant. Compra</Label>
                    <Input
                      type="number"
                      value={ing.cantidadCompra}
                      onChange={(e) =>
                        actualizarIngrediente(
                          index,
                          'cantidadCompra',
                          e.target.value
                        )
                      }
                      placeholder="0"
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-1">
                    <Label className="text-xs">Unid.</Label>
                    <Select
                      value={ing.unidadCompra}
                      onValueChange={(v) =>
                        actualizarIngrediente(index, 'unidadCompra', v)
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UNIDADES.map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Cant. Usada</Label>
                    <Input
                      type="number"
                      value={ing.cantidadUsada}
                      onChange={(e) =>
                        actualizarIngrediente(
                          index,
                          'cantidadUsada',
                          e.target.value
                        )
                      }
                      placeholder="0"
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-1">
                    <Label className="text-xs">Unid.</Label>
                    <Select
                      value={ing.unidadUsada}
                      onValueChange={(v) =>
                        actualizarIngrediente(index, 'unidadUsada', v)
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UNIDADES.map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => eliminarIngrediente(index)}
                      disabled={ingredientes.length === 1}
                      className="h-9 w-9 p-0"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setPaso(1)}>
                Anterior
              </Button>
              <Button onClick={() => setPaso(3)}>Siguiente</Button>
            </div>
          </TabsContent>

          <TabsContent value="paso3" className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                Resumen de Costos
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Costo Total</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${costosPreview.costoTotal.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Costo por Porción</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${costosPreview.costoPorPorcion.toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 shadow-sm border border-green-100">
                  <p className="text-xs text-green-600">Ganancia Total</p>
                  <p className="text-xl font-bold text-green-700">
                    ${costosPreview.gananciaTotal.toFixed(2)}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 shadow-sm border border-blue-100">
                  <p className="text-xs text-blue-600">Margen</p>
                  <p className="text-xl font-bold text-blue-700">
                    {costosPreview.margenGanancia.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Ingredientes:</span>{' '}
                  {ingredientes.filter((i) => i.nombre).length} registrados
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Precio de Venta:</span> ${' '}
                  {datosBasicos.precioVentaTotal || '0.00'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Porciones:</span>{' '}
                  {datosBasicos.numeroPorciones || '0'}
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setPaso(2)}>
                Anterior
              </Button>
              <Button
                onClick={handleGuardar}
                disabled={
                  !datosBasicos.nombre ||
                  !datosBasicos.numeroPorciones ||
                  !datosBasicos.precioVentaTotal
                }
                className="bg-green-600 hover:bg-green-700"
              >
                {recetaEditar ? 'Guardar Cambios' : 'Crear Receta'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
