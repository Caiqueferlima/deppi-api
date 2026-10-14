import React from "react";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Cargo, Usuario } from "./api";
import { login as loginRequest } from "./api";

const TOKEN_KEY = "deppi_token";
const USER_KEY = "deppi_usuario";

interface AuthContextValue {
  token: string | null;
  usuario: Usuario | null;
  login: (email: string, senha: string) => Promise<void>;
  loginDemo: (cargo: Cargo) => void;
  logout: () => void;
  hasRole: (...roles: Cargo[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadUser(): Usuario | null {
  const saved = localStorage.getItem(USER_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved) as Usuario;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [usuario, setUsuario] = useState<Usuario | null>(loadUser);

  const value = useMemo<AuthContextValue>(() => ({
    token,
    usuario,
    async login(email, senha) {
      const result = await loginRequest(email, senha);
      localStorage.setItem(TOKEN_KEY, result.token);
      localStorage.setItem(USER_KEY, JSON.stringify(result.usuario));
      setToken(result.token);
      setUsuario(result.usuario);
    },
    loginDemo(cargo) {
      const usuario: Usuario = {
        id: `demo-${cargo.toLowerCase()}`,
        nome: `Usuário ${cargo}`,
        email: `${cargo.toLowerCase()}@demo.local`,
        cargos: [cargo],
      };
      const demoToken = `demo-${cargo.toLowerCase()}`;
      localStorage.setItem(TOKEN_KEY, demoToken);
      localStorage.setItem(USER_KEY, JSON.stringify(usuario));
      setToken(demoToken);
      setUsuario(usuario);
    },
    logout() {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setUsuario(null);
    },
    hasRole(...roles) {
      return Boolean(usuario?.cargos.some((cargo) => roles.includes(cargo)));
    },
  }), [token, usuario]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}
