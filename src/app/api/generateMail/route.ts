import { openai } from "@/lib/openai";

// CORS headers for Chrome extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new Response(null, { 
    status: 204, 
    headers: corsHeaders 
  });
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let context = "";
    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      context = String(body.context || "");
    } else {
      const form = await req.formData();
      context = String(form.get("context") || "");
    }

    let parsedContext: Record<string, unknown> = {};
    try {
      parsedContext = JSON.parse(context);
    } catch {
      parsedContext = { userInput: context };
    }

    const tone = "professioneel, vriendelijk, to-the-point";

    let prompt = '';
    
    if (parsedContext.isReply && parsedContext.userEmail) {
      prompt += `Je schrijft een reply email NAMENS: ${parsedContext.userEmail}\n`;
      prompt += `Deze persoon (${parsedContext.userEmail}) wil reageren op een email.\n\n`;
    } else if (parsedContext.userEmail) {
      prompt += `Je schrijft een email NAMENS: ${parsedContext.userEmail}\n\n`;
    }
    
    prompt += `Schrijf de email in het Nederlands met de volgende tone of voice: ${tone}.\n\n`;
    
    if (parsedContext.subject) {
      prompt += `Onderwerp van de thread: ${parsedContext.subject}\n`;
    }
    
    if (parsedContext.from && parsedContext.isReply) {
      prompt += `Deze email is een REPLY op een bericht VAN: ${parsedContext.from}\n`;
    } else if (parsedContext.recipientEmail) {
      prompt += `Aan: ${parsedContext.recipientEmail}\n`;
    }
    
    if (parsedContext.threadContext) {
      prompt += `\nHet laatste bericht in de thread (ontvangen van ${parsedContext.from || 'afzender'}):\n`;
      prompt += `"${parsedContext.threadContext}"\n\n`;
    }
    
    prompt += `\n=== INSTRUCTIE VAN DE GEBRUIKER (${parsedContext.userEmail || 'afzender'}) ===\n`;
    prompt += `${parsedContext.userInput || context}\n\n`;
    
    prompt += `=== VERWACHTE OUTPUT ===\n`;
    prompt += `Schrijf ALLEEN de email body. Begin direct met de aanhef.\n`;
    prompt += `GEEN "Onderwerp:" regel - Gmail vult dit automatisch in.\n`;
    prompt += `GEEN "Aan:" of "Van:" headers - alleen de email content zelf.\n\n`;
    prompt += `Schrijf de email vanuit het perspectief van ${parsedContext.userEmail || 'de gebruiker'}.\n`;
    prompt += `De gebruiker is degene die de email VERSTUURT, niet degene van wie het laatste bericht kwam.\n`;
    prompt += `Structuur: aanhef, kern, afsluiting, handtekening.\n`;
    prompt += `Korte zinnen, duidelijke call-to-action waar relevant.\n`;
    prompt += `Begin direct met "Goedemorgen/Beste/Hi [naam],"`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "Je bent een professionele email schrijfassistent. Je schrijft ALTIJD namens de gebruiker die jou instructies geeft. Je neemt NOOIT het perspectief van andere mensen in de email thread over. Als de gebruiker reageert op een ontvangen email, schrijf je de reply vanuit HUN perspectief, niet vanuit het perspectief van de afzender van het originele bericht." 
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content || "";
    return new Response(JSON.stringify({ email: text }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      }
    });
  } catch (error) {
    console.error('Error generating email:', error);
    return new Response(JSON.stringify({
      error: 'Failed to generate email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      }
    });
  }
}





