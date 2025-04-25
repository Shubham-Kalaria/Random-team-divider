"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";

export default function PlayerEditDialog({
  player,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("batsman");

  useEffect(() => {
    if (player) {
      setName(player.name || "");
      setCategory(player.category || "batsman");
    }
  }, [player]);

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      id: player?.id,
      name: name.trim(),
      category,
      isCaptain: player?.isCaptain || false, // Preserve existing captain status
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete(player.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Player</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Player Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter player name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Player Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="batsman">Batsman</SelectItem>
                <SelectItem value="bowler">Bowler</SelectItem>
                <SelectItem value="all-rounder">All-Rounder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex justify-between pt-4">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex items-center"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Player
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
