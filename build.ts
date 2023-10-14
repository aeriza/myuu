import { parse } from "https://deno.land/std@0.204.0/flags/mod.ts";
import { stringify } from "dotenv";
import { exportVariable } from "npm:@actions/core@1.10.1";

const args = parse(Deno.args);
if (!("check-only" in args)) {
  buildEnv(["$PROJECT"], true);

  const deploymentEnv = buildEnv(["$PUBLIC_KEY", "$TOKEN"]);
  await Deno.writeTextFile(".env", stringify(deploymentEnv));
}

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
