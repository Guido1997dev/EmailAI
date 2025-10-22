import { openai } from "@/lib/openai";

export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin') || '*';
  const reqMethod = req.headers.get('access-control-request-method') || 'POST';
  const reqHeaders = req.headers.get('access-control-request-headers') || 'content-type';

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': reqMethod,
      'Access-Control-Allow-Headers': reqHeaders,
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers',
    },
  });
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin') || '*';
  const baseHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Content-Type': 'application/json',
    Vary: 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers',
  } as Record<string, string>;

  try {
    const body = await req.json();
    const context = body.context || "";

    let parsedContext: Record<string, unknown> = {};
    try {
      parsedContext = JSON.parse(context);
    } catch {
      parsedContext = { userInput: context };
    }

    const tone = "professioneel, vriendelijk, to-the-point";
    let prompt = '';
    
    if ((parsedContext as any).isReply && (parsedContext as any).userEmail) {
      prompt += `Je schrijft een reply email NAMENS: ${(parsedContext as any).userEmail}\n`;
      prompt += `Deze persoon (${(parsedContext as any).userEmail}) wil reageren op een email.\n\n`;
    } else if ((parsedContext as any).userEmail) {
      prompt += `Je schrijft een email NAMENS: ${(parsedContext as any).userEmail}\n\n`;
    }
    
    if ((parsedContext as any).subject) {
      prompt += `Onderwerp van de thread: ${(parsedContext as any).subject}\n`;
    }
    
    if ((parsedContext as any).from && (parsedContext as any).isReply) {
      prompt += `Deze email is een REPLY op een bericht VAN: ${(parsedContext as any).from}\n`;
    } else if ((parsedContext as any).recipientEmail) {
      prompt += `Aan: ${(parsedContext as any).recipientEmail}\n`;
    }
    
    if ((parsedContext as any).threadContext) {
      prompt += `\nHet laatste bericht in de thread (ontvangen van ${(parsedContext as any).from || 'afzender'}):\n`;
      prompt += `"${(parsedContext as any).threadContext}"\n\n`;
    }

    prompt += `\n=== INSTRUCTIE VAN DE GEBRUIKER (${(parsedContext as any).userEmail || 'afzender'}) ===\n`;
    prompt += `${(parsedContext as any).userInput || context}\n\n`;
    prompt += `Schrijf de email in het Nederlands met de volgende tone of voice: ${tone}.\n`;
    prompt += `Structuur: aanhef, kern, afsluiting, handtekening.\n`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Je bent een professionele email schrijfassistent." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content || "";

    return new Response(JSON.stringify({ email: text }), {
      status: 200,
      headers: baseHeaders,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to generate email',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: baseHeaders,
      }
    );
  }
}

export const dynamic = 'force-dynamic';
