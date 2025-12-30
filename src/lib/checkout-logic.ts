
import { calculateTax } from './taxes';

export const FREE_SHIPPING_THRESHOLD = 35.00;

export interface CheckoutTotals {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    taxDetails?: {
        name: string;
        amount: number;
        gst: number;
        pst: number;
        hst: number;
    };
}

export const calculateShipping = (subtotal: number, totalWeightGrams: number): number => {
    // Rule 1: Free Shipping if subtotal > $35
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
        return 0;
    }

    // Rule 2: Weight-based Rates
    if (totalWeightGrams <= 500) {
        return 5.99;
    } else if (totalWeightGrams <= 1000) {
        return 9.99;
    } else {
        return 14.99;
    }
};

export const calculateCheckoutTotals = (
    subtotal: number,
    province: string,
    totalWeightGrams: number = 0
): CheckoutTotals => {

    // 1. Calculate Shipping
    const shipping = calculateShipping(subtotal, totalWeightGrams);

    // 2. Calculate Taxable Amount (Subtotal + Shipping)
    // In Canada, shipping is taxable.
    const taxableAmount = subtotal + shipping;

    // 3. Calculate Taxes
    const taxResult = calculateTax(taxableAmount, 'CA', province);
    const tax = taxResult.totalTax;

    // 4. Final Total
    const total = taxableAmount + tax;

    return {
        subtotal,
        shipping,
        tax,
        total,
        taxDetails: {
            name: taxResult.details.name,
            amount: tax,
            gst: taxResult.details.gst || 0,
            pst: taxResult.details.pst || 0,
            hst: taxResult.details.hst || 0
        }
    };
};
