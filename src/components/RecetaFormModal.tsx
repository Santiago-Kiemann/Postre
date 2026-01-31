import { useState, useRef, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Calculator, Loader2, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { categorias } from '@/data/recetas';

interface RecetaFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (receta: Omit<Receta, 'id'>, id?: string) => Promise<void>; // id opcional para edición
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Estados del formulario
  const [ingredientes, setIngredientes] = useState<IngredienteForm[]>([
    { nombre: '', precioCompra: '', cantidadCompra: '', unidadCompra: 'g', cantidadUsada: '', unidadUsada: 'g' }
  ]);

  const [pasos, setPasos] = useState<string[]>(['']);
  
  const [datosBasicos, setDatosBasicos] = useState({
    nombre: '',
    categoria: 'Postres',
    notas: '',
    numeroPorciones: '',
    precioVentaTotal: '',
    manoDeObra: '',
  });

  // Cargar datos si es edición
  useEffect(() => {
    if (recetaEditar) {
      setDatosBasicos({
        nombre: recetaEditar.nombre || '',
        categoria: recetaEditar.categoria || 'Postres',
        notas: recetaEditar.notas || '',
        numeroPorciones: recetaEditar.numeroPorciones?.toString() || '',
        precioVentaTotal: recetaEditar.precioVentaTotal?.toString() || '',
        manoDeObra: recetaEditar.manoDeObra?.precio?.toString() || '',
      });
      
      setIngredientes(recetaEditar.ingredientes?.map((ing) => ({
        nombre: ing.nombre,
        precioCompra: ing.precioCompra.toString(),
        cantidadCompra: ing.cantidadCompra.toString(),
        unidadCompra: ing.unidadCompra,
        cantidadUsada: ing.cantidadUsada.toString(),
        unidadUsada: ing.unidadUsada,
      })) || [{ nombre: '', precioCompra: '', cantidadCompra: '', unidadCompra: 'g', cantidadUsada: '', unidadUsada: 'g' }]);
      
      setPasos(recetaEditar.pasos?.length ? recetaEditar.pasos : ['']);
    } else {
      // Reset si es nueva
      setDatosBasicos({
        nombre: '', categoria: 'Postres', notas: '', numeroPorciones: '', precioVentaTotal: '', manoDeObra: ''
      });
      setIngredientes([{ nombre: '', precioCompra: '', cantidadCompra: '', unidadCompra: 'g', cantidadUsada: '', unidadUsada: 'g' }]);
      setPasos(['']);
    }
  }, [recetaEditar, open]);

  // Funciones para pasos/preparación
  const agregarPaso = () => {
    setPasos([...pasos, '']);
  };

  const actualizarPaso = (index: number, valor: string) => {
    const nuevos = [...pasos];
    nuevos[index] = valor;
    setPasos(nuevos);
  };

  const eliminarPaso = (index: number) => {
    if (pasos.length > 1) {
      setPasos(pasos.filter((_, i) => i !== index));
    }
  };

  const moverPaso = (index: number, direccion: 'up' | 'down') => {
    if (direccion === 'up' && index > 0) {
      const nuevos = [...pasos];
      [nuevos[index], nuevos[index - 1]] = [nuevos[index - 1], nuevos[index]];
      setPasos(nuevos);
    } else if (direccion === 'down' && index < pasos.length - 1) {
      const nuevos = [...pasos];
      [nuevos[index], nuevos[index + 1]] = [nuevos[index + 1], nuevos[index]];
      setPasos(nuevos);
    }
  };

  // Funciones para ingredientes (tuyas actuales)
  const agregarIngrediente = () => {
    if (isSubmitting) return;
    setIngredientes([...ingredientes, { nombre: '', precioCompra: '', cantidadCompra: '', unidadCompra: 'g', cantidadUsada: '', unidadUsada: 'g' }]);
  };

  const eliminarIngrediente = (index: number) => {
    if (isSubmitting || ingredientes.length <= 1) return;
    setIngredientes(ingredientes.filter((_, i) => i !== index));
  };

  const actualizarIngrediente = (index: number, campo: keyof IngredienteForm, valor: string) => {
    if (isSubmitting) return;
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

    const costoIngredientes = ingredientesCalc.reduce((sum, ing) => sum + ing.costoSegunUso, 0);
    const manoDeObraPrecio = parseFloat(datosBasicos.manoDeObra) || 0;
    const costoTotal = costoIngredientes + manoDeObraPrecio;
    const numeroPorciones = parseFloat(datosBasicos.numeroPorciones) || 1;
    const precioVentaTotal = parseFloat(datosBasicos.precioVentaTotal) || 0;
    const costoPorPorcion = costoTotal / numeroPorciones;
    const gananciaTotal = precioVentaTotal - costoTotal;
    const gananciaPorPorcion = gananciaTotal / numeroPorciones;
    const margenGanancia = precioVentaTotal > 0 ? (gananciaTotal / precioVentaTotal) * 100 : 0;

    return {
      ingredientes: ingredientesCalc,
      costoTotal,
      costoPorPorcion,
      gananciaTotal,
      gananciaPorPorcion,
      margenGanancia,
    };
  };

  const handleGuardar = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const costos = calcularCostos();
      // Filtrar pasos vacíos
      const pasosLimpios = pasos.filter(p => p.trim() !== '');

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
        pasos: pasosLimpios,
      };

      // Si es edición, pasamos el id
      await onSave(receta, recetaEditar?.id);
      
      if (isMounted.current) {
        onClose();
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  };

  const costosPreview = calcularCostos();

  return (
    <Dialog open={open} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {recetaEditar ? '✏️ Editar Receta' : '➕ Nueva Receta'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={`paso${paso}`} onValueChange={(v) => setPaso(parseInt(v.replace('paso', '')))}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="paso1" disabled={isSubmitting}>Datos Básicos</TabsTrigger>
            <TabsTrigger value="paso2" disabled={isSubmitting}>Ingredientes</TabsTrigger>
            <TabsTrigger value="paso3" disabled={isSubmitting} className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Costos
            </TabsTrigger>
            <TabsTrigger value="paso4" disabled={isSubmitting}>👨‍🍳 Preparación</TabsTrigger>
          </TabsList>

          {/* Paso 1: Datos básicos (igual que antes) */}
          <TabsContent value="paso1" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nombre de la Receta *</Label>
                <Input
                  value={datosBasicos.nombre}
                  onChange={(e) => setDatosBasicos({ ...datosBasicos, nombre: e.target.value })}
                  placeholder="Ej: Chocoflan Especial"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label>Categoría *</Label>
                <Select
                  value={datosBasicos.categoria}
                  onValueChange={(v) => setDatosBasicos({ ...datosBasicos, categoria: v })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categorias.filter((c) => c.id !== 'todas').map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Número de Porciones *</Label>
                <Input
                  type="number"
                  value={datosBasicos.numeroPorciones}
                  onChange={(e) => setDatosBasicos({ ...datosBasicos, numeroPorciones: e.target.value })}
                  placeholder="Ej: 8"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label>Precio de Venta Total ($) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={datosBasicos.precioVentaTotal}
                  onChange={(e) => setDatosBasicos({ ...datosBasicos, precioVentaTotal: e.target.value })}
                  placeholder="Ej: 24.00"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label>Mano de Obra ($) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={datosBasicos.manoDeObra}
                  onChange={(e) => setDatosBasicos({ ...datosBasicos, manoDeObra: e.target.value })}
                  placeholder="Ej: 3.00"
                  disabled={isSubmitting}
                />
              </div>
              <div className="col-span-2">
                <Label>Notas / Descripción</Label>
                <Input
                  value={datosBasicos.notas}
                  onChange={(e) => setDatosBasicos({ ...datosBasicos, notas: e.target.value })}
                  placeholder="Descripción breve de la receta"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setPaso(2)} disabled={isSubmitting}>Siguiente</Button>
            </div>
          </TabsContent>

          {/* Paso 2: Ingredientes (tu código actual) */}
          <TabsContent value="paso2" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Ingredientes</h3>
              <Button type="button" variant="outline" size="sm" onClick={agregarIngrediente} disabled={isSubmitting}>
                <Plus className="w-4 h-4 mr-1" /> Agregar
              </Button>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {ingredientes.map((ing, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-3 rounded-lg">
                  <div className="col-span-3">
                    <Label className="text-xs">Nombre</Label>
                    <Input value={ing.nombre} onChange={(e) => actualizarIngrediente(index, 'nombre', e.target.value)} placeholder="Ej: Huevos" className="h-9" disabled={isSubmitting} />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Precio ($)</Label>
                    <Input type="number" step="0.01" value={ing.precioCompra} onChange={(e) => actualizarIngrediente(index, 'precioCompra', e.target.value)} placeholder="0.00" className="h-9" disabled={isSubmitting} />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Cant. Compra</Label>
                    <Input type="number" value={ing.cantidadCompra} onChange={(e) => actualizarIngrediente(index, 'cantidadCompra', e.target.value)} placeholder="0" className="h-9" disabled={isSubmitting} />
                  </div>
                  <div className="col-span-1">
                    <Label className="text-xs">Unid.</Label>
                    <Select value={ing.unidadCompra} onValueChange={(v) => actualizarIngrediente(index, 'unidadCompra', v)} disabled={isSubmitting}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{UNIDADES.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Cant. Usada</Label>
                    <Input type="number" value={ing.cantidadUsada} onChange={(e) => actualizarIngrediente(index, 'cantidadUsada', e.target.value)} placeholder="0" className="h-9" disabled={isSubmitting} />
                  </div>
                  <div className="col-span-1">
                    <Label className="text-xs">Unid.</Label>
                    <Select value={ing.unidadUsada} onValueChange={(v) => actualizarIngrediente(index, 'unidadUsada', v)} disabled={isSubmitting}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{UNIDADES.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => eliminarIngrediente(index)} disabled={isSubmitting || ingredientes.length === 1} className="h-9 w-9 p-0">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setPaso(1)} disabled={isSubmitting}>Anterior</Button>
              <Button onClick={() => setPaso(3)} disabled={isSubmitting}>Siguiente</Button>
            </div>
          </TabsContent>

          {/* Paso 3: Resumen (tu código actual) */}
          <TabsContent value="paso3" className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Resumen de Costos</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Costo Total</p>
                  <p className="text-xl font-bold text-gray-900">${costosPreview.costoTotal.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Costo por Porción</p>
                  <p className="text-xl font-bold text-gray-900">${costosPreview.costoPorPorcion.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 shadow-sm border border-green-100">
                  <p className="text-xs text-green-600">Ganancia Total</p>
                  <p className="text-xl font-bold text-green-700">${costosPreview.gananciaTotal.toFixed(2)}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 shadow-sm border border-blue-100">
                  <p className="text-xs text-blue-600">Margen</p>
                  <p className="text-xl font-bold text-blue-700">{costosPreview.margenGanancia.toFixed(1)}%</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setPaso(2)} disabled={isSubmitting}>Anterior</Button>
              <Button onClick={() => setPaso(4)} disabled={isSubmitting}>Siguiente: Preparación</Button>
            </div>
          </TabsContent>

          {/* PASO 4 NUEVO: Preparación */}
          <TabsContent value="paso4" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">Pasos de Preparación</h3>
                <p className="text-sm text-gray-500">Describe paso a paso cómo preparar la receta</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={agregarPaso} disabled={isSubmitting}>
                <Plus className="w-4 h-4 mr-1" /> Agregar Paso
              </Button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {pasos.map((pasoTexto, index) => (
                <div key={index} className="flex gap-2 items-start bg-amber-50 p-3 rounded-lg border border-amber-100">
                  <div className="flex flex-col gap-1 mt-1 cursor-grab">
                      <GripVertical className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <span className="bg-amber-200 text-amber-800 text-xs font-bold px-2 py-1 rounded-full text-center min-w-[24px]">
                      {index + 1}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => moverPaso(index, 'up')}
                        disabled={index === 0 || isSubmitting}
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => moverPaso(index, 'down')}
                        disabled={index === pasos.length - 1 || isSubmitting}
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <Textarea
                      value={pasoTexto}
                      onChange={(e) => actualizarPaso(index, e.target.value)}
                      placeholder={`Paso ${index + 1}: Describe qué hacer...`}
                      className="min-h-[80px] bg-white"
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminarPaso(index)}
                    disabled={pasos.length === 1 || isSubmitting}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
              <strong>💡 Consejo:</strong> Sé específico en los pasos. Incluye temperaturas del horno, tiempos de cocción, y tips importantes.
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setPaso(3)} disabled={isSubmitting}>
                Anterior
              </Button>
              <Button
                onClick={handleGuardar}
                disabled={
                  isSubmitting ||
                  !datosBasicos.nombre ||
                  !datosBasicos.numeroPorciones ||
                  !datosBasicos.precioVentaTotal
                }
                className="bg-green-600 hover:bg-green-700 min-w-[160px]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </span>
                ) : (
                  recetaEditar ? '💾 Guardar Cambios' : '✨ Crear Receta'
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}