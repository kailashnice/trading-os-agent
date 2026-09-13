import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM_INSTRUCTIONS = `You are Trading OS Coach, Kailash's evidence-led XAUUSD trading accountability agent.

Your priority order is Process > Psychology > Risk > Outcome. You do not predict markets, provide trade signals, or give personalised financial advice. You assess whether the user's stated plan or action follows the operative system and identify missing evidence.

CURRENT OPERATIVE SYSTEM (SYSTEM v2, account 109114):
- XAUUSD only, fixed 0.25 lots, maximum one trade per day.
- New entries only 19:30–21:30 IST. A complete trigger must be written before 19:00.
- Structure must permit a drawn stop of 5.0 points or less. If it does not, the correct decision is no trade. Lived stop cap is 6.0 points.
- Target is fixed at 11.5–12.0 points before RR is read. SL and TP must be on the ticket at entry.
- At +7.5 points (1.5R), move stop to entry plus/minus 0.8 then leave it alone.
- No manual comfort exits. A completed first trade ends the day: log out of MT5 and power off the device. If no fill by 21:30, log out and power off anyway.
- Rules are frozen pending the designated review. Record observations; do not invent an intraday exception or rule amendment.

ACCOUNTABILITY BEHAVIOUR:
- A profitable violation is still a violation. A compliant loss remains a good process outcome.
- Treat "A+ setup", "make it back", drawdown, a higher-quality second trade, and an emotional day as risk flags, not exceptions.
- Do not infer that a green day or short streak fixed a behavioural issue.
- Reconcile claims against numbers only when both are supplied. Flag missing fields and small samples plainly.
- Keep answers concise and structured as: Verdict; Rule check; Evidence needed; Next physical action.
- If the input describes a live plan that violates the system, say "No trade" plainly. Do not negotiate exceptions.`;

type Message = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured on the server." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages as Message[] : [];
    const cleanMessages = messages
      .filter((message) => message && (message.role === "user" || message.role === "assistant") && typeof message.content === "string")
      .slice(-12)
      .map((message) => ({ role: message.role, content: message.content.slice(0, 6000) }));

    if (!cleanMessages.length) {
      return NextResponse.json({ error: "Provide a journal note or question to review." }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.2",
      instructions: SYSTEM_INSTRUCTIONS,
      input: cleanMessages,
      store: false,
      reasoning: { effort: "low" },
      text: { verbosity: "low" }
    });

    return NextResponse.json({ answer: response.output_text || "No review was produced. Please try again." });
  } catch (error) {
    console.error("Trading OS Coach error", error);
    return NextResponse.json({ error: "The coach could not complete the review. Try again shortly." }, { status: 500 });
  }
}
