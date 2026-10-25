import { z } from 'zod';

export const countryOverviewInput = z.object({ countryId: z.number().int().positive() });

/** A pay group: one country and one role. */
export const roleDetailInput = countryOverviewInput.extend({ roleId: z.number().int().positive() });
