import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { WorkspaceMember, MemberRole } from "../models/WorkspaceMember";

export interface WorkspaceAuthRequest extends AuthRequest {
  workspaceId?: string;
  memberRole?: MemberRole;
}

export async function workspaceMiddleware(
  req: WorkspaceAuthRequest,
  res: Response,
  next: Function
): Promise<void> {
  try {
    const workspaceId = req.headers["x-workspace-id"] as string;
    if (!workspaceId) {
      res.status(400).json({ message: "Workspace ID required" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const member = await WorkspaceMember.findOne({
      workspaceId,
      userId: req.user._id
    });

    if (!member) {
      res.status(403).json({ message: "Not a member of this workspace" });
      return;
    }

    req.workspaceId = workspaceId;
    req.memberRole = member.role;
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export function requireRole(...roles: MemberRole[]) {
  return (req: WorkspaceAuthRequest, res: Response, next: Function) => {
    if (!req.memberRole || !roles.includes(req.memberRole)) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }
    next();
  };
}
