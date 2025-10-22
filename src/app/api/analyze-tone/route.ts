import { getSupabaseServerClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";

export async function POST() {
  const supabase = await getSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return new Response("Unauthorized", { status: 401 });

  const { data: emails } = await supabase
    .from("reference_emails")
    .select("body")
    .eq("user_id", auth.user.id)
    .limit(10);

  if (!emails || emails.length === 0) {
    return Response.json({ 
      error: "Upload eerst minimaal 1 referentie email" 
    }, { status: 400 });
  }

  const emailBodies = emails.map(e => e.body).join("\n\n---\n\n");

  const prompt = `Analyseer de volgende e-mails en beschrijf de tone of voice in maximaal 50 woorden. Focus op: formaliteit, woordkeuze, zinsbouw, vriendelijkheid, directheid.

E-mails:
${emailBodies}

Geef alleen de tone of voice beschrijving, geen uitleg:`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { 
        role: "system", 
        content: "Je bent een expert in communicatiestijl analyse. Geef een korte, concrete beschrijving." 
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 100,
  });

  const toneAnalysis = completion.choices[0]?.message?.content?.trim() || "";

  await supabase
    .from("profiles")
    .update({ tone_of_voice: toneAnalysis })
    .eq("id", auth.user.id);

  return Response.json({ tone: toneAnalysis });
}
