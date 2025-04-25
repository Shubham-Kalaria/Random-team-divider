"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { getCategoryIcon } from "@/lib/utils";

export default function CaptainSelectionDialog({
  isOpen,
  onClose,
  players,
  onCaptainsSelected,
}) {
  const [selectedCaptains, setSelectedCaptains] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // Reset selections when dialog opens
    if (isOpen) {
      setSelectedCaptains([]);
      setError("");
    }
  }, [isOpen]);

  const handleCaptainToggle = (playerId) => {
    setSelectedCaptains((prev) => {
      // If already selected, remove it
      if (prev.includes(playerId)) {
        return prev.filter((id) => id !== playerId);
      }

      // If we already have 2 captains and trying to add more
      if (prev.length >= 2) {
        return [...prev.slice(1), playerId]; // Remove the first one and add the new one
      }

      // Otherwise add it
      return [...prev, playerId];
    });

    // Clear error when selection changes
    setError("");
  };

  const handleConfirm = () => {
    if (selectedCaptains.length !== 2) {
      setError("Please select exactly 2 captains");
      return;
    }

    onCaptainsSelected(selectedCaptains);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Team Captains</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center text-sm mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}

        <div className="text-sm text-gray-600 mb-4">
          Please select exactly 2 players to be team captains. Captains will be
          placed in different teams.
        </div>

        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md"
            >
              <Checkbox
                id={`captain-${player.id}`}
                checked={selectedCaptains.includes(player.id)}
                onCheckedChange={() => handleCaptainToggle(player.id)}
              />
              <Label
                htmlFor={`captain-${player.id}`}
                className="flex items-center cursor-pointer flex-1"
              >
                <span className="mr-2">{getCategoryIcon(player.category)}</span>
                <span>{player.name}</span>
              </Label>
              <span className="text-xs text-gray-500">{player.category}</span>
            </div>
          ))}
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm Captains ({selectedCaptains.length}/2)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
