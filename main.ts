import tweetnacl from "npm:tweetnacl@1.0.3";
import { loadSync } from "dotenv";
import {
  type APIInteraction,
  APIVersion as version,
  InteractionResponseType,
} from "discord_api_types";
import type { Interaction } from "./types.ts";
import { REST } from "@discordjs/rest";

loadSync({ export: true });

const rest = new REST({
  version
}).setToken(Deno.env.get("TOKEN") as string);

async function handler(request: Request): Promise<any> {
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

  const _interaction: APIInteraction = JSON.parse(body);

  switch(_interaction.type) {
    case InteractionType.Ping:
      return new Response(
        JSON.stringify({ type: InteractionResponseType.Pong })
      );
      break;
    default:
      const interaction = interactions.find((i: Interaction) => i.type == _interaction.type);
      if (interaction) return await interaction.execute(interaction, { rest });
      break;
  }
}

Deno.serve(handler);

function hexToUint8Array(hex: string): Uint8Array {
  return new Uint8Array(
    hex.match(/.{1,2}/g)!.map((ctx) => parseInt(ctx, 16))
  );
}
