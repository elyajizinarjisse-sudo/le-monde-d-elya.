export interface TaxRate {
    gst: number; // Goods and Services Tax (TPS)
    pst: number; // Provincial Sales Tax (TVQ, PST, RST)
    hst: number; // Harmonized Sales Tax (TVH)
    name: string;
}

// Tax rates as of 2024 (simplified)
const CANADA_TAX_RATES: Record<string, TaxRate> = {
    'QC': { gst: 0.05, pst: 0.09975, hst: 0, name: 'TPS + TVQ' },
    'ON': { gst: 0, pst: 0, hst: 0.13, name: 'TVH' },
    'BC': { gst: 0.05, pst: 0.07, hst: 0, name: 'TPS + TVP' },
    'AB': { gst: 0.05, pst: 0, hst: 0, name: 'TPS' },
    'NS': { gst: 0, pst: 0, hst: 0.15, name: 'TVH' },
    'NB': { gst: 0, pst: 0, hst: 0.15, name: 'TVH' },
    'MB': { gst: 0.05, pst: 0.07, hst: 0, name: 'TPS + TVP' }, // MB has complex rules but this is approx
    'PE': { gst: 0, pst: 0, hst: 0.15, name: 'TVH' },
    'SK': { gst: 0.05, pst: 0.06, hst: 0, name: 'TPS + TVP' },
    'NL': { gst: 0, pst: 0, hst: 0.15, name: 'TVH' },
    'default': { gst: 0.05, pst: 0, hst: 0, name: 'TPS' } // Federal floor
};

/**
 * Calculates tax for a given price and region.
 * @param price The subtotal price.
 * @param countryCode 'CA' for Canada, etc.
 * @param regionCode Province code (e.g., 'QC', 'ON').
 */
export const calculateTax = (price: number, countryCode: string = 'CA', regionCode?: string) => {
    if (countryCode !== 'CA') {
        // Placeholder for international: 0 tax or custom rules
        return {
            totalTax: 0,
            details: { name: 'Exempt / TBD', amount: 0 }
        };
    }

    const rates = (regionCode && CANADA_TAX_RATES[regionCode])
        ? CANADA_TAX_RATES[regionCode]
        : CANADA_TAX_RATES['default'];

    const gstAmount = price * rates.gst;
    const pstAmount = price * rates.pst;
    const hstAmount = price * rates.hst;

    const totalTax = gstAmount + pstAmount + hstAmount;

    return {
        totalTax,
        details: {
            name: rates.name,
            gst: gstAmount,
            pst: pstAmount,
            hst: hstAmount
        }
    };
};
