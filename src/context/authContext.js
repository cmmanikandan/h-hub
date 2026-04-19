import { createContext, useContext } from 'react';
export { AuthProvider } from './AuthContext.jsx';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);