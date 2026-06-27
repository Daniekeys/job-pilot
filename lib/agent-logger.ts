import { createInsforgeServer } from "@/lib/insforge-server";

export async function logAgentError(
  runId: string | null,
  userId: string,
  message: string,
  jobId?: string,
): Promise<void> {
  try {
    const insforge = await createInsforgeServer();
    await insforge.database.from("agent_logs").insert([
      {
        run_id: runId,
        user_id: userId,
        message,
        level: "error",
        job_id: jobId ?? null,
      },
    ]);
  } catch (error) {
    console.error("[lib/agent-logger]", error);
  }
}
