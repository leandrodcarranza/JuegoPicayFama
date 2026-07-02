'use client'

import { LogOut, Play, RotateCcw, Target, Trophy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { User } from '@/lib/game'

type WelcomeScreenProps = {
  user: User
  activeGameId?: number | null
  onStart: () => void
  onContinue: () => void
  onLogout: () => void
}

export function WelcomeScreen({
  user,
  activeGameId,
  onStart,
  onContinue,
  onLogout,
}: WelcomeScreenProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg text-center">
        <div className="mb-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Hola de nuevo
        </div>
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          {user.nombre} {user.apellido}
        </h1>
        <p className="mt-3 text-pretty text-muted-foreground">
          {activeGameId
            ? '¿Querés continuar tu partida o iniciar una nueva?'
            : '¿Listo para descifrar un nuevo número secreto de 4 dígitos?'}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="flex flex-col items-center gap-1 p-5 pt-5">
              <Trophy className="size-6 text-primary" />
              <span className="mt-1 text-sm font-semibold">Fama</span>
              <span className="text-xs text-muted-foreground">
                Dígito correcto, posición correcta
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-1 p-5 pt-5">
              <Target className="size-6 text-accent" />
              <span className="mt-1 text-sm font-semibold">Pica</span>
              <span className="text-xs text-muted-foreground">
                Dígito correcto, posición incorrecta
              </span>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          {activeGameId ? (
            <>
              <Button
                size="lg"
                onClick={onContinue}
                className="h-14 w-full max-w-sm text-base font-semibold"
              >
                <Play className="size-5" />
                Continuar partida
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onStart}
                className="h-14 w-full max-w-sm text-base font-semibold"
              >
                <RotateCcw className="size-5" />
                Nueva partida
              </Button>
            </>
          ) : (
            <Button
              size="lg"
              onClick={onStart}
              className="h-16 w-full max-w-sm text-base font-semibold"
            >
              <Play className="size-5" />
              Iniciar Nueva Partida
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="mt-6 text-muted-foreground"
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}