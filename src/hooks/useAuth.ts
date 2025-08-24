import { useState, useEffect } from 'react';
import { User, AuthState } from '../types';

const ADMIN_EMAIL = 'mirza.ovi8@gmail.com';
const ADMIN_PASSWORD = 'P@ssw0rd#2025InvoiceGen';
const USERS_STORAGE_KEY = 'app_users_data';

// Default users
const defaultUsers: User[] = [
  {
    id: '1',
    email: ADMIN_EMAIL,
    name: 'Admin User',
    role: 'admin',
    password: ADMIN_PASSWORD
  },
  {
    id: '2',
    email: 'hasan@company.com',
    name: 'Hasan Khan',
    role: 'member',
    password: 'demo123'
  },
  {
    id: '3',
    email: 'rohan@company.com',
    name: 'Rohan Mostofa',
    role: 'member',
    password: 'demo123'
  },
  {
    id: '4',
    email: 'viewer@company.com',
    name: 'John Viewer',
    role: 'viewer',
    password: 'demo123'
  }
];

const loadUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading users from localStorage:', error);
  }
  return defaultUsers;
};

const saveUsers = (users: User[]) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users to localStorage:', error);
  }
};

// Initialize users from localStorage or defaults
let mockUsers: User[] = loadUsers();

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setAuthState({ user, isAuthenticated: true });
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (user) {
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      localStorage.setItem('currentUser', JSON.stringify(user));
      setAuthState({ user, isAuthenticated: true });
      // Force a page refresh to ensure UI updates
      setTimeout(() => window.location.reload(), 100);
      return true;
    }
    
    return false;
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setAuthState({ user: null, isAuthenticated: false });
    // Force a page refresh to ensure UI updates
    setTimeout(() => window.location.reload(), 100);
  };

  const changePassword = (currentPassword: string, newPassword: string): { success: boolean; error?: string } => {
    if (!authState.user) {
      return { success: false, error: 'User not authenticated' };
    }

    const userInDb = mockUsers.find(u => u.id === authState.user!.id);
    if (!userInDb) {
      return { success: false, error: 'User not found' };
    }

    if (userInDb.password !== currentPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Update password in mock database
    userInDb.password = newPassword;
    saveUsers(mockUsers);
    
    // Update localStorage if needed
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      user.password = newPassword;
      localStorage.setItem('currentUser', JSON.stringify(user));
    }

    return { success: true };
  };

  const changeName = (newName: string): { success: boolean; error?: string } => {
    if (!authState.user) {
      return { success: false, error: 'User not authenticated' };
    }

    const userInDb = mockUsers.find(u => u.id === authState.user!.id);
    if (!userInDb) {
      return { success: false, error: 'User not found' };
    }

    // Update name in mock database
    userInDb.name = newName.trim();
    saveUsers(mockUsers);
    
    // Update current user state
    const updatedUser = { ...authState.user, name: newName.trim() };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setAuthState({ user: updatedUser, isAuthenticated: true });

    return { success: true };
  };

  const createUser = (email: string, name: string): User | null => {
    if (authState.user?.role !== 'admin') return null;
    
    // Check if user already exists
    if (mockUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) return null;
    
    const newUser: User = {
      id: Date.now().toString(),
      email: email.trim(),
      name: name.trim(),
      role: 'member',
      password: 'demo123'
    };
    
    mockUsers.push(newUser);
    saveUsers(mockUsers);
    
    // Force re-render by updating auth state
    setAuthState(prev => ({ ...prev }));
    
    return newUser;
  };

  const createViewer = (email: string, name: string): User | null => {
    if (authState.user?.role !== 'admin') return null;
    
    // Check if user already exists
    if (mockUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) return null;
    
    const newUser: User = {
      id: Date.now().toString(),
      email: email.trim(),
      name: name.trim(),
      role: 'viewer',
      password: 'demo123'
    };
    
    mockUsers.push(newUser);
    saveUsers(mockUsers);
    
    // Force re-render by updating auth state
    setAuthState(prev => ({ ...prev }));
    
    return newUser;
  };

  const removeUser = (userId: string): boolean => {
    if (authState.user?.role !== 'admin') return false;
    
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1 || mockUsers[userIndex].role === 'admin') return false;
    
    mockUsers.splice(userIndex, 1);
    saveUsers(mockUsers);
    
    // Force re-render by updating auth state
    setAuthState(prev => ({ ...prev }));
    
    return true;
  };
  return {
    ...authState,
    login,
    logout,
    changePassword,
    changeName,
    createUser,
    createViewer,
    removeUser,
    allUsers: mockUsers.map(u => ({ ...u, password: undefined }))
  };
};