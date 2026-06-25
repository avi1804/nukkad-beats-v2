import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { UserService } from '../services/UserService';

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const profile = await UserService.getProfile(req.user.id);
    res.status(200).json(profile);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const profile = await UserService.updateProfile(req.user.id, req.body);
    res.status(200).json(profile);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// --- Preferences ---
export const getPreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
    const prefs = await UserService.getPreferences(req.user.id);
    res.status(200).json(prefs);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
    const prefs = await UserService.updatePreferences(req.user.id, req.body);
    res.status(200).json(prefs);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// --- Security ---
export const updatePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
    await UserService.updatePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update password' });
  }
};

// --- Sessions ---
export const getSessions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
    const sessions = await UserService.getSessions(req.user.id);
    res.status(200).json(sessions);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const revokeSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
    const sessionId = req.params.sessionId;
    if (!sessionId || Array.isArray(sessionId)) {
      res.status(400).json({ error: 'Invalid session ID' });
      return;
    }
    await UserService.revokeSession(req.user.id, sessionId as string);
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// --- Account Deletion ---
export const deleteAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
    await UserService.deleteAccount(req.user.id);
    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// --- Admin Controllers ---
export const getAllUsersAdmin = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await UserService.getAllUsers();
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserStatusAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;
    
    if (typeof isBlocked !== 'boolean') {
      res.status(400).json({ error: 'isBlocked must be a boolean' });
      return;
    }

    if (!id || Array.isArray(id)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }
    const updatedUser = await UserService.updateUserStatus(id as string, isBlocked);
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update user status' });
  }
};
