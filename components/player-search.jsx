"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Plus, Search, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function PlayerSearch({ onSelectPlayer, username }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [storedPlayers, setStoredPlayers] = useState([])
  const [filteredPlayers, setFilteredPlayers] = useState([])
  const [showAddNew, setShowAddNew] = useState(false)
  const [newPlayer, setNewPlayer] = useState("")
  const inputRef = useRef(null)

  // Load stored players from localStorage
  useEffect(() => {
    const loadStoredPlayers = () => {
      const savedPlayers = localStorage.getItem(`players_${username}`)
      if (savedPlayers) {
        try {
          const parsedPlayers = JSON.parse(savedPlayers)
          setStoredPlayers(Array.isArray(parsedPlayers) ? parsedPlayers : [])
        } catch (e) {
          console.error("Error parsing stored players:", e)
          setStoredPlayers([])
        }
      }
    }

    loadStoredPlayers()
  }, [username])

  // Filter players based on search
  useEffect(() => {
    if (!search.trim()) {
      setFilteredPlayers(storedPlayers)
    } else {
      const filtered = storedPlayers.filter((player) => player.toLowerCase().includes(search.toLowerCase()))
      setFilteredPlayers(filtered)
    }
  }, [search, storedPlayers])

  const handleAddNewPlayer = () => {
    if (!newPlayer.trim()) return

    // Check if player already exists
    if (!storedPlayers.includes(newPlayer.trim())) {
      const newStoredPlayers = [...storedPlayers, newPlayer.trim()]
      setStoredPlayers(newStoredPlayers)

      // Save to localStorage
      localStorage.setItem(`players_${username}`, JSON.stringify(newStoredPlayers))
    }

    // Select the player
    onSelectPlayer(newPlayer.trim())
    setNewPlayer("")
    setShowAddNew(false)
  }

  const handleSelectPlayer = (player) => {
    onSelectPlayer(player)
    setSearch("")
    setOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen} className="flex-1">
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
              <div className="flex items-center">
                <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                {search || "Select stored players..."}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search player..."
                value={search}
                onValueChange={setSearch}
                ref={inputRef}
                className="h-9"
              />
              <CommandList>
                <CommandEmpty>
                  <div className="py-3 px-4 text-sm">
                    <p>No player found.</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 w-full justify-start text-muted-foreground"
                      onClick={() => {
                        setShowAddNew(true)
                        setOpen(false)
                        setNewPlayer(search)
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add new player
                    </Button>
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {filteredPlayers.map((player) => (
                    <CommandItem key={player} value={player} onSelect={() => handleSelectPlayer(player)}>
                      {player}
                      <Check className="ml-auto h-4 w-4 opacity-0" />
                    </CommandItem>
                  ))}
                  <CommandItem
                    onSelect={() => {
                      setShowAddNew(true)
                      setOpen(false)
                      setNewPlayer(search)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add new player
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Button onClick={() => setShowAddNew(true)} className="bg-purple-600 hover:bg-purple-700">
          <UserPlus className="h-4 w-4" />
        </Button>
      </div>

      {showAddNew && (
        <div className="flex gap-2">
          <Input
            placeholder="Enter new player name"
            value={newPlayer}
            onChange={(e) => setNewPlayer(e.target.value)}
            className="flex-1"
            autoFocus
          />
          <Button onClick={handleAddNewPlayer} className="bg-purple-600 hover:bg-purple-700">
            Add
          </Button>
          <Button variant="outline" onClick={() => setShowAddNew(false)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}
