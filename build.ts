import { parse } from "https://deno.land/std@0.204.0/flags/mod.ts";

const args = parse(Deno.args);

/** Key yang diawali dengan `$` akan diganti dengan tipe environment*/
export function buildEnv(keys: string[], export?: boolean): Record<string, string> {
  const env = {};
  for (const key of keys) {
    //TODO(k1iin) setup tipe environment
  }
};
