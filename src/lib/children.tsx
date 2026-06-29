import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type Child = {
  id: string;
  user_id: string;
  name: string;
  preferred_name: string | null;
  dob: string | null;
  notes: string | null;
  avatar_url: string | null;
};

type Ctx = {
  children: Child[];
  activeChild: Child | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setActive: (id: string) => Promise<void>;
  addChild: (data: { name: string; preferred_name?: string | null; dob?: string | null; notes?: string | null }) => Promise<Child | null>;
  updateChild: (id: string, patch: Partial<Child>) => Promise<void>;
  removeChild: (id: string) => Promise<void>;
};

const ChildrenCtx = createContext<Ctx | null>(null);

export function ChildrenProvider({ children }: { children: ReactNode }) {
  const { user, profile, updateProfile } = useAuth();
  const [list, setList] = useState<Child[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setList([]); return; }
    setLoading(true);
    const { data } = await supabase.from("children").select("*").eq("user_id", user.id).order("created_at");
    setList((data as Child[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const activeId = profile?.active_child_id ?? null;
  const activeChild = list.find((c) => c.id === activeId) ?? list[0] ?? null;

  const setActive = async (id: string) => {
    await updateProfile({ active_child_id: id } as any);
  };

  const addChild: Ctx["addChild"] = async (data) => {
    if (!user) return null;
    const { data: row } = await supabase
      .from("children")
      .insert({ user_id: user.id, name: data.name, preferred_name: data.preferred_name ?? null, dob: data.dob ?? null, notes: data.notes ?? null })
      .select()
      .maybeSingle();
    if (row) {
      setList((l) => [...l, row as Child]);
      if (!activeId) await updateProfile({ active_child_id: (row as Child).id } as any);
    }
    return (row as Child) ?? null;
  };

  const updateChild: Ctx["updateChild"] = async (id, patch) => {
    const { data } = await supabase.from("children").update(patch).eq("id", id).select().maybeSingle();
    if (data) setList((l) => l.map((c) => (c.id === id ? { ...c, ...(data as Child) } : c)));
  };

  const removeChild: Ctx["removeChild"] = async (id) => {
    await supabase.from("children").delete().eq("id", id);
    setList((l) => l.filter((c) => c.id !== id));
    if (activeId === id) {
      const next = list.find((c) => c.id !== id);
      await updateProfile({ active_child_id: next?.id ?? null } as any);
    }
  };

  return (
    <ChildrenCtx.Provider value={{ children: list, activeChild, loading, refresh, setActive, addChild, updateChild, removeChild }}>
      {children}
    </ChildrenCtx.Provider>
  );
}

export function useChildren() {
  const v = useContext(ChildrenCtx);
  if (!v) throw new Error("useChildren must be inside ChildrenProvider");
  return v;
}

/** Convenient: returns the active child's display name, falling back to profile.child_name. */
export function useActiveChildName() {
  const { activeChild } = useChildren();
  const { profile } = useAuth();
  return (
    activeChild?.preferred_name?.trim() ||
    activeChild?.name?.trim() ||
    profile?.child_name?.trim() ||
    profile?.preferred_name?.trim() ||
    ""
  );
}
