import { z } from 'zod';

export const countryOverviewInput = z.object({ countryId: z.number().int().positive() });
