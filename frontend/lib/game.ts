export type User = {
  nombre: string
  apellido: string
  edad: string
  email: string
  password: string
}

export type Attempt = {
  id: number
  guess: string
  famas: number
  picas: number
  won: boolean
  mensaje: string
}

export type Game = {
  id: string
  gameId: number 
  secret: string
  attempts: Attempt[]
  won: boolean
}

/** Genera un número secreto de 4 dígitos únicos (el primero puede ser 0). */
export function generateSecret(): string {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  // Fisher-Yates shuffle
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[digits[i], digits[j]] = [digits[j], digits[i]]
  }
  return digits.slice(0, 4).join('')
}

/** Crea un identificador de partida legible. */
export function generateGameId(): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `PF-${rand}`
}

/** Valida que la jugada sean 4 dígitos numéricos sin repetir. */
export function validateGuess(guess: string): string | null {
  if (!/^\d{4}$/.test(guess)) {
    return 'Debe ingresar exactamente 4 dígitos numéricos.'
  }
  if (new Set(guess).size !== 4) {
    return 'Los dígitos no pueden repetirse.'
  }
  return null
}

/**
 * Evalúa una jugada contra el número secreto.
 * Fama = dígito correcto en la posición correcta.
 * Pica = dígito correcto en posición incorrecta.
 */
export function evaluateGuess(
  guess: string,
  secret: string,
): { famas: number; picas: number } {
  let famas = 0
  let picas = 0
  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) {
      famas++
    } else if (secret.includes(guess[i])) {
      picas++
    }
  }
  return { famas, picas }
}

export function buildMessage(famas: number, picas: number): string {
  if (famas === 4) return '¡Ganaste! Número descifrado.'
  if (famas === 0 && picas === 0) return 'Ningún dígito coincide.'
  const parts: string[] = []
  if (famas > 0) parts.push(`${famas} Fama${famas > 1 ? 's' : ''}`)
  if (picas > 0) parts.push(`${picas} Pica${picas > 1 ? 's' : ''}`)
  return parts.join(' · ')
}
