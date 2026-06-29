import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AutismCenter } from "./types";

/**
 * Data layer for the autism-centers feature module.
 * Reads exclusively from public.autism_centers; RLS restricts results to
 * verification_status = 'verified' for anonymous and signed-in users alike.
 */
async function fetchVerifiedCenters(): Promise<AutismCenter[]> {
  const { data, error } = await supabase
    .from("autism_centers" as never)
    .select(
      "id,name,category,description,services_offered,address,city,region,latitude,longitude,phone,email,website,opening_hours,verification_status,created_at,updated_at",
    )
    .eq("verification_status", "verified")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as AutismCenter[];
}

export const autismCentersQueryOptions = () =>
  queryOptions({
    queryKey: ["autism-centers", "verified"],
    queryFn: fetchVerifiedCenters,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });
