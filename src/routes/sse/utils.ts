import { createHash } from "crypto";

let nextSession = 0;

function getNextSession(): number {
  return nextSession++;
}

export function generateSession(): string {
  const time = new Date().valueOf();
  const rand = Math.random();
  const value = `${ getNextSession() }-${ time }-${ rand }`;
  return createHash("md5").update(value).digest("hex");
}
