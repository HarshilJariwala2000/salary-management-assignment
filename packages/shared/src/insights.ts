import { z } from 'zod';

export const countryOverviewInput = z.object({ countryId: z.number().int().positive() });

export const DEFAULT_TOP_BOTTOM_PERCENT = 10;

const percentMessage = 'Enter a whole number from 1 to 50';

/** Size of the top and bottom earner lists, as a percentage of the pay group (D-006). Shared by the API and the role detail. */
export const topBottomPercent = z.number({ error: percentMessage }).int(percentMessage).min(1, percentMessage).max(50, percentMessage);

/** A pay group: one country and one role. */
export const roleDetailInput = countryOverviewInput.extend({
  roleId: z.number().int().positive(),
  percent: topBottomPercent.default(DEFAULT_TOP_BOTTOM_PERCENT),
});
