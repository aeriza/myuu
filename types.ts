import {
  type APIChatInputApplicationCommandInteraction,
  type APIMessageApplicationCommandInteraction,
  type APIUserApplicationCommandInteraction,
  ApplicationCommandType,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  type RESTPostAPIContextMenuApplicationCommandsJSONBody
} from "discord_api_types";
import type { REST } from "@discordjs/rest";

export type Command =
  | { data: RESTPostAPIChatInputApplicationCommandsJSONBody, execute(interaction: APIChatInputApplicationCommandInteraction, options: Partial<RunOptions>): RunResult }
  | { data: Partial<RESTPostAPIContextMenuApplicationCommandsJSONBody> & { type: ApplicationCommandType.Message }, execute(interaction: APIMessageApplicationCommandInteraction, options: Partial<RunOptions>): RunResult }
  | { data: Partial<RESTPostAPIContextMenuApplicationCommandsJSONBody> & { type: ApplicationCommandType.User }, execute(interaction: APIUserApplicationCommandInteraction, options: Partial<RunOptions>): RunResult }

export type RunResult = Promise<Response> | Response;

export interface RunOptions {
  rest: REST;
}
