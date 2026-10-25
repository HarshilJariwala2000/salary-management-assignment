/** Seed settings shared by boot seeding and the reset command. */
export const SEED_EMPLOYEES = Number(process.env.SEED_EMPLOYEES ?? 10_000);
export const SEED = 2026;

/** Local calendar date as YYYY-MM-DD ('en-CA' formats dates that way). */
export function localToday(): string {
  return new Date().toLocaleDateString('en-CA');
}
