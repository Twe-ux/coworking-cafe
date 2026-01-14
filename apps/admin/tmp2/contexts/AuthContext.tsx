"use client";

import { AuthContextType, LoginCredentials, User } from "@/types/auth";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users pour démonstration - À remplacer par votre API
const MOCK_USERS = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    role: "admin" as const,
    firstName: "Admin",
    lastName: "User",
  },
  {
    id: "2",
    username: "staff",
    password: "staff123",
    role: "staff" as const,
    firstName: "Staff",
    lastName: "Member",
  },
  {
    id: "3",
    username: "manager",
    password: "manager123",
    role: "admin" as const,
    firstName: "Manager",
    lastName: "Admin",
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const savedUser = localStorage.getItem("auth_user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error(
          "Erreur lors du parsing de l'utilisateur sauvegardé:",
          error,
        );
        localStorage.removeItem("auth_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Simulation d'un délai d'API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Recherche de l'utilisateur dans les mocks
      const foundUser = MOCK_USERS.find(
        (u) =>
          u.username === credentials.username &&
          u.password === credentials.password,
      );

      if (foundUser) {
        const user: User = {
          id: foundUser.id,
          username: foundUser.username,
          role: foundUser.role,
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
        };

        setUser(user);
        localStorage.setItem("auth_user", JSON.stringify(user));

        // Définir un cookie pour le middleware
        document.cookie = `auth_user=${JSON.stringify(user)}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 jours

        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");

    // Supprimer le cookie
    document.cookie =
      "auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
  };

  const hasRole = (role: "admin" | "staff"): boolean => {
    if (!user) return false;
    if (role === "staff") {
      // Les admins ont aussi accès aux fonctionnalités staff
      return user.role === "admin" || user.role === "staff";
    }
    return user.role === role;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}
