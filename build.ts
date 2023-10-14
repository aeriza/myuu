import { parse } from "https://deno.land/std@0.204.0/flags/mod.ts";
import { stringify } from "dotenv";
import { exportVariable } from "npm:@actions/core@1.10.1";

const args = parse(Deno.args);
if (!("check-only" in args)) buildEnv(["$PUBLIC_KEY", "$PROJECT"], true);

export function buildEnv(keys: string[], exportValue?: boolean): Record<string, string> {
  const environment = (Deno.env.get("GH_REF")!.split("/").at(-1) == Deno.env.get("GH_DEFAULT_BRANCH")) ? "PROD" : "PREVIEW";
  const env: { [K: string]: string } = {};
  
  for (const rawKey of keys) {
    const key = rawKey.startsWith("$") ? rawKey.replace("$", `${environment}_`) : rawKey;
    console.log("key", key);
    const cleanedKey = rawKey.replace("$", "");
    console.log("cleanedKey", cleanedKey);
    
    if (Deno.env.has(key)) {
      const value = Deno.env.get(key) as string;
      console.log("value", value);
      env[cleanedKey] = value;
      if (exportValue) exportVariable(cleanedKey, value);
    } else {
      console.warn(`Tidak ada env dengan key "${key}"`)
    }
  }

  return env;
};
