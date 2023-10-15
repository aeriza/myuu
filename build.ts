import { parse } from "https://deno.land/std@0.204.0/flags/mod.ts";
import { stringify } from "dotenv";
import { exportVariable } from "npm:@actions/core@1.10.1";
import type { Interaction } from "./types.ts";

const args = parse(Deno.args);
if (!("check-only" in args)) {
  buildEnv(["$PROJECT"], true);

  const deploymentEnv = buildEnv(["$PUBLIC_KEY", "$TOKEN"]);
  await Deno.writeTextFile(".env", stringify(deploymentEnv));
}

type InteractionData = { path: string, data: Interaction };

const interactions: InteractionData[] = [];
for await (const file of Deno.readDir("./interactions")) {
  const path: string = `./interactions/${file.name}`;
  const data: Interaction = await import(path);
  interactions.push({ path, data });
}

const output = `
${interactions.map((ctx: InteractionData, index: number) => `import * as $${index} from "${ctx.path}";`).join("\n")}

export const interactions = [
  ${interactions.map((ctx: InteractionData, index: number) => `$${index}`).join(", ")}
]
`;

const proc = new Deno.Command(Deno.execPath(), {
  args: [
    "fmt",
    "-"
  ],
  stdin: "piped",
  stdout: "piped",
  stderr: "null"
}).spawn();

const raw = new ReadableStream({
  type: "bytes",
  start(cont: ReadableByteStreamController): void {
    cont.enqueue(new TextEncoder().encode(output));
    cont.close();
  }
});
raw.pipeTo(proc.stdin);

const { stdout } = await proc.output();
const decoded = new TextDecoder().decode(stdout);

console.log(decoded);
await Deno.writeTextFile("manifest.gen.ts", decoded);

export function buildEnv(keys: string[], exportValue?: boolean): Record<string, string> {
  const environment = (Deno.env.get("GH_REF")!.split("/").at(-1) == Deno.env.get("GH_DEFAULT_BRANCH")) ? "PROD" : "PREVIEW";
  const env: { [K: string]: string } = {};
  
  for (const rawKey of keys) {
    const key = rawKey.startsWith("$") ? rawKey.replace("$", `${environment}_`) : rawKey;
    const cleanedKey = rawKey.replace("$", "");
    
    if (Deno.env.has(key)) {
      const value = Deno.env.get(key) as string;
      env[cleanedKey] = value;
      if (exportValue) exportVariable(cleanedKey, value);
    } else {
      console.warn(`Tidak ada env dengan key "${key}"`)
    }
  }

  return env;
};
