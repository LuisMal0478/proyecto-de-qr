import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Consultar perfil de usuario con el token existente
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (err) {
      console.error('Error al cargar datos del usuario:', err);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // Registrar nuevo usuario
  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data);
        return { success: true };
      }
      return { success: false, message: 'No se pudo completar el registro' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error en el servidor al registrarse',
      };
    }
  };

  // Iniciar sesión
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data);
        return { success: true };
      }
      return { success: false, message: 'Correo o contraseña incorrectos' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error en el servidor al iniciar sesión',
      };
    }
  };

  // Cerrar sesión
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Actualizar rol localmente tras pago aprobado
  const upgradeToPremium = () => {
    if (user) {
      setUser((prev) => ({
        ...prev,
        role: 'premium',
        subscription: {
          ...prev.subscription,
          status: 'active',
        },
      }));
    }
  };

  // Iniciar sesión / registrarse con Google
  const loginWithGoogle = async (credential, mockUser = null) => {
    try {
      const res = await api.post('/auth/google', { credential, mockUser });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data);
        return { success: true };
      }
      return { success: false, message: 'Error de autenticación con Google' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error en el servidor al autenticar con Google',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isPremium: user?.role === 'premium' || user?.role === 'admin',
        login,
        register,
        loginWithGoogle,
        logout,
        loadUser,
        upgradeToPremium,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
