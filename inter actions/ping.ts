import {
  type APIPingInteraction,
  InteractionType
} from "discord_api_types";

export type = InteractionType.Ping;

export function execute(interaction: APIPingInteraction): Response {
  return new Response(
    JSON.stringify({ type: InteractionResponseType.Pong })
  );
}
