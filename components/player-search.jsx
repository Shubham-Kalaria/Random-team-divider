"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Check,
  ChevronsUpDown,
  Plus,
  Search,
  UserPlus,
  Edit,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCategoryIcon } from "@/lib/utils";

export default function PlayerSearch({
  onSelectPlayer,
  username,
  selectedPlayers,
  onRemovePlayer,
  onEditPlayer,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [storedPlayers, setStoredPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [showAddNew, setShowAddNew] = useState(false);
  const [newPlayer, setNewPlayer] = useState("");
  const [newCategory, setNewCategory] = useState("batsman");
  const inputRef = useRef(null);

  // Load stored players from localStorage
  useEffect(() => {
    const loadStoredPlayers = () => {
      const savedPlayers = localStorage.getItem(`players_${username}`);
      if (savedPlayers) {
        try {
          const parsedPlayers = JSON.parse(savedPlayers);
          setStoredPlayers(Array.isArray(parsedPlayers) ? parsedPlayers : []);
        } catch (e) {
          console.error("Error parsing stored players:", e);
          setStoredPlayers([]);
        }
      }
    };

    loadStoredPlayers();
  }, [username, onRemovePlayer]);

  // Filter players based on search
  useEffect(() => {
    if (!search.trim()) {
      setFilteredPlayers(storedPlayers);
    } else {
      const filtered = storedPlayers.filter((player) =>
        player.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredPlayers(filtered);
    }
  }, [search, storedPlayers]);

  const handleAddNewPlayer = () => {
    if (!newPlayer.trim()) return;

    // Generate a unique ID for the player
    const playerId = `player_${Date.now()}`;

    // Create player object
    const playerObj = {
      id: playerId,
      name: newPlayer.trim(),
      category: newCategory,
    };

    // Check if player already exists
    if (!storedPlayers.some((p) => p.name === newPlayer.trim())) {
      const newStoredPlayers = [...storedPlayers, playerObj];
      setStoredPlayers(newStoredPlayers);

      // Save to localStorage
      localStorage.setItem(
        `players_${username}`,
        JSON.stringify(newStoredPlayers)
      );

      // Select the player
      onSelectPlayer(playerObj);
      setNewPlayer("");
      setNewCategory("batsman");
      setShowAddNew(false);
    }
  };

  const handleSelectPlayer = (player) => {
    // Check if player is already selected
    const isAlreadySelected = selectedPlayers.some((p) => p.id === player.id);

    if (isAlreadySelected) {
      // If already selected, remove the player
      onRemovePlayer(player.id);
    } else {
      // Otherwise, add the player
      onSelectPlayer(player);
    }

    setSearch("");
    setOpen(false);
  };

  const handleEditClick = (e, player) => {
    e.stopPropagation(); // Prevent selection of the player
    onEditPlayer(player);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen} className="flex-1">
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              <div className="flex items-center">
                <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                {search || "Select players..."}
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
                        setShowAddNew(true);
                        setOpen(false);
                        setNewPlayer(search);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add new player
                    </Button>
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {filteredPlayers.map((player) => {
                    const isSelected = selectedPlayers.some(
                      (p) => p.id === player.id
                    );
                    return (
                      <CommandItem
                        key={player.id}
                        value={player.name}
                        onSelect={() => handleSelectPlayer(player)}
                      >
                        <div className="flex items-center flex-1">
                          {isSelected && (
                            <Check className="mr-2 h-4 w-4 text-green-600" />
                          )}
                          <span className="mr-2">
                            {getCategoryIcon(player.category)}
                          </span>
                          {player.name}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto h-8 w-8 p-0"
                          onClick={(e) => handleEditClick(e, player)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </CommandItem>
                    );
                  })}
                  <CommandItem
                    onSelect={() => {
                      setShowAddNew(true);
                      setOpen(false);
                      setNewPlayer(search);
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

        <Button
          onClick={() => setShowAddNew(!showAddNew)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <UserPlus className="h-4 w-4" />
        </Button>
      </div>

      {showAddNew && (
        <div className="space-y-4 p-4 border rounded-md bg-gray-50">
          <div className="space-y-2">
            <Label htmlFor="playerName">Player Name</Label>
            <Input
              id="playerName"
              placeholder="Enter player name"
              value={newPlayer}
              onChange={(e) => setNewPlayer(e.target.value)}
              className="flex-1"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="playerCategory">Player Category</Label>
            <Select value={newCategory} onValueChange={setNewCategory}>
              <SelectTrigger id="playerCategory">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="batsman">Batsman</SelectItem>
                <SelectItem value="bowler">Bowler</SelectItem>
                <SelectItem value="all-rounder">All-Rounder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowAddNew(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddNewPlayer}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Add Player
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
