import { Response } from "express";
import { z } from "zod";
import { WorkspaceMember, MemberRole } from "../models/WorkspaceMember";
import { User } from "../models/User";
import { WorkspaceAuthRequest } from "../middlewares/workspace.middleware";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "moderator"]).default("moderator")
});

const updateRoleSchema = z.object({
  role: z.enum(["admin", "moderator"])
});

export async function listMembers(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    const members = await WorkspaceMember.find({
      workspaceId: req.workspaceId
    }).populate("userId", "name email createdAt");

    const formatted = members
      .filter((m) => m.userId)
      .map((m) => ({
        id: m._id,
        userId: (m.userId as any)._id.toString(),
        name: (m.userId as any).name,
        email: (m.userId as any).email,
        role: m.role,
        joinedAt: (m as any).createdAt
      }));

    res.json({ members: formatted });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function inviteMember(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    if (req.memberRole !== "owner" && req.memberRole !== "admin") {
      res.status(403).json({ message: "Only owners and admins can invite members" });
      return;
    }

    const parsed = inviteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0].message });
      return;
    }

    const { email, role } = parsed.data;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found. They must register first." });
      return;
    }

    const existing = await WorkspaceMember.findOne({
      workspaceId: req.workspaceId,
      userId: user._id
    });

    if (existing) {
      res.status(409).json({ message: "User is already a member of this workspace" });
      return;
    }

    const member = await WorkspaceMember.create({
      workspaceId: req.workspaceId,
      userId: user._id,
      role
    });

    res.status(201).json({
      member: {
        id: member._id,
        userId: user._id,
        name: user.name,
        email: user.email,
        role: member.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function updateMemberRole(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    if (req.memberRole !== "owner") {
      res.status(403).json({ message: "Only owners can change roles" });
      return;
    }

    const parsed = updateRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0].message });
      return;
    }

    const member = await WorkspaceMember.findOne({
      _id: req.params.id,
      workspaceId: req.workspaceId
    });

    if (!member) {
      res.status(404).json({ message: "Member not found" });
      return;
    }

    if (member.role === "owner") {
      res.status(400).json({ message: "Cannot change owner's role" });
      return;
    }

    member.role = parsed.data.role;
    await member.save();

    res.json({ message: "Role updated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function removeMember(
  req: WorkspaceAuthRequest,
  res: Response
): Promise<void> {
  try {
    if (req.memberRole !== "owner" && req.memberRole !== "admin") {
      res.status(403).json({ message: "Only owners and admins can remove members" });
      return;
    }

    const member = await WorkspaceMember.findOne({
      _id: req.params.id,
      workspaceId: req.workspaceId
    });

    if (!member) {
      res.status(404).json({ message: "Member not found" });
      return;
    }

    if (member.role === "owner") {
      res.status(400).json({ message: "Cannot remove the owner" });
      return;
    }

    await WorkspaceMember.findByIdAndDelete(member._id);

    res.json({ message: "Member removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
