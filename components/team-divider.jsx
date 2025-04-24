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
} from "lucide-react";
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

export default function TeamDivider() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Team state
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState("");
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);
  const [dividing, setDividing] = useState(false);
  const [divided, setDivided] = useState(false);
  const [pendingTeamA, setPendingTeamA] = useState([]);
  const [pendingTeamB, setPendingTeamB] = useState([]);
  const [printing, setPrinting] = useState(false);

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

  const handleLogin = (username) => {
    setIsLoggedIn(true);
    setUsername(username);
    localStorage.setItem("teamgen_username", username);
    setShowLoginDialog(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    localStorage.removeItem("teamgen_username");
  };

  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (newPlayer.trim() && !players.includes(newPlayer.trim())) {
      setPlayers([...players, newPlayer.trim()]);
      setNewPlayer("");
      inputRef.current?.focus();
    }
  };

  const handleSelectStoredPlayer = (player) => {
    if (!players.includes(player)) {
      setPlayers([...players, player]);
    }
  };

  const handleRemovePlayer = (playerToRemove) => {
    setPlayers(players.filter((player) => player !== playerToRemove));
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

  const divideTeams = () => {
    if (players.length < 2) return;

    setDividing(true);
    setDivided(false);
    setTeamA([]);
    setTeamB([]);

    // Create a copy of the players array to shuffle
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

    // Divide players into two teams
    const halfLength = Math.ceil(shuffledPlayers.length / 2);
    const newTeamA = shuffledPlayers.slice(0, halfLength);
    const newTeamB = shuffledPlayers.slice(halfLength);

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
      container.style.maxWidth = "800px";
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
      setPrinting(false);
    } catch (error) {
      console.error("Error saving image:", error);
    }
  };

  useEffect(() => {
    if (printing) {
      saveAsImage();
    }
  }, [printing]);

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

      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex flex-col-reverse md:flex-row gap-2 justify-between items-center">
            <CardTitle className="text-2xl md:text-3xl font-bold">
              Team Generator
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
              />
            ) : (
              // Show input box for non-logged-in users
              <form onSubmit={handleAddPlayer} className="flex gap-2">
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
          </div>
        </CardContent>
      </Card>

      {(teamA.length > 0 || teamB.length > 0 || dividing) && (
        <>
          <div className="grid md:grid-cols-2 gap-6" ref={teamsRef}>
            <div className="sm:min-w-80">
              <TeamCard
                title="Team A"
                players={teamA}
                color="purple"
                dividing={dividing}
                pendingCount={pendingTeamA.length}
                printing={printing}
              />
            </div>
            <div className="sm:min-w-80">
              <TeamCard
                title="Team B"
                players={teamB}
                color="blue"
                dividing={dividing}
                pendingCount={pendingTeamB.length}
                printing={printing}
              />
            </div>
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
                onClick={() => setPrinting(true)}
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

function TeamCard({ title, players, color, dividing, pendingCount, printing }) {
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
      <Card className={`border shadow-md ${colorClasses[color].card}`}>
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
                      key={player}
                      initial={{ opacity: 0, x: color === "purple" ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.1 }}
                      className={`${colorClasses[color].player} px-4 h-10 ${
                        printing ? "" : "flex items-center"
                      } rounded-lg`}
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
  );
}
