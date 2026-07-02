'use client'

import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  Hash,
  History,
  PartyPopper,
  RotateCcw,
  Send,
  Target,
  Trophy,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { guessNumber } from '@/lib/api'
import { validateGuess, type Attempt, type Game } from '@/lib/game'

type GameBoardProps = {
  game: Game
  token: string
  playerName: string
  onUpdateGame: (game: Game) => void
  onNewGame: () => void
  onExit: () => void
}

export function GameBoard({
  game,
  token,
  playerName,
  onUpdateGame,
  onNewGame,
  onExit,
}: GameBoardProps) {
  const [guess, setGuess] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const reversedAttempts = useMemo(
    () => [...game.attempts].slice().reverse(),
    [game.attempts],
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (game.won) return

    const validationError = validateGuess(guess)
    if (validationError) {
      setError(validationError)
      return
    }

    setPending(true)
    try {
      const response = await guessNumber(token, Number(game.id), guess)

      const won = response.message.toLowerCase().includes('felicidades') ||
                  response.message.toLowerCase().includes('ganaste')

      // Extraer famas y picas del mensaje del backend
      const famasMatch = response.message.match(/(\d+)\s*Fama/i)
      const picasMatch = response.message.match(/(\d+)\s*Pica/i)
      const famas = famasMatch ? parseInt(famasMatch[1]) : (won ? 4 : 0)
      const picas = picasMatch ? parseInt(picasMatch[1]) : 0

      const attempt: Attempt = {
        id: game.attempts.length + 1,
        guess,
        famas,
        picas,
        won,
        mensaje: response.message,
      }

      onUpdateGame({
        ...game,
        attempts: [...game.attempts, attempt],
        won,
      })
      setGuess('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setPending(false)
    }
  }

  function handleChange(value: string) {
    const cleaned = value.replace(/\D/g, '').slice(0, 4)
    setGuess(cleaned)
    if (error) setError(null)
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-2xl p-4 sm:p-6">
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={onExit}>
          <ArrowLeft className="size-4" />
          Salir
        </Button>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
          <Hash className="size-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">Partida</span>
          <span className="font-mono text-sm font-semibold text-primary">
            {game.id}
          </span>
        </div>
      </header>

      <div className="mt-2 text-sm text-muted-foreground">
        Jugador: <span className="font-medium text-foreground">{playerName}</span>
        {' · '}
        Intentos:{' '}
        <span className="font-medium text-foreground">{game.attempts.length}</span>
      </div>

      {/* Zona de jugada */}
      {game.won ? (
        <Card className="mt-6 border-primary/40 bg-primary/5">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <PartyPopper className="size-10 text-primary" />
            <h2 className="text-2xl font-bold">¡Ganaste!</h2>
            <p className="text-pretty text-muted-foreground">
              Descifraste el número en{' '}
              <span className="font-semibold text-foreground">
                {game.attempts.length}
              </span>{' '}
              {game.attempts.length === 1 ? 'intento' : 'intentos'}.
            </p>
            <Button size="lg" className="mt-2 h-12" onClick={onNewGame}>
              <RotateCcw className="size-4" />
              Jugar de nuevo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-6">
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label
                htmlFor="guess"
                className="text-sm font-medium text-muted-foreground"
              >
                Arriesga un número de 4 dígitos (sin repetir)
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="guess"
                  inputMode="numeric"
                  value={guess}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="0000"
                  disabled={pending}
                  aria-invalid={!!error}
                  className={cn(
                    'w-full flex-1 rounded-xl border border-input bg-background/40 px-4 py-3 text-center font-mono text-3xl tracking-[0.5em] outline-none transition-colors',
                    'placeholder:text-muted-foreground/40',
                    'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40',
                    error && 'border-destructive ring-2 ring-destructive/30',
                  )}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="h-auto px-6 py-3 sm:w-auto"
                  disabled={pending}
                >
                  {pending ? (
                    <RotateCcw className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  Enviar
                </Button>
              </div>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {/* Historial */}
      <div className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <History className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Historial de intentos
          </h3>
        </div>

        {reversedAttempts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Aún no has hecho ningún intento. ¡Arriesga tu primer número!
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {reversedAttempts.map((attempt) => (
              <li key={attempt.id}>
                <div
                  className={cn(
                    'flex items-center gap-4 rounded-xl border border-border bg-card p-3 pr-4',
                    attempt.won && 'border-primary/50 bg-primary/5',
                  )}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-semibold text-muted-foreground">
                    {attempt.id}
                  </span>

                  <div className="flex gap-1.5 font-mono text-xl font-bold tracking-wider">
                    {attempt.guess.split('').map((digit, i) => (
                      <span
                        key={i}
                        className="flex size-9 items-center justify-center rounded-md bg-secondary/70"
                      >
                        {digit}
                      </span>
                    ))}
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    <span className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
                      <Trophy className="size-3.5" />
                      {attempt.famas}
                      <span className="hidden text-xs font-normal opacity-80 sm:inline">
                        {attempt.famas === 1 ? 'Fama' : 'Famas'}
                      </span>
                    </span>
                    <span className="flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-sm font-semibold text-accent">
                      <Target className="size-3.5" />
                      {attempt.picas}
                      <span className="hidden text-xs font-normal opacity-80 sm:inline">
                        {attempt.picas === 1 ? 'Pica' : 'Picas'}
                      </span>
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}