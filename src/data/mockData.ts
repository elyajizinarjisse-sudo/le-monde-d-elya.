import type { Product } from '../components/home/ProductCard';

export const BOOKS: Product[] = [
    { id: 101, title: "Le Grand Voyage de Léo", author: "Marie Dupont", price: 18.00, image: "https://images.unsplash.com/photo-1629272365922-302a66e51cc1?w=400&h=600&fit=crop", rating: 4.8, reviews: 120, isNew: true, category: "Livres", subcategory: "Albums illustrés" },
    { id: 102, title: "L'Arbre Magique", author: "Sylvie Pierre", price: 22.50, image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop", rating: 4.9, reviews: 85, isNew: true, category: "Livres", subcategory: "Contes" },
    { id: 103, title: "Contes de la Lune", author: "Jean Renard", price: 15.99, image: "https://images.unsplash.com/photo-1621425178657-3f81e330bc02?w=400&h=600&fit=crop", rating: 4.7, reviews: 210, category: "Livres", subcategory: "Histoires du soir" },
    { id: 104, title: "Le Petit Ours Curieux", author: "Emily Rose", price: 19.95, image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=600&fit=crop", rating: 4.6, reviews: 32, category: "Livres", subcategory: "Éveil" },
    { id: 105, title: "Aventures en Forêt", author: "Alain Vert", price: 21.00, image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop", rating: 4.4, reviews: 15, category: "Livres", subcategory: "Nature" },
    { id: 106, title: "L'Ombre du Vent", author: "Carlos Ruiz Zafón", price: 29.95, image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop", rating: 4.9, reviews: 340, category: "Livres", subcategory: "Romans" },
];

export const DIGITAL_PRODUCTS: Product[] = [
    { id: 801, title: "Planning Semanier à Imprimer", author: "Elya Design", price: 5.00, image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&h=600&fit=crop", rating: 5.0, reviews: 42, isNew: true, category: "Impressions", subcategory: "Organisation" },
    { id: 802, title: "Affiches Éducatives Animaux", author: "Elya Design", price: 8.50, image: "https://images.unsplash.com/photo-1577083639236-0f52ba0b0962?w=400&h=600&fit=crop", rating: 4.9, reviews: 12, category: "Impressions", subcategory: "Déco Chambre" },
    { id: 803, title: "Invitations Anniversaire Licorne", author: "Fête Magique", price: 6.00, image: "https://images.unsplash.com/photo-1530103862676-de3c9a59af38?w=400&h=600&fit=crop", rating: 4.8, reviews: 25, category: "Impressions", subcategory: "Fête" },
];

import type { BlogPost } from '../components/home/BlogSection';

export const BLOG_POSTS: BlogPost[] = [
    {
        id: 1,
        title: "5 Activités Montessori à la maison",
        excerpt: "Découvrez comment encourager l'autonomie de votre enfant avec des objets du quotidien, simplement et en douceur.",
        image: "https://images.unsplash.com/photo-1588053676159-45d625d90956?w=600&h=400&fit=crop",
        date: "12 Déc 2024",
        readTime: "5 min"
    },
    {
        id: 2,
        title: "Les bienfaits de la lecture du soir",
        excerpt: "Instaurer un rituel de lecture avant le coucher favorise l'imagination et renforce le lien parent-enfant. Nos conseils.",
        image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=400&fit=crop",
        date: "08 Déc 2024",
        readTime: "3 min"
    },
    {
        id: 3,
        title: "Idées déco pour une chambre féerique",
        excerpt: "Transformez la chambre de bébé en un cocon de douceur avec nos inspirations couleurs et accessoires.",
        image: "https://images.unsplash.com/photo-1522771753035-1a5b6518f86f?w=600&h=400&fit=crop",
        date: "01 Déc 2024",
        readTime: "4 min"
    }
];

export const TOYS: Product[] = [
    { id: 301, title: "Doudou Lapin", author: "Câlins", price: 19.00, image: "https://images.unsplash.com/photo-1559563458-52c69f8393ce?w=400&h=600&fit=crop", rating: 5.0, reviews: 500, isNew: true, category: "Jouets", subcategory: "Peluches" },
    { id: 302, title: "Hochet en Bois", author: "Nature Bébé", price: 14.50, image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=600&fit=crop", rating: 4.6, reviews: 120, category: "Jouets", subcategory: "Éveil" },
    { id: 303, title: "Poupée de Chiffon", author: "Tradition", price: 24.00, image: "https://images.unsplash.com/photo-1574279606130-09958dc75643?w=400&h=600&fit=crop", rating: 4.7, reviews: 200, category: "Jouets", subcategory: "Poupées" },
    { id: 304, title: "Train en Bois", author: "Loco", price: 35.00, image: "https://plus.unsplash.com/premium_photo-1684344933904-7476579f168d?w=400&h=600&fit=crop", rating: 4.9, reviews: 110, isSale: true, originalPrice: 45.00, category: "Jouets", subcategory: "Véhicules" },
    { id: 305, title: "Puzzle Animaux", author: "Éveil", price: 16.00, image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=400&h=600&fit=crop", rating: 4.5, reviews: 85, category: "Jouets", subcategory: "Puzzles" },
];

export const ORGANIZERS: Product[] = [
    { id: 501, title: "Agenda Familial 2025", author: "Maman Organisée", price: 24.99, image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&h=600&fit=crop", rating: 4.9, reviews: 300, isNew: true, category: "Organisateurs", subcategory: "Papeterie" },
    { id: 502, title: "Set de 3 Boîtes", author: "Rangement Pro", price: 35.00, image: "https://images.unsplash.com/photo-1591123720664-d53afbbc18c5?w=400&h=600&fit=crop", rating: 4.6, reviews: 120, category: "Organisateurs", subcategory: "Rangement" },
    { id: 503, title: "Calendrier Mural", author: "Jours Heureux", price: 19.50, image: "https://images.unsplash.com/photo-1506784926709-b2f970510629?w=400&h=600&fit=crop", rating: 4.8, reviews: 95, category: "Organisateurs", subcategory: "Mural" },
    { id: 504, title: "Trousse à Crayons", author: "École & Co", price: 12.00, image: "https://images.unsplash.com/photo-1554188248-986c2837bc99?w=400&h=600&fit=crop", rating: 4.7, reviews: 150, category: "Organisateurs", subcategory: "Scolaire" },
    { id: 505, title: "Panier de Rangement Tissé", author: "Maison Zen", price: 34.50, image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=600&fit=crop", rating: 4.8, reviews: 65, category: "Organisateurs", subcategory: "Paniers" },
];

export const DECOR: Product[] = [
    { id: 401, title: "Veilleuse Étoile", author: "Nuit Paisible", price: 22.00, image: "https://images.unsplash.com/photo-1517400508447-f8dd518656fd?w=400&h=600&fit=crop", rating: 4.7, reviews: 340, category: "Déco", subcategory: "Luminaires" },
    { id: 402, title: "Coussin Nuage", author: "Douceur", price: 29.00, image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=400&h=600&fit=crop", rating: 4.5, reviews: 80, category: "Déco", subcategory: "Textile" },
    { id: 403, title: "Affiche ABC Animaux", author: "Déco Fun", price: 18.00, image: "https://images.unsplash.com/photo-1577083639236-0f52ba0b0962?w=400&h=600&fit=crop", rating: 4.8, reviews: 150, category: "Déco", subcategory: "Mural" },
    { id: 404, title: "Panier Osier", author: "Nature", price: 32.00, image: "https://images.unsplash.com/photo-1591123720664-d53afbbc18c5?w=400&h=600&fit=crop", rating: 4.6, reviews: 90, category: "Déco", subcategory: "Rangement" },
    { id: 405, title: "Guirlande Lumineuse", author: "Féerie", price: 25.00, image: "https://images.unsplash.com/photo-1542491563-0498305c189d?w=400&h=600&fit=crop", rating: 4.4, reviews: 200, category: "Déco", subcategory: "Luminaires" },
];

export const PARTY: Product[] = [
    { id: 601, title: "Kit Anniversaire Pirate", author: "Fête Géniale", price: 45.00, image: "https://images.unsplash.com/photo-1530103862676-de3c9a59af38?w=400&h=600&fit=crop", rating: 4.8, reviews: 50, category: "Fête", subcategory: "Kits" },
    { id: 602, title: "Ballons Dorés (x10)", author: "Brillance", price: 8.50, image: "https://images.unsplash.com/photo-1530103862676-de3c9a59af38?w=400&h=600&fit=crop", rating: 4.5, reviews: 200, category: "Fête", subcategory: "Décoration" },
    { id: 603, title: "Guirlande Fanions", author: "Happy Day", price: 12.00, image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400&h=600&fit=crop", rating: 4.7, reviews: 80, isSale: true, originalPrice: 15.00, category: "Fête", subcategory: "Décoration" },
];

export const CREATIVE: Product[] = [
    { id: 701, title: "Boîte de Peinture", author: "Artiste en Herbe", price: 18.00, image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=600&fit=crop", rating: 4.8, reviews: 150, category: "Créatif", subcategory: "Peinture" },
    { id: 702, title: "Cahier de Coloriage", author: "Zen", price: 9.99, image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=600&fit=crop", rating: 4.9, reviews: 300, category: "Créatif", subcategory: "Dessin" },
    { id: 703, title: "Kit Perles Bois", author: "Création", price: 22.50, image: "https://images.unsplash.com/photo-1615751965939-c1c633907c74?w=400&h=600&fit=crop", rating: 4.6, reviews: 90, category: "Créatif", subcategory: "Bricolage" },
];
