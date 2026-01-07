
-- Update Product 10 (Doudou) to have rich customization options for testing
UPDATE public.products
SET customization_options = '[
    {
        "id": "opt_1",
        "type": "text",
        "label": "Prénom du bébé",
        "required": true,
        "options": []
    },
    {
        "id": "opt_2",
        "type": "select",
        "label": "Couleur de la broderie",
        "required": true,
        "options": ["Or", "Argent", "Rose Pâle", "Bleu Ciel", "Chocolat"]
    },
    {
        "id": "opt_3",
        "type": "text",
        "label": "Message personnel (Carte cadeau)",
        "required": false,
        "options": []
    }
]'::jsonb
WHERE id = 10;
