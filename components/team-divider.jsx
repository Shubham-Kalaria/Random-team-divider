"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shuffle,
  UserPlus,
  X,
  Users,
  LogOut,
  Download,
  LogIn,
  Crown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";
import PlayerSearch from "./player-search";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import LoginForm from "./login-form";
import PlayerEditDialog from "./player-edit-dialog";
import CaptainSelectionDialog from "./captain-selection-dialog";
import { getCategoryIcon } from "@/lib/utils";

export default function TeamDivider() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Team state
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState("");
  const [newCategory, setNewCategory] = useState("batsman");
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);
  const [dividing, setDividing] = useState(false);
  const [divided, setDivided] = useState(false);
  const [pendingTeamA, setPendingTeamA] = useState([]);
  const [pendingTeamB, setPendingTeamB] = useState([]);

  // Edit state
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Captain selection state
  const [showCaptainDialog, setShowCaptainDialog] = useState(false);

  // Refs for image export
  const teamsRef = useRef(null);
  const inputRef = useRef(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem("teamgen_username");
    if (savedUsername) {
      setIsLoggedIn(true);
      setUsername(savedUsername);
    }
  }, []);

  // Update the handleLogin function to clear players and teams
  const handleLogin = (username) => {
    setIsLoggedIn(true);
    setUsername(username);
    localStorage.setItem("teamgen_username", username);
    setShowLoginDialog(false);

    // Clear selected players and teams
    setPlayers([]);
    resetTeams();
  };

  // Update the handleLogout function to clear players and teams
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    localStorage.removeItem("teamgen_username");

    // Clear selected players and teams
    setPlayers([]);
    resetTeams();
  };

  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (!newPlayer.trim()) return;

    // Generate a unique ID for the player
    const playerId = `player_${Date.now()}`;

    // Create player object
    const playerObj = {
      id: playerId,
      name: newPlayer.trim(),
      category: newCategory,
    };

    if (!players.some((p) => p.name === newPlayer.trim())) {
      setPlayers([...players, playerObj]);
      setNewPlayer("");
      setNewCategory("batsman");
      inputRef.current?.focus();
    }
  };

  const handleSelectStoredPlayer = (player) => {
    if (!players.some((p) => p.id === player.id)) {
      setPlayers([...players, player]);
    }
  };

  const handleRemovePlayer = (playerId) => {
    setPlayers(players.filter((player) => player.id !== playerId));
  };

  const handleEditPlayer = (player) => {
    setEditingPlayer(player);
    setShowEditDialog(true);
  };

  const handleSavePlayer = (updatedPlayer) => {
    // Update player in the current list
    const updatedPlayers = players.map((p) =>
      p.id === updatedPlayer.id ? updatedPlayer : p
    );
    setPlayers(updatedPlayers);

    // If logged in, also update in localStorage
    if (isLoggedIn) {
      const storedPlayers =
        JSON.parse(localStorage.getItem(`players_${username}`)) || [];
      const updatedStoredPlayers = storedPlayers.map((p) =>
        p.id === updatedPlayer.id ? updatedPlayer : p
      );
      localStorage.setItem(
        `players_${username}`,
        JSON.stringify(updatedStoredPlayers)
      );
    }
  };

  const handleDeletePlayer = (playerId) => {
    // Remove from current players list
    setPlayers(players.filter((p) => p.id !== playerId));

    // If logged in, also remove from localStorage
    if (isLoggedIn) {
      const storedPlayers =
        JSON.parse(localStorage.getItem(`players_${username}`)) || [];
      const updatedStoredPlayers = storedPlayers.filter(
        (p) => p.id !== playerId
      );
      localStorage.setItem(
        `players_${username}`,
        JSON.stringify(updatedStoredPlayers)
      );
    }
  };

  // Effect to handle the animation of adding players to teams
  useEffect(() => {
    if (pendingTeamA.length === 0 && pendingTeamB.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      // Add a player to team A if there are pending players
      if (pendingTeamA.length > 0) {
        const nextPlayer = pendingTeamA[0];
        setTeamA((prev) => [...prev, nextPlayer]);
        setPendingTeamA((prev) => prev.slice(1));
      }

      // Add a player to team B if there are pending players
      if (pendingTeamB.length > 0) {
        const nextPlayer = pendingTeamB[0];
        setTeamB((prev) => [...prev, nextPlayer]);
        setPendingTeamB((prev) => prev.slice(1));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [pendingTeamA, pendingTeamB, teamA, teamB]);

  // Effect to check if all players have been assigned
  useEffect(() => {
    if (!dividing) return;

    // If all pending players have been assigned, finish the animation
    if (pendingTeamA.length === 0 && pendingTeamB.length === 0) {
      // Double check that all players are assigned
      const totalAssigned = teamA.length + teamB.length;

      if (totalAssigned === players.length) {
        setTimeout(() => {
          setDividing(false);
          setDivided(true);

          // Trigger confetti effect
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }, 500);
      }
    }
  }, [
    dividing,
    pendingTeamA,
    pendingTeamB,
    teamA.length,
    teamB.length,
    players.length,
  ]);

  // Handle initial divide teams click - show captain selection dialog
  const handleDivideTeamsClick = () => {
    if (players.length < 2) return;

    // Show captain selection dialog
    setShowCaptainDialog(true);
  };

  // Handle captain selection and proceed with team division
  const handleCaptainsSelected = (captainIds) => {
    if (captainIds.length !== 2) return;

    // Mark selected players as captains
    const updatedPlayers = players.map((player) => ({
      ...player,
      isCaptain: captainIds.includes(player.id),
    }));

    setPlayers(updatedPlayers);

    // Now proceed with team division
    divideTeams(updatedPlayers, captainIds);
  };

  // Update the divideTeams function to use the selected captains
  const divideTeams = (updatedPlayersList, captainIds) => {
    const playersList = updatedPlayersList || players;

    setDividing(true);
    setDivided(false);
    setTeamA([]);
    setTeamB([]);

    // Get the two captain players
    const captain1 = playersList.find((p) => p.id === captainIds[0]);
    const captain2 = playersList.find((p) => p.id === captainIds[1]);

    // Get non-captain players
    const nonCaptainPlayers = playersList.filter(
      (p) => !captainIds.includes(p.id)
    );

    // Shuffle non-captain players
    const shuffledPlayers = [...nonCaptainPlayers].sort(
      () => Math.random() - 0.5
    );

    // Separate players by category
    const batsmen = shuffledPlayers.filter((p) => p.category === "batsman");
    const bowlers = shuffledPlayers.filter((p) => p.category === "bowler");
    const allRounders = shuffledPlayers.filter(
      (p) => p.category === "all-rounder"
    );

    // Initialize teams with captains
    const newTeamA = [captain1];
    const newTeamB = [captain2];

    // Helper function to distribute players evenly
    const distributeEvenly = (players) => {
      const teamACount = newTeamA.length;
      const teamBCount = newTeamB.length;

      players.forEach((player, index) => {
        // If team A has fewer players, or equal but it's an even index
        if (
          teamACount + newTeamA.length - teamACount <
            teamBCount + newTeamB.length - teamBCount ||
          (teamACount + newTeamA.length - teamACount ===
            teamBCount + newTeamB.length - teamBCount &&
            index % 2 === 0)
        ) {
          newTeamA.push(player);
        } else {
          newTeamB.push(player);
        }
      });
    };

    // Distribute players by category to balance teams
    distributeEvenly(batsmen);
    distributeEvenly(bowlers);
    distributeEvenly(allRounders);

    // Set the pending players for each team
    setPendingTeamA(newTeamA);
    setPendingTeamB(newTeamB);
  };

  const resetTeams = () => {
    setTeamA([]);
    setTeamB([]);
    setPendingTeamA([]);
    setPendingTeamB([]);
    setDivided(false);
  };

  const saveAsImage = async () => {
    if (!teamsRef.current) return;

    try {
      // Create a container div to hold both teams
      const container = document.createElement("div");
      container.style.display = "flex";
      container.style.flexDirection =
        window.innerWidth < 650 ? "column" : "row";
      container.style.gap = "20px";
      container.style.padding = "20px";
      container.style.background = "white";
      container.style.maxWidth = "850px";
      container.style.width = "fit-content";

      // Clone the team divs
      const teamsClone = teamsRef.current.cloneNode(true);

      // Append to container
      container.appendChild(teamsClone);

      // Temporarily add to document to render
      document.body.appendChild(container);

      // Convert to canvas
      const canvas = await html2canvas(container, {
        backgroundColor: "white",
        scale: 2, // Higher quality
      });

      // Remove temporary container
      document.body.removeChild(container);

      // Convert to image and download
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = "teams.png";
      link.click();
    } catch (error) {
      console.error("Error saving image:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
            <DialogDescription>
              Login to save your players and access them anytime.
            </DialogDescription>
          </DialogHeader>
          <LoginForm onLogin={handleLogin} />
        </DialogContent>
      </Dialog>

      {/* Player Edit Dialog */}
      <PlayerEditDialog
        player={editingPlayer}
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSave={handleSavePlayer}
        onDelete={handleDeletePlayer}
      />

      {/* Captain Selection Dialog */}
      <CaptainSelectionDialog
        isOpen={showCaptainDialog}
        onClose={() => setShowCaptainDialog(false)}
        players={players}
        onCaptainsSelected={handleCaptainsSelected}
      />

      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex flex-col-reverse md:flex-row gap-2 justify-between items-center">
            <CardTitle className="text-2xl md:text-3xl font-bold">
              🏏 Team Generator
            </CardTitle>
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/80">
                  Welcome, {username}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-white hover:text-primary"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLoginDialog(true)}
                className="text-white hover:text-primary"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {isLoggedIn ? (
              // Show player search dropdown for logged-in users
              <PlayerSearch
                onSelectPlayer={handleSelectStoredPlayer}
                username={username}
                selectedPlayers={players}
                onRemovePlayer={handleRemovePlayer}
                onEditPlayer={handleEditPlayer}
              />
            ) : (
              // Show input box for non-logged-in users
              <form onSubmit={handleAddPlayer} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="playerName">Player Name</Label>
                    <Input
                      id="playerName"
                      ref={inputRef}
                      type="text"
                      placeholder="Enter player name"
                      value={newPlayer}
                      onChange={(e) => setNewPlayer(e.target.value)}
                      className="mt-1"
                      disabled={dividing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="playerCategory">Player Category</Label>
                    <Select
                      value={newCategory}
                      onValueChange={setNewCategory}
                      disabled={dividing}
                    >
                      <SelectTrigger id="playerCategory" className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="batsman">Batsman</SelectItem>
                        <SelectItem value="bowler">Bowler</SelectItem>
                        <SelectItem value="all-rounder">All-Rounder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!newPlayer.trim() || dividing}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Player
                </Button>
              </form>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <Users className="mr-2 h-5 w-5 text-purple-600" />
                Players ({players.length})
              </h3>

              {players.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Add players to get started
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {players.map((player) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center"
                      >
                        <span className="mr-1">
                          {getCategoryIcon(player.category)}
                        </span>
                        <span>{player.name}</span>
                        <button
                          onClick={() => handleRemovePlayer(player.id)}
                          className="ml-1 text-purple-600 hover:text-purple-800"
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
                onClick={handleDivideTeamsClick}
                disabled={players.length < 2 || dividing}
                className="bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Shuffle className="mr-2 h-5 w-5" />
                Divide Teams
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {(teamA.length > 0 || teamB.length > 0 || dividing) && (
        <>
          <div className="grid md:grid-cols-2 gap-6" ref={teamsRef}>
            <TeamCard
              title="Team A"
              players={teamA}
              color="purple"
              dividing={dividing}
              pendingCount={pendingTeamA.length}
            />
            <TeamCard
              title="Team B"
              players={teamB}
              color="blue"
              dividing={dividing}
              pendingCount={pendingTeamB.length}
            />
          </div>

          {divided && (
            <div className="flex justify-center gap-4">
              <Button
                onClick={resetTeams}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                Reset Teams
              </Button>
              <Button
                onClick={() => saveAsImage()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Save as Image
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TeamCard({ title, players, color, dividing, pendingCount }) {
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
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        className={`border shadow-md sm:min-w-96 ${colorClasses[color].card}`}
      >
        <CardHeader
          className={`${colorClasses[color].header} text-white rounded-t-lg py-3`}
        >
          <CardTitle className="text-center text-xl">
            {title}{" "}
            {dividing &&
              pendingCount > 0 &&
              `(${players.length} of ${players.length + pendingCount})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="min-h-[200px]">
            {players.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400">
                  {dividing ? "Assigning players..." : "No players assigned"}
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                <AnimatePresence>
                  {players.map((player, index) => (
                    <motion.li
                      key={player.id}
                      initial={{ opacity: 0, x: color === "purple" ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.1 }}
                      className={`${colorClasses[color].player} px-4 rounded-lg h-10 flex items-center`}
                    >
                      <span className={`mr-2`}>
                        {getCategoryIcon(player.category)}
                      </span>
                      <span className="flex-1">{player.name}</span>
                      {player.isCaptain && (
                        <span className="ml-auto flex items-center">
                          <Crown className="h-4 w-4 text-amber-500 mr-1" />
                          <span className="text-xs font-semibold text-amber-700">
                            Captain
                          </span>
                        </span>
                      )}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
