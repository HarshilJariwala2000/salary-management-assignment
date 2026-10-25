import { z } from 'zod';

export const countryOverviewInput = z.object({ countryId: z.number().int().positive() });

/** A pay group: one country and one role. */
export const roleDetailInput = countryOverviewInput.extend({
  roleId: z.number().int().positive(),
  /** Size of the top and bottom earner lists, as a percentage of the pay group (D-006). */
  percent: z.number().int().min(1).max(50).default(10),
});
