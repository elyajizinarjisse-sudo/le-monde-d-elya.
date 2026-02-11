import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product';
    contentId?: string;
    schemaData?: any;
}

export function SEO({
    title,
    description,
    image,
    url,
    type = 'website',
    schemaData
}: SEOProps) {
    const siteName = "Le Monde d'Elya";
    const defaultDescription = "Boutique magique pour enfants. Livres jeunesse, jouets éducatifs et décoration enchantée au Québec.";
    const defaultImage = "https://le-monde-d-elya.netlify.app/og-image.jpg"; // Replace with real OG image if available
    const baseUrl = "https://le-monde-d-elya.netlify.app";

    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const fullDescription = description || defaultDescription;
    const fullImage = image || defaultImage;
    const fullUrl = url ? `${baseUrl}${url}` : baseUrl;

    return (
        <Helmet>
            {/* Standard HTML Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={fullDescription} />
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={fullDescription} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={fullDescription} />
            <meta name="twitter:image" content={fullImage} />

            {/* Structured Data (JSON-LD) */}
            {schemaData && (
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            )}
        </Helmet>
    );
}
