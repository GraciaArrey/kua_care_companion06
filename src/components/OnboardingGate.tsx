import { useEffect, type ReactNode } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

const PUBLIC_PATHS = ["/", "/signin", "/signup", "/privacy", "/terms"];
const ALLOW_AUTHED_PATHS = ["/onboarding", "/settings", "/privacy", "/terms"];

export function OnboardingGate({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    const path = loc.pathname;
    const needsOnboarding = profile && profile.onboarded === false;
    if (needsOnboarding && !ALLOW_AUTHED_PATHS.includes(path) && !PUBLIC_PATHS.includes(path)) {
      nav({ to: "/onboarding" });
    }
  }, [user, profile, loading, loc.pathname, nav]);

  return <>{children}</>;
}
