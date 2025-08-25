import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, AuthState } from '../types';
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = 'mirza.ovi8@gmail.com';
const ADMIN_PASSWORD = 'P@ssw0rd#2025InvoiceGen';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Initialize admin user and load users
  useEffect(() => {
    initializeAdminUser();
    loadUsers();
    checkAuthState();
  }, []);

  const initializeAdminUser = async () => {
    try {
      // Check if admin user exists
      const { data: existingAdminData } = await supabase
        .from('users')
        .select('*')
        .eq('email', ADMIN_EMAIL);

      const existingAdmin = existingAdminData && existingAdminData.length > 0 ? existingAdminData[0] : null;

      if (!existingAdmin) {
        // Create admin user
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await supabase
          .from('users')
          .insert({
            email: ADMIN_EMAIL,
            name: 'Admin User',
            role: 'admin',
            password_hash: hashedPassword
          });
      }

      // Create default users if they don't exist
      const defaultUsers = [
        { email: 'hasan@company.com', name: 'Hasan Khan', role: 'member' },
        { email: 'rohan@company.com', name: 'Rohan Mostofa', role: 'member' },
        { email: 'viewer@company.com', name: 'John Viewer', role: 'viewer' }
      ];

      for (const user of defaultUsers) {
        const { data: existingUserData } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email);

        const existingUser = existingUserData && existingUserData.length > 0 ? existingUserData[0] : null;

        if (!existingUser) {
          const hashedPassword = await bcrypt.hash('demo123', 10);
          await supabase
            .from('users')
            .insert({
              ...user,
              password_hash: hashedPassword
            });
        }
      }
    } catch (error) {
      console.error('Error initializing admin user:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, role')
        .order('created_at');

      if (error) throw error;

      setAllUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const checkAuthState = () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({ user, isAuthenticated: true });
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email);

      if (error || !userData || userData.length === 0) return false;
      
      const user = userData[0];

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) return false;

      const userWithoutPassword = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };

      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      setAuthState({ user: userWithoutPassword, isAuthenticated: true });
      
      setTimeout(() => window.location.reload(), 100);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setAuthState({ user: null, isAuthenticated: false });
    setTimeout(() => window.location.reload(), 100);
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!authState.user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', authState.user.id);

      if (error || !userData || userData.length === 0) {
        return { success: false, error: 'User not found' };
      }

      const user = userData[0];
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return { success: false, error: 'Current password is incorrect' };
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password_hash: hashedNewPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', authState.user.id);

      if (updateError) {
        return { success: false, error: 'Failed to update password' };
      }

      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: 'An error occurred' };
    }
  };

  const changeName = async (newName: string): Promise<{ success: boolean; error?: string }> => {
    if (!authState.user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          name: newName.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', authState.user.id);

      if (error) {
        return { success: false, error: 'Failed to update name' };
      }

      const updatedUser = { ...authState.user, name: newName.trim() };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setAuthState({ user: updatedUser, isAuthenticated: true });
      
      await loadUsers(); // Refresh users list
      return { success: true };
    } catch (error) {
      console.error('Name change error:', error);
      return { success: false, error: 'An error occurred' };
    }
  };

  const createUser = async (email: string, name: string): Promise<User | null> => {
    if (authState.user?.role !== 'admin') return null;
    
    try {
      const hashedPassword = await bcrypt.hash('demo123', 10);
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: email.trim(),
          name: name.trim(),
          role: 'member',
          password_hash: hashedPassword
        })
        .select('id, email, name, role')
        .single();

      if (error) {
        console.error('Create user error:', error);
        return null;
      }

      await loadUsers(); // Refresh users list
      return data;
    } catch (error) {
      console.error('Create user error:', error);
      return null;
    }
  };

  const createViewer = async (email: string, name: string): Promise<User | null> => {
    if (authState.user?.role !== 'admin') return null;
    
    try {
      const hashedPassword = await bcrypt.hash('demo123', 10);
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: email.trim(),
          name: name.trim(),
          role: 'viewer',
          password_hash: hashedPassword
        })
        .select('id, email, name, role')
        .single();

      if (error) {
        console.error('Create viewer error:', error);
        return null;
      }

      await loadUsers(); // Refresh users list
      return data;
    } catch (error) {
      console.error('Create viewer error:', error);
      return null;
    }
  };

  const removeUser = async (userId: string): Promise<boolean> => {
    if (authState.user?.role !== 'admin') return false;
    
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Remove user error:', error);
        return false;
      }

      await loadUsers(); // Refresh users list
      return true;
    } catch (error) {
      console.error('Remove user error:', error);
      return false;
    }
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
    allUsers
  };
};