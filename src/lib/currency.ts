/**
 * Formats a number as a currency string.
 * @param amount The amount to format.
 * @param currency The currency code (default: 'CAD').
 * @param locale The locale to be used for formatting (default: 'fr-CA').
 * @returns The formatted currency string.
 */
export const formatPrice = (amount: number, currency: string = 'CAD', locale: string = 'fr-CA'): string => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
    }).format(amount);
};
