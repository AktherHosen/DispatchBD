import { Request, Response } from "express";
import { z } from "zod";
import { User } from "../models/User";
import { Workspace } from "../models/Workspace";
import { WorkspaceMember } from "../models/WorkspaceMember";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from "../utils/tokens";
import { AuthRequest } from "../middlewares/auth.middleware";

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0].message });
      return;
    }

    const { name, email, password } = parsed.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }

    const user = await User.create({ name, email, password });

    // Create default workspace
    const slug = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-");
    const workspace = await Workspace.create({
      name: `${name}'s Workspace`,
      slug: `${slug}-${Date.now()}`,
      ownerId: user._id
    });

    await WorkspaceMember.create({
      workspaceId: workspace._id,
      userId: user._id,
      role: "owner"
    });

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      workspace: {
        id: workspace._id.toString(),
        name: workspace.name,
        slug: workspace.slug
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0].message });
      return;
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Get user's first workspace
    const member = await WorkspaceMember.findOne({ userId: user._id }).populate(
      "workspaceId"
    );

    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      workspace: member?.workspaceId
        ? { id: (member.workspaceId as any)._id.toString(), name: (member.workspaceId as any).name, slug: (member.workspaceId as any).slug }
        : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
}

export async function refreshToken(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      res.status(401).json({ message: "No refresh token" });
      return;
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    const accessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const member = await WorkspaceMember.findOne({
      userId: req.user._id
    }).populate("workspaceId");

    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      },
      workspace: member?.workspaceId
        ? { id: (member.workspaceId as any)._id.toString(), name: (member.workspaceId as any).name, slug: (member.workspaceId as any).slug }
        : null
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function listWorkspaces(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const members = await WorkspaceMember.find({
      userId: req.user._id
    }).populate("workspaceId");

    const workspaces = members
      .filter((m) => m.workspaceId)
      .map((m) => ({
        id: (m.workspaceId as any)._id.toString(),
        name: (m.workspaceId as any).name,
        slug: (m.workspaceId as any).slug,
        role: m.role
      }));

    res.json({ workspaces });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
