'use client'

import { useState } from 'react'

import { AuthScreen } from '@/components/auth-screen'
import { GameBoard } from '@/components/game-board'
import { WelcomeScreen } from '@/components/welcome-screen'
import { startGame, getGameHistory, abandonGame, type StartGameResponse } from '@/lib/api'
import type { Attempt, Game, User } from '@/lib/game'

type Screen = 'auth' | 'welcome' | 'game'

export default function Page() {
  const [screen, setScreen] = useState<Screen>('auth')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [game, setGame] = useState<Game | null>(null)
  const [activeGameId, setActiveGameId] = useState<number | null>(null)

  function handleAuthSuccess(user: User, jwt: string) {
    setCurrentUser(user)
    setToken(jwt)
    setScreen('welcome')
  }

  function handleLogout() {
    setCurrentUser(null)
    setToken(null)
    setGame(null)
    setActiveGameId(null)
    setScreen('auth')
  }

  async function loadGame(gameId: number) {
    if (!token) return
    const history = await getGameHistory(token, gameId)
    const previousAttempts: Attempt[] = history.attempts.map((a, index) => ({
      id: index + 1,
      guess: a.attemptedNumber,
      famas: a.famas,
      picas: a.picas,
      won: a.famas === 4,
      mensaje: a.message,
    }))
    setGame({
      id: String(gameId),
      gameId,
      secret: '',
      attempts: previousAttempts,
      won: history.isFinished,
    })
    setActiveGameId(gameId)
    setScreen('game')
  }

  async function handleContinue() {
    if (!token || !activeGameId) return
    try {
      await loadGame(activeGameId)
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleStartGame() {
    if (!token) return
    try {
      // Si hay juego activo, lo abandonamos primero
      if (activeGameId) {
        await abandonGame(token, activeGameId)
      }

      const response: StartGameResponse = await startGame(token)
      await loadGame(response.gameId)
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Al volver al welcome, detectar si hay juego activo
  async function handleExitToWelcome() {
    if (!token) return
    try {
      // Consultar si hay juego activo
      const response = await startGame(token)
      setActiveGameId(response.gameId)
    } catch {
      setActiveGameId(null)
    }
    setScreen('welcome')
  }

  if (screen === 'auth' || !currentUser || !token) {
    return (
      <main>
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      </main>
    )
  }

  if (screen === 'welcome' || !game) {
    return (
      <main>
        <WelcomeScreen
          user={currentUser}
          activeGameId={activeGameId}
          onStart={handleStartGame}
          onContinue={handleContinue}
          onLogout={handleLogout}
        />
      </main>
    )
  }

  return (
    <main>
      <GameBoard
        game={game}
        token={token}
        playerName={`${currentUser.nombre} ${currentUser.apellido}`}
        onUpdateGame={setGame}
        onNewGame={handleStartGame}
        onExit={handleExitToWelcome}
      />
    </main>
  )
}