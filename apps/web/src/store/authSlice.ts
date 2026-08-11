import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  workspace: Workspace | null;
  isAuthenticated: boolean;
}

// Load from localStorage
const loadInitialState = (): AuthState => {
  try {
    const token = localStorage.getItem("accessToken");
    const userStr = localStorage.getItem("user");
    const workspaceStr = localStorage.getItem("workspace");
    
    if (token && userStr && workspaceStr) {
      return {
        accessToken: token,
        user: JSON.parse(userStr),
        workspace: JSON.parse(workspaceStr),
        isAuthenticated: true
      };
    }
  } catch {
    // Ignore parse errors
  }
  
  return {
    accessToken: null,
    user: null,
    workspace: null,
    isAuthenticated: false
  };
};

const initialState: AuthState = loadInitialState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; user: User; workspace: Workspace }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.workspace = action.payload.workspace;
      state.isAuthenticated = true;
      
      // Persist to localStorage
      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("workspace", JSON.stringify(action.payload.workspace));
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    setWorkspace: (state, action: PayloadAction<Workspace>) => {
      state.workspace = action.payload;
      localStorage.setItem("workspace", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      state.workspace = null;
      state.isAuthenticated = false;
      
      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("workspace");
    }
  }
});

export const { setCredentials, setUser, setWorkspace, logout } = authSlice.actions;
export default authSlice.reducer;
