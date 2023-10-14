import tweetnacl from "npm:tweetnacl@1.0.3";
import { loadSync } from "dotenv";
import { InteractionResponseType } from "discord_api_types";

loadSync({ export: true });

async function handler(request: Request): Promise<Response> {
  const invalidResponse = new Response("Invalid Request", { status: 401 });
  const headers = ["X-Signature-Ed25519", "X-Signature-Timestamp"];
  if (request.method != "POST" && !headers.every((ctx) => request.headers.has(ctx))) return invalidResponse;
    
  const [signature, timestamp] = headers.map((ctx) => request.headers.get(ctx) as string);
  const body = await request.text();
  const valid = tweetnacl.sign.detached.verify(
    new TextEncoder().encode(timestamp + body),
    hexToUint8Array(signature as string),
    hexToUint8Array(Deno.env.get("PUBLIC_KEY") as string)
  );

  if (!valid) return invalidResponse;

  return new Response(
    JSON.stringify({ type: InteractionResponseType.Pong })
  );
}

Deno.serve(handler);

function hexToUint8Array(hex: string): Uint8Array {
  return new Uint8Array(
    hex.match(/.{1,2}/g)!.map((ctx) => parseInt(ctx, 16))
  );
}
