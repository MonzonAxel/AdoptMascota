import type { ColorAnimal, EstadoAnimal, TipoEspecieAnimal, TipoTamanoAnimal } from '@/types/animal'

const nombresEspecies: Record<TipoEspecieAnimal, string> = {
  perro: 'Perro',
  gato: 'Gato',
  otro: 'Otro',
}

const nombresTamanos: Record<TipoTamanoAnimal, string> = {
  pequeno: 'Pequeño',
  mediano: 'Mediano',
  grande: 'Grande',
}

const nombresEstados: Record<EstadoAnimal, string> = {
  disponible: 'Disponible',
  en_proceso: 'En proceso',
  adoptado: 'Adoptado',
}

const nombresColores: Record<ColorAnimal, string> = {
  marron: 'Marrón',
  blanco: 'Blanco',
  negro: 'Negro',
  beige: 'Beige',
  multicolor: 'Multicolor',
}

export function formatearEspecie(especie: TipoEspecieAnimal): string {
  return nombresEspecies[especie]
}

export function formatearTamano(tamano: TipoTamanoAnimal): string {
  return nombresTamanos[tamano]
}

export function formatearEstadoAnimal(estado: EstadoAnimal): string {
  return nombresEstados[estado]
}

export function formatearColor(color: ColorAnimal): string {
  return nombresColores[color]
}

export function formatearEdad(edad: number | null): string {
  if (edad === null) {
    return 'Edad no informada'
  }

  return `${edad} ${edad === 1 ? 'año' : 'años'}`
}