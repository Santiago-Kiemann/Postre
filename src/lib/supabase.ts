import { createClient } from '@supabase/supabase-js';

// Estas variables vienen del archivo .env.local (lo crearemos en el 2.3)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación por si faltan las variables
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan las variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY');
}

// Cliente de Supabase para toda la app
export const supabase = createClient(supabaseUrl, supabaseKey);

// Tipos útiles (opcional por ahora, pero ayuda)
export type Categoria = {
  id: string;
  nombre: string;
  color: string;
};

export type Ingrediente = {
  id: string;
  nombre: string;
  precio_compra: number;
  cantidad_compra: number;
  unidad_compra: string;
};