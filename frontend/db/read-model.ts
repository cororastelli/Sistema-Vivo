import { getSupabaseStore, usesSupabase } from "./supabase";
import { eq } from "drizzle-orm";
import { getDb } from "./index";
import { entityLinks, evidence, evaluations, issues, projects, regulations, relations, sources, spaces, stakeholders } from "./schema";
import { initialDashboardData } from "@/lib/initial-data";
import type { DashboardData } from "@/lib/system-vivo-types";

export async function readDashboardData(): Promise<DashboardData> {
  // Once Supabase is selected, errors must not silently read a different database.
  if (usesSupabase()) {
    try {
      return await getSupabaseStore().readDashboard() as DashboardData;
    } catch (error) {
      console.error("Supabase dashboard read failed", error instanceof Error ? error.message : "unknown error");
      throw error;
    }
  }
  try {
    const db = getDb();
    const spaceRows = await db.select().from(spaces);
    if (!spaceRows.length) return initialDashboardData;

    const evidenceRows = await db
      .select({
        id: evidence.id,
        spaceId: evidence.spaceId,
        title: evidence.title,
        detail: evidence.detail,
        dimension: evidence.dimension,
        layerId: evidence.layerId,
        recordType: evidence.recordType,
        provider: evidence.provider,
        geographicScope: evidence.geographicScope,
        state: evidence.state,
        method: evidence.method,
        limitation: evidence.limitation,
        observedAt: evidence.observedAt,
        updatedAt: evidence.updatedAt,
        sourceTitle: sources.title,
        sourceUrl: sources.url,
      })
      .from(evidence)
      .leftJoin(sources, eq(evidence.sourceId, sources.id));

    const relationRows = await db.select().from(relations);

    return {
      spaces: spaceRows,
      evidence: evidenceRows,
      issues: await db.select().from(issues),
      evaluations: await db.select().from(evaluations),
      relations: relationRows.map((row) => ({
        ...row,
        sharedMechanisms: JSON.parse(row.sharedMechanisms) as string[],
      })),
      stakeholders: await db.select().from(stakeholders),
      projects: await db.select().from(projects),
      regulations: await db.select().from(regulations),
      entityLinks: await db.select().from(entityLinks),
      databaseAvailable: true,
    };
  } catch {
    return initialDashboardData;
  }
}
