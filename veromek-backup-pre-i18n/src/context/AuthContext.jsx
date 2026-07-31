import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [profileLoading, setProfileLoading] =
    useState(false);

  const fetchProfile = useCallback(
    async (userId) => {
      if (!userId) {
        setProfile(null);
        setProfileLoading(false);

        return {
          data: null,
          error: null,
        };
      }

      setProfileLoading(true);

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            `
              id,
              full_name,
              role,
              created_at,
              updated_at
            `
          )
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        const normalizedProfile = data
          ? {
              ...data,
              role:
                data.role || "customer",
            }
          : {
              id: userId,
              full_name: "",
              role: "customer",
              created_at: null,
              updated_at: null,
            };

        setProfile(normalizedProfile);

        return {
          data: normalizedProfile,
          error: null,
        };
      } catch (error) {
        console.error(
          "Failed to fetch profile:",
          error
        );

        setProfile(null);

        return {
          data: null,
          error,
        };
      } finally {
        setProfileLoading(false);
      }
    },
    []
  );

  const refreshProfile = useCallback(
    async () => {
      if (!user?.id) {
        setProfile(null);

        return {
          data: null,
          error: null,
        };
      }

      return fetchProfile(user.id);
    },
    [fetchProfile, user?.id]
  );

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!mounted) {
          return;
        }

        const currentUser =
          currentSession?.user ?? null;

        setSession(currentSession);
        setUser(currentUser);

        if (currentUser?.id) {
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error(
          "Failed to initialize auth:",
          error
        );

        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        if (!mounted) {
          return;
        }

        const nextUser =
          nextSession?.user ?? null;

        setSession(nextSession);
        setUser(nextUser);
        setAuthLoading(false);

        if (nextUser?.id) {
          await fetchProfile(nextUser.id);
        } else {
          setProfile(null);
          setProfileLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const register = useCallback(
    async ({
      email,
      password,
      firstName,
      lastName,
      fullName,
    }) => {
      const cleanFullName =
        fullName?.trim() ||
        `${firstName || ""} ${
          lastName || ""
        }`.trim();

      const { data, error } =
        await supabase.auth.signUp({
          email,
          password,

          options: {
            emailRedirectTo:
              "https://veromek.com/email-confirmed",

            data: {
              first_name:
                firstName?.trim() || "",
              last_name:
                lastName?.trim() || "",
              full_name: cleanFullName,
            },
          },
        });

      if (error) {
        return {
          data,
          error,
        };
      }

      const identities =
        data?.user?.identities;

      const appearsAlreadyRegistered =
        Array.isArray(identities) &&
        identities.length === 0;

      if (appearsAlreadyRegistered) {
        return {
          data: null,
          error: new Error(
            "An account with this email already exists. Please log in or reset your password."
          ),
        };
      }

      return {
        data,
        error: null,
      };
    },
    []
  );

  const login = useCallback(
    async ({ email, password }) => {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      return {
        data,
        error,
      };
    },
    []
  );

  const logout = useCallback(async () => {
    const { error } =
      await supabase.auth.signOut();

    if (!error) {
      setSession(null);
      setUser(null);
      setProfile(null);
    }

    return {
      error,
    };
  }, []);

  const updateProfile = useCallback(
    async (values) => {
      if (!user?.id) {
        return {
          data: null,
          error: new Error(
            "You must be logged in."
          ),
        };
      }

      const allowedValues = {
        full_name:
          values.full_name?.trim() || "",
      };

      const { data, error } = await supabase
        .from("profiles")
        .update(allowedValues)
        .eq("id", user.id)
        .select(
          `
            id,
            full_name,
            role,
            created_at,
            updated_at
          `
        )
        .maybeSingle();

      if (!error && data) {
        setProfile({
          ...data,
          role: data.role || "customer",
        });
      }

      return {
        data,
        error,
      };
    },
    [user?.id]
  );

  const role =
    profile?.role || "customer";

  const isSuperAdmin =
    role === "super_admin";

  const isAdmin =
    role === "admin" ||
    role === "super_admin";

  const isAuthenticated =
    Boolean(user && session);

  const loading =
    authLoading || profileLoading;

  const value = useMemo(
    () => ({
      session,
      user,
      profile,

      role,
      isAdmin,
      isSuperAdmin,
      isAuthenticated,

      loading,
      authLoading,
      profileLoading,

      register,
      login,
      logout,
      updateProfile,
      refreshProfile,
    }),
    [
      session,
      user,
      profile,
      role,
      isAdmin,
      isSuperAdmin,
      isAuthenticated,
      loading,
      authLoading,
      profileLoading,
      register,
      login,
      logout,
      updateProfile,
      refreshProfile,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}