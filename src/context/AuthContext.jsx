import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.is_admin === true;

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST205") throw error;
      setProfile(data);
      return data;
    } catch (error) {
      console.warn("Could not fetch user profile:", error.message);
      setProfile(null);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (session?.user?.id) {
      await fetchProfile(session.user.id);
    }
  };

  const recordActivity = async (userId) => {
    const { error } = await supabase
      .from("user_activity")
      .upsert({ user_id: userId, last_active: new Date().toISOString() });

    if (error) console.warn("Could not record user activity:", error.message);
  };

  // Sign up
  const signUpNewUser = async (email, password, data) => {
    const { error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: password,
      options: {
        data: {
          display_name: data.displayName,
          phone: data.phone,
        },
      },
    });

    if (error) {
      console.error("Error signing up: ", error);
      return { success: false, error };
    }

    return { success: true };
  };

  // Sign in
  const signInUser = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password,
      });

      if (error) {
        console.error("Sign-in error:", error.message);
        return { success: false, error: error.message };
      }

      console.log("Sign-in success:", data);
      return { success: true, data };
    } catch (error) {
      console.error("Unexpected error during sign-in:", error.message);
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      };
    }
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return undefined;

    const updateActivity = () => recordActivity(session.user.id);
    updateActivity();
    const timer = window.setInterval(updateActivity, 60000);
    window.addEventListener("focus", updateActivity);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", updateActivity);
    };
  }, [session?.user?.id]);

  // Sign out
  async function signOut() {
    localStorage.removeItem("nestinvest_admin_session");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{ signUpNewUser, signInUser, session, signOut, profile, isAdmin, loading, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
