const API_URL = 'http://localhost:5140'

export type TokenResponse = {
  token: string
}

export type StartGameResponse = {
  gameId: number
  playerId: number
  createdAt: string
}

export type GuessResponse = {
  gameId: number
  attemptedNumber: string
  message: string
}

// ── Auth ──────────────────────────────────────────────────

export async function registerPlayer(data: {
  firstname: string
  lastname: string
  age: number
  email: string
  password: string
}): Promise<TokenResponse> {
  const res = await fetch(`${API_URL}/api/game/v1/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message ?? 'Error al registrarse.')
  }
  return res.json()
}

export async function loginPlayer(data: {
  email: string
  password: string
}): Promise<TokenResponse> {
  const res = await fetch(`${API_URL}/api/game/v1/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message ?? 'Error al iniciar sesión.')
  }
  return res.json()
}
export type GameHistory = {
  gameId: number
  isFinished: boolean
  attempts: {
    attemptedNumber: string
    famas: number
    picas: number
    message: string
  }[]
}

export async function getGameHistory(
  token: string,
  gameId: number,
): Promise<GameHistory> {
  const res = await fetch(`${API_URL}/api/game/v1/history/${gameId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message ?? 'Error al obtener el historial.')
  }
  return res.json()
}
export async function abandonGame(
  token: string,
  gameId: number,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/game/v1/abandon/${gameId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message ?? 'Error al abandonar el juego.')
  }
}

// ── Game ──────────────────────────────────────────────────

export async function startGame(token: string): Promise<StartGameResponse> {
  const res = await fetch(`${API_URL}/api/game/v1/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message ?? 'Error al iniciar el juego.')
  }
  return res.json()
}

export async function guessNumber(
  token: string,
  gameId: number,
  attemptedNumber: string,
): Promise<GuessResponse> {
  const res = await fetch(`${API_URL}/api/game/v1/guess`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ gameId, attemptedNumber }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message ?? 'Error al procesar el intento.')
  }
  return res.json()
}