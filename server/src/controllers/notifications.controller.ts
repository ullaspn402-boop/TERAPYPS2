import { Request, Response } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

/**
 * GET /api/notifications
 * Returns all notifications for the currently logged-in user, newest first.
 */
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const mapped = notifications.map((n) => ({
      id: n._id.toString(),
      title: n.title,
      description: n.description,
      timestamp: formatRelativeTime(n.createdAt),
      type: n.type,
      priority: n.priority,
      unread: !n.read,
      relatedCaseId: n.relatedCaseId?.toString(),
    }));

    res.json({ success: true, data: mapped });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PUT /api/notifications/:id/read
 * Marks a single notification as read.
 */
export const markNotificationRead = async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.json({ success: true, data: { id: notification._id, read: notification.read } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PUT /api/notifications/read-all
 * Marks all notifications for the current user as read.
 */
export const markAllNotificationsRead = async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, read: false },
      { read: true }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── Helper ────────────────────────────────────────────────────────────────

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}
