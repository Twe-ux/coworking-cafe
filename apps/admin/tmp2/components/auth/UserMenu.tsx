"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className }: UserMenuProps) {
  const { user, logout, hasRole } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    toast.success("Déconnexion réussie");
    router.push("/login");
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2 text-sm">
        <User className="h-4 w-4" />
        <span className="font-medium">
          {user.firstName} {user.lastName}
        </span>
        <span className="text-muted-foreground">({user.role})</span>
      </div>

      {hasRole("admin") && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/settings")}
          className="h-8"
        >
          <Settings className="h-4 w-4" />
        </Button>
      )}

      <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
