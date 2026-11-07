import { createClient } from "@/lib/supabase/server";

export async function getUserMemories(
  userId: string
): Promise<string> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_memories")
      .select("memory")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(20);

    if (error || !data?.length) return "";

    return (
      "\n\nPRIVATE USER MEMORIES:\n" +
      data.map((item) => `- ${item.memory}`).join("\n") +
      "\nUse these memories naturally when relevant. " +
      "Respect the user's latest corrections."
    );
  } catch (error) {
    console.error("Memory retrieval failed:", error);
    return "";
  }
}

export async function saveUserMemory(
  userId: string,
  message: string
): Promise<void> {
  const pattern =
    /^(?:please\s+)?(?:remember|save|keep in mind|don't forget)\s+(?:that\s+)?/i;

  if (!pattern.test(message.trim())) return;

  const memory = message.trim().replace(pattern, "").trim();

  if (!memory || memory.length > 500) return;

  // Never save passwords, financial credentials, or highly sensitive details.
  const sensitivePattern =
    /password|passcode|pin number|bank account|account number|card number|cvv|social security|medical diagnosis|my medication|my health condition|sexual orientation/i;

  if (sensitivePattern.test(memory)) return;

  try {
    const supabase = await createClient();

    const { data } = await supabase
      .from("user_memories")
      .select("id, memory")
      .eq("user_id", userId)
      .limit(50);

    const alreadySaved = data?.some(
      (item) =>
        item.memory.trim().toLowerCase() === memory.toLowerCase()
    );

    if (alreadySaved) return;

    await supabase.from("user_memories").insert({
      user_id: userId,
      memory,
      category: "personal",
      source: "explicit_user_request",
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Memory saving failed:", error);
  }
      }
