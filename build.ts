import { parse } from "https://deno.land/std@0.204.0/flags/mod.ts";
import { stringify } from "https://deno.land/std/@0.204.0/dotenv/mod.ts";

const args = parse(Deno.args);
if (!("check-only" in args)) buildEnv(["PROD_PUBLIC_KEY", "PROJECT"], true);

/** Key yang diawali dengan `$` akan diganti dengan tipe environment*/
export function buildEnv(keys: string[], exportValue?: boolean): Record<string, string> {
  const environment = (Deno.env.get("GH_REF") as string == Deno.env.get("GH_DEFAULT_BRANCH")) ? "PROD" : "PREVIEW";
  const env = {};
  
  for (const rawKey of keys) {
    const key = rawKey.startsWith("$") ? rawKey.replace("$", `${environment}_`) : rawKey;
    const cleanedKey = rawKey.replace("$", "");
    
    if (Deno.env.has(key)) {
      const value = Deno.env.get(key) as string;
      env[cleanedKey] = value
      if (exportValue) exportVariable(cleanedKey, value);
    } else {
      console.warn(`Tidak ada env dengan key "${key}"`)
    }
  }

  return env;
};
