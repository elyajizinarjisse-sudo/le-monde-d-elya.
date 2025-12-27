

const LegalLayout = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-gray-50 py-12 -mt-8"> {/* Negative margin to offset PublicLayout's padding if needed, or just standard py-12 */}
        <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-white p-6 md:p-12 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 font-cursive">{title}</h1>
                <div className="prose prose-blue max-w-none text-gray-600">
                    {children}
                </div>
            </div>
        </div>
    </div>
);

// Helper hook for dynamic content
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const useLegalContent = (section: 'privacy' | 'terms' | 'refund' | 'accessibility', defaultContent: string) => {
    const [content, setContent] = useState(defaultContent);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const { data } = await supabase
                    .from('legal_pages')
                    .select('content')
                    .eq('slug', section)
                    .maybeSingle();

                if (data?.content) {
                    setContent(data.content);
                }
            } catch (error) {
                console.error('Error fetching legal content:', error);
            }
        };

        fetchContent();

        const channel = supabase
            .channel(`legal_${section}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'legal_pages', filter: `slug=eq.${section}` },
                (payload) => {
                    if (payload.new) {
                        const newData = payload.new as any;
                        if (newData.content) {
                            setContent(newData.content);
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [section]);

    return content;
};

export function PrivacyPolicy() {
    const defaultContent = `
        <h3>1. Collecte de l'information</h3>
        <p>Nous recueillons des informations lorsque vous vous inscrivez sur notre site, vous connectez à votre compte, faites un achat, participez à un concours, et/ou lorsque vous vous déconnectez. Les informations recueillies incluent votre nom, votre adresse e-mail, numéro de téléphone, et/ou carte de crédit.</p>
        <h3>2. Utilisation des informations</h3>
        <p>Toutes les informations que nous recueillons auprès de vous peuvent être utilisées pour :</p>
        <ul>
            <li>Personnaliser votre expérience et répondre à vos besoins individuels</li>
            <li>Fournir un contenu publicitaire personnalisé</li>
            <li>Améliorer notre site Web</li>
            <li>Améliorer le service client et vos besoins de prise en charge</li>
            <li>Vous contacter par e-mail</li>
            <li>Administrer un concours, une promotion, ou une enquête</li>
        </ul>
        <h3>3. Confidentialité du commerce en ligne</h3>
        <p>Nous sommes les seuls propriétaires des informations recueillies sur ce site. Vos informations personnelles ne seront pas vendues, échangées, transférées, ou données à une autre société pour n'importe quelle raison, sans votre consentement, en dehors de ce qui est nécessaire pour répondre à une demande et / ou une transaction, comme par exemple pour expédier une commande.</p>
        <h3>4. Divulgation à des tiers</h3>
        <p>Nous ne vendons, n'échangeons et ne transférons pas vos informations personnelles identifiables à des tiers. Cela ne comprend pas les tierce parties de confiance qui nous aident à exploiter notre site Web ou à mener nos affaires, tant que ces parties conviennent de garder ces informations confidentielles.</p>
        <h3>5. Protection des informations</h3>
        <p>Nous mettons en œuvre une variété de mesures de sécurité pour préserver la sécurité de vos informations personnelles. Nous utilisons un cryptage à la pointe de la technologie pour protéger les informations sensibles transmises en ligne.</p>
        <h3>6. Consentement</h3>
        <p>En utilisant notre site, vous consentez à notre politique de confidentialité.</p>
    `;

    const content = useLegalContent('privacy', defaultContent);

    return (
        <LegalLayout title="Politique de Confidentialité">
            <div dangerouslySetInnerHTML={{ __html: content }} />
        </LegalLayout>
    );
}

export function RefundPolicy() {
    const defaultContent = `
        <h3>Retours</h3>
        <p>Notre politique dure 30 jours. Si 30 jours se sont écoulés depuis votre achat, nous ne pouvons malheureusement pas vous offrir un remboursement ou un échange.</p>
        <p>Pour pouvoir bénéficier d’un retour, votre article doit être inutilisé et dans le même état où vous l’avez reçu. Il doit être également dans l’emballage d’origine.</p>
        <h3>Remboursements (le cas échéant)</h3>
        <p>Une fois votre retour reçu et inspecté, nous vous adresserons un e-mail pour vous indiquer que nous avons reçu l'article retourné. Nous vous préciserons également si votre remboursement est approuvé ou refusé.</p>
        <p>S'il est approuvé, alors votre remboursement sera traité, et un crédit sera automatiquement appliqué à votre carte de crédit ou à votre méthode originale de paiement, dans un délai d'un certain nombre de jours.</p>
        <h3>Articles soldés (le cas échéant)</h3>
        <p>Seuls les articles à prix courant peuvent être remboursés. Malheureusement, les articles soldés ne sont pas remboursables.</p>
        <h3>Échanges (le cas échéant)</h3>
        <p>Nous remplaçons un article seulement s'il est défectueux ou endommagé. Si dans ce cas vous souhaitez l'échanger contre le même article, envoyez-nous un e-mail à support@lemondedelya.com.</p>
        <h3>Expédition</h3>
        <p>Pour retourner un produit, vous devez nous contacter par mail pour obtenir l'adresse de retour.</p>
        <p>Il vous incombera de payer vos propres frais d'expédition pour retourner votre article. Les coûts d'expédition ne sont pas remboursables.</p>
    `;

    const content = useLegalContent('refund', defaultContent);

    return (
        <LegalLayout title="Politique de Remboursement">
            <div dangerouslySetInnerHTML={{ __html: content }} />
        </LegalLayout>
    );
}

export function TermsAndConditions() {
    const defaultContent = `
        <h3>1. Conditions</h3>
        <p>En accédant à ce site web, vous acceptez d'être lié par ces conditions d'utilisation, toutes les lois et règlements applicables, et vous acceptez que vous êtes responsable du respect des lois locales applicables.</p>
        <h3>2. Licence d'utilisation</h3>
        <p>Il est permis de télécharger temporairement une copie du matériel (information ou logiciel) sur le site web de Le Monde d'Elya pour une visualisation transitoire personnelle et non commerciale uniquement.</p>
        <h3>3. Limitation de responsabilité</h3>
        <p>En aucun cas Le Monde d'Elya ou ses fournisseurs ne seront responsables de tout dommage (y compris, sans limitation, les dommages pour perte de données ou de profit, ou en raison d'une interruption d'activité) découlant de l'utilisation ou de l'incapacité d'utiliser le matériel sur le site Internet de Le Monde d'Elya.</p>
        <h3>4. Révisions et errata</h3>
        <p>Le matériel apparaissant sur le site web de Le Monde d'Elya pourrait inclure des erreurs techniques, typographiques ou photographiques. Le Monde d'Elya ne garantit pas que l'un des matériaux sur son site web est exact, complet ou à jour.</p>
        <h3>5. Liens</h3>
        <p>Le Monde d'Elya n'a pas examiné tous les sites liés à son site Internet et n'est pas responsable du contenu de ces sites liés.</p>
        <h3>6. Modifications des conditions d'utilisation du site</h3>
        <p>Le Monde d'Elya peut réviser ces conditions d'utilisation pour son site web à tout moment sans préavis.</p>
        <h3>7. Loi applicable</h3>
        <p>Toute réclamation relative au site web de Le Monde d'Elya est régie par les lois de la province de Québec sans égard à ses dispositions en matière de conflit de lois.</p>
    `;

    const content = useLegalContent('terms', defaultContent);

    return (
        <LegalLayout title="Conditions Générales de Vente">
            <div dangerouslySetInnerHTML={{ __html: content }} />
        </LegalLayout>
    );
}

export function AccessibilityStatement() {
    const defaultContent = `
        <p>Le Monde d'Elya s'engage à rendre son site internet accessible à tous, y compris aux personnes en situation de handicap.</p>
        <h3>État de conformité</h3>
        <p>Nous nous efforçons de respecter les Règles pour l'accessibilité des contenus Web (WCAG) 2.1 niveau AA.</p>
        <h3>Mesures prises</h3>
        <p>Nous prenons les mesures suivantes pour assurer l'accessibilité de notre site :</p>
        <ul>
            <li>Inclusion de l'accessibilité dans nos politiques internes.</li>
            <li>Formation continue de notre personnel.</li>
            <li>Tests réguliers de contraste des couleurs et de navigation au clavier.</li>
        </ul>
        <h3>Retour d'information</h3>
        <p>Nous accueillons vos retours sur l'accessibilité de notre site. Veuillez nous informer si vous rencontrez des barrières à l'accessibilité sur Le Monde d'Elya :</p>
        <ul>
            <li>E-mail : accessibilite@lemondedelya.com</li>
        </ul>
    `;

    const content = useLegalContent('accessibility', defaultContent);

    return (
        <LegalLayout title="Déclaration d'Accessibilité">
            <div dangerouslySetInnerHTML={{ __html: content }} />
        </LegalLayout>
    );
}
