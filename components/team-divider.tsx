"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Shuffle, UserPlus, X, Users } from "lucide-react"
import confetti from "canvas-confetti"

export default function TeamDivider() {
  const [players, setPlayers] = useState<string[]>([])
  const [newPlayer, setNewPlayer] = useState("")
  const [teamA, setTeamA] = useState<string[]>([])
  const [teamB, setTeamB] = useState<string[]>([])
  const [dividing, setDividing] = useState(false)
  const [divided, setDivided] = useState(false)
  const [pendingTeamA, setPendingTeamA] = useState<string[]>([])
  const [pendingTeamB, setPendingTeamB] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPlayer.trim() && !players.includes(newPlayer.trim())) {
      setPlayers([...players, newPlayer.trim()])
      setNewPlayer("")
      inputRef.current?.focus()
    }
  }

  const handleRemovePlayer = (playerToRemove: string) => {
    setPlayers(players.filter((player) => player !== playerToRemove))
  }

  // Effect to handle the animation of adding players to teams
  useEffect(() => {
    if (pendingTeamA.length === 0 && pendingTeamB.length === 0) {
      return
    }

    const timer = setTimeout(() => {
      // Add a player to team A if there are pending players
      if (pendingTeamA.length > 0) {
        const nextPlayer = pendingTeamA[0]
        setTeamA((prev) => [...prev, nextPlayer])
        setPendingTeamA((prev) => prev.slice(1))
      }

      // Add a player to team B if there are pending players
      if (pendingTeamB.length > 0) {
        const nextPlayer = pendingTeamB[0]
        setTeamB((prev) => [...prev, nextPlayer])
        setPendingTeamB((prev) => prev.slice(1))
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [pendingTeamA, pendingTeamB, teamA, teamB])

  // Effect to check if all players have been assigned
  useEffect(() => {
    if (!dividing) return

    // If all pending players have been assigned, finish the animation
    if (pendingTeamA.length === 0 && pendingTeamB.length === 0) {
      // Double check that all players are assigned
      const totalAssigned = teamA.length + teamB.length

      if (totalAssigned === players.length) {
        setTimeout(() => {
          setDividing(false)
          setDivided(true)

          // Trigger confetti effect
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          })
        }, 500)
      }
    }
  }, [dividing, pendingTeamA, pendingTeamB, teamA.length, teamB.length, players.length])

  const divideTeams = () => {
    if (players.length < 2) return

    setDividing(true)
    setDivided(false)
    setTeamA([])
    setTeamB([])

    // Create a copy of the players array to shuffle
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5)

    // Divide players into two teams
    const halfLength = Math.ceil(shuffledPlayers.length / 2)
    const newTeamA = shuffledPlayers.slice(0, halfLength)
    const newTeamB = shuffledPlayers.slice(halfLength)

    // Set the pending players for each team
    setPendingTeamA(newTeamA)
    setPendingTeamB(newTeamB)
  }

  const resetTeams = () => {
    setTeamA([])
    setTeamB([])
    setPendingTeamA([])
    setPendingTeamB([])
    setDivided(false)
  }

  return (
    <div className="space-y-8">
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-center text-2xl md:text-3xl font-bold">Team Generator</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleAddPlayer} className="flex gap-2 mb-6">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Enter player name"
              value={newPlayer}
              onChange={(e) => setNewPlayer(e.target.value)}
              className="flex-1"
              disabled={dividing}
            />
            <Button
              type="submit"
              disabled={!newPlayer.trim() || dividing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </form>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Users className="mr-2 h-5 w-5 text-purple-600" />
              Players ({players.length})
            </h3>

            {players.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Add players to get started</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {players.map((player) => (
                    <motion.div
                      key={player}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center"
                    >
                      <span>{player}</span>
                      <button
                        onClick={() => handleRemovePlayer(player)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                        disabled={dividing}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={divideTeams}
              disabled={players.length < 2 || dividing}
              className="bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Shuffle className="mr-2 h-5 w-5" />
              Divide Teams
            </Button>
          </div>
        </CardContent>
      </Card>

      {(teamA.length > 0 || teamB.length > 0 || dividing) && (
        <div className="grid md:grid-cols-2 gap-6">
          <TeamCard
            title="Team A"
            players={teamA}
            color="purple"
            dividing={dividing}
            divided={divided}
            pendingCount={pendingTeamA.length}
          />
          <TeamCard
            title="Team B"
            players={teamB}
            color="blue"
            dividing={dividing}
            divided={divided}
            pendingCount={pendingTeamB.length}
          />
        </div>
      )}

      {divided && (
        <div className="flex justify-center">
          <Button
            onClick={resetTeams}
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            Reset Teams
          </Button>
        </div>
      )}
    </div>
  )
}

interface TeamCardProps {
  title: string
  players: string[]
  color: "purple" | "blue"
  dividing: boolean
  divided: boolean
  pendingCount: number
}

function TeamCard({ title, players, color, dividing, divided, pendingCount }: TeamCardProps) {
  const colorClasses = {
    purple: {
      header: "bg-purple-600",
      card: "border-purple-200",
      player: "bg-purple-100 text-purple-800",
    },
    blue: {
      header: "bg-blue-600",
      card: "border-blue-200",
      player: "bg-blue-100 text-blue-800",
    },
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className={`border shadow-md ${colorClasses[color].card}`}>
        <CardHeader className={`${colorClasses[color].header} text-white rounded-t-lg py-3`}>
          <CardTitle className="text-center text-xl">
            {title} {dividing && pendingCount > 0 && `(${players.length} of ${players.length + pendingCount})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="min-h-[200px]">
            {players.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400">{dividing ? "Assigning players..." : "No players assigned"}</p>
              </div>
            ) : (
              <ul className="space-y-2">
                <AnimatePresence>
                  {players.map((player, index) => (
                    <motion.li
                      key={player}
                      initial={{ opacity: 0, x: color === "purple" ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.1 }}
                      className={`${colorClasses[color].player} px-4 py-2 rounded-lg`}
                    >
                      {player}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
