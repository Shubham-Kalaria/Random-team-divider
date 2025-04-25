"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    // In a real app, you would validate against a backend
    onLogin(username);
  };

  return (
    <div className="p-4 pt-0 md:pt-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          Login
        </Button>
      </form>
    </div>
  );
}
