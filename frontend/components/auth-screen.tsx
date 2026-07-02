'use client'

import { useState } from 'react'
import {
  AtSign,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  User,
  UserPlus,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { registerPlayer, loginPlayer } from '@/lib/api'
import type { User as GameUser } from '@/lib/game'

type Mode = 'login' | 'register'

type AuthScreenProps = {
  onAuthSuccess: (user: GameUser, token: string) => void
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>('register')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [edad, setEdad] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!nombre || !apellido || !edad || !regEmail || !regPassword) {
      setError('Completa todos los campos para registrarte.')
      return
    }
    if (Number(edad) <= 0) {
      setError('Ingresa una edad válida.')
      return
    }
    setPending(true)
    try {
      const response = await registerPlayer({
        firstname: nombre.trim(),
        lastname: apellido.trim(),
        age: Number(edad),
        email: regEmail.trim(),
        password: regPassword,
      })
      const user: GameUser = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        edad,
        email: regEmail.trim(),
        password: regPassword,
      }
      onAuthSuccess(user, response.token)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setPending(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!loginEmail || !loginPassword) {
      setError('Completa todos los campos.')
      return
    }
    setPending(true)
    try {
      const response = await loginPlayer({
        email: loginEmail.trim(),
        password: loginPassword,
      })
      const user: GameUser = {
        nombre: '',
        apellido: '',
        edad: '',
        email: loginEmail.trim(),
        password: loginPassword,
      }
      onAuthSuccess(user, response.token)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <span className="font-mono font-semibold text-primary">4</span>
            dígitos · sin repetir
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight">
            Picas <span className="text-primary">&amp;</span> Famas
          </h1>
          <p className="mt-2 text-pretty text-muted-foreground">
            Pon a prueba tu lógica descifrando el número secreto.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-0">
            <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-secondary/60 p-1">
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  mode === 'register'
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Registro
              </button>
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  mode === 'login'
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Iniciar sesión
              </button>
            </div>
          </CardHeader>

          {mode === 'register' ? (
            <CardContent>
              <div className="mb-4">
                <CardTitle className="text-lg">Crear una cuenta</CardTitle>
                <CardDescription>Regístrate para empezar a jugar.</CardDescription>
              </div>
              <form onSubmit={handleRegister} className="grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="nombre">
                      <User className="size-3.5 text-muted-foreground" />
                      Nombre
                    </Label>
                    <Input
                      id="nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ada"
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input
                      id="apellido"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      placeholder="Lovelace"
                      autoComplete="family-name"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edad">Edad</Label>
                  <Input
                    id="edad"
                    type="number"
                    min={1}
                    value={edad}
                    onChange={(e) => setEdad(e.target.value)}
                    placeholder="25"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reg-email">
                    <Mail className="size-3.5 text-muted-foreground" />
                    Correo electrónico
                  </Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="ada@ejemplo.com"
                    autoComplete="email"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reg-password">
                    <Lock className="size-3.5 text-muted-foreground" />
                    Contraseña
                  </Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                )}
                <Button type="submit" size="lg" className="h-11" disabled={pending}>
                  {pending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <UserPlus className="size-4" />
                  )}
                  Crear cuenta
                </Button>
              </form>
            </CardContent>
          ) : (
            <CardContent>
              <div className="mb-4">
                <CardTitle className="text-lg">Bienvenido de nuevo</CardTitle>
                <CardDescription>Ingresa con tu correo y contraseña.</CardDescription>
              </div>
              <form onSubmit={handleLogin} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="login-email">
                    <AtSign className="size-3.5 text-muted-foreground" />
                    Correo electrónico
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ada@ejemplo.com"
                    autoComplete="email"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="login-password">
                    <KeyRound className="size-3.5 text-muted-foreground" />
                    Contraseña
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                )}
                <Button type="submit" size="lg" className="h-11" disabled={pending}>
                  {pending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <KeyRound className="size-4" />
                  )}
                  Iniciar sesión
                </Button>
              </form>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}