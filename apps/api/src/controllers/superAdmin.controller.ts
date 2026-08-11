import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Workspace } from "../models/Workspace";
import { User } from "../models/User";
import { WorkspaceMember } from "../models/WorkspaceMember";
import { Subscription } from "../models/Subscription";

export async function getSuperAdminStats(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const [totalWorkspaces, totalUsers, totalMembers] = await Promise.all([
      Workspace.countDocuments(),
      User.countDocuments(),
      WorkspaceMember.countDocuments()
    ]);

    res.json({
      stats: {
        totalWorkspaces,
        totalUsers,
        totalMembers
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function listWorkspaces(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [workspaces, total] = await Promise.all([
      Workspace.find()
        .populate("ownerId", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Workspace.countDocuments()
    ]);

    res.json({
      workspaces,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function suspendWorkspace(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    const subscription = await Subscription.findOne({
      workspaceId: workspace._id
    });

    if (subscription) {
      subscription.status = "cancelled";
      await subscription.save();
    }

    res.json({ message: "Workspace suspended" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function reactivateWorkspace(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    const subscription = await Subscription.findOne({
      workspaceId: workspace._id
    });

    if (subscription) {
      subscription.status = "active";
      await subscription.save();
    }

    res.json({ message: "Workspace reactivated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
