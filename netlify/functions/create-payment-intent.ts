import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    try {
        const { amount, currency = 'cad' } = JSON.parse(event.body || '{}');

        if (!amount) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Amount is required' }),
            };
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert dollars to cents
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                clientSecret: paymentIntent.client_secret,
            }),
        };
    } catch (error) {
        console.error('Error creating payment intent:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to create payment intent' }),
        };
    }
};
