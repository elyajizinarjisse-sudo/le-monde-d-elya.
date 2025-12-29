
import { Handler } from 'netlify/functions';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { email, order, items, total } = JSON.parse(event.body || '{}');

        if (!email || !order) {
            return { statusCode: 400, body: 'Missing email or order details' };
        }

        const { data, error } = await resend.emails.send({
            from: 'Le Monde d\'Elya <onboarding@resend.dev>', // Default testing domain
            to: [email],
            subject: `Confirmation de commande #${order.id.slice(0, 8)}`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Merci pour votre commande ! 🎉</h1>
          <p>Bonjour,</p>
          <p>Nous avons bien reçu votre commande et nous la préparons avec soin.</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Détails de la commande</h3>
            <p><strong>Réf:</strong> ${order.id}</p>
            <p><strong>Total:</strong> ${total} €</p>
          </div>

          <h3>Articles :</h3>
          <ul>
            ${items.map((item: any) => `
              <li>${item.quantity}x ${item.title}</li>
            `).join('')}
          </ul>

          <p>Nous vous tiendrons informé de l'expédition.</p>
          <p>À bientôt,<br>L'équipe Le Monde d'Elya ✨</p>
        </div>
      `,
        });

        if (error) {
            console.error('Resend Error:', error);
            return { statusCode: 400, body: JSON.stringify({ error }) };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Email sent successfully', id: data?.id }),
        };
    } catch (error) {
        console.error('Function Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to send email' }),
        };
    }
};
