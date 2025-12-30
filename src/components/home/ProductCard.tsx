import { Star, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../lib/currency';

export interface Product {
    id: number;
    title: string;
    author?: string; // or brand
    price: number;
    originalPrice?: number;
    image: string;
    rating: number;
    reviews: number;
    isNew?: boolean;
    isSale?: boolean;
    category?: string;
    subcategory?: string;
    aspect_ratio?: 'portrait' | 'square' | 'landscape';
    weight?: number;
}

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const aspectRatioClass = product.aspect_ratio === 'square' ? 'aspect-square' :
        product.aspect_ratio === 'landscape' ? 'aspect-[4/3]' :
            'aspect-[2/3]'; // Default portrait

    return (
        <Link to={`/product/${product.id}`} className="group flex flex-col items-start w-[180px] md:w-[220px] flex-shrink-0 cursor-pointer">
            {/* Image Container */}
            <div className={`relative w-full ${aspectRatioClass} bg-gray-100 mb-4 overflow-hidden border border-gray-100`}>
                <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                />
                {/* Badges */}
                {(product.isNew || product.isSale) && (
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.isNew && <span className="bg-white text-indigo-900 text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-sm">Nouveau</span>}
                        {product.isSale && <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-sm">Solde</span>}
                    </div>
                )}
                {/* Wishlist Button */}
                <button
                    onClick={(e) => { e.preventDefault(); /* Add Wishlist Logic */ }}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                >
                    <Heart size={16} className="text-gray-900" />
                </button>
            </div>

            {/* Details */}
            <div className="w-full flex-1 flex flex-col gap-1">
                {/* Rating */}
                <div className="flex items-center gap-1">
                    <div className="flex text-secondary">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={12}
                                fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                                className={i < Math.floor(product.rating) ? "text-secondary" : "text-gray-300"}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] text-gray-500">({product.reviews})</span>
                </div>

                {/* Subcategory */}
                {product.subcategory && (
                    <span className="text-[10px] font-bold text-pastel-pink uppercase tracking-wide mb-1 block">
                        {product.subcategory}
                    </span>
                )}

                {/* Title & Author */}
                <h3 className="font-bold text-sm leading-tight text-gray-800 group-hover:text-primary transition-colors">
                    {product.title}
                </h3>
                {product.author && (
                    <p className="text-xs text-gray-500 truncate w-full">{product.author}</p>
                )}

                {/* Price */}
                <div className="mt-2 text-sm font-bold text-primary">
                    {product.isSale && product.originalPrice ? (
                        <div className="flex items-center gap-2">
                            <span className="text-primary">{formatPrice(product.price)}</span>
                            <span className="text-gray-400 line-through text-xs font-normal">{formatPrice(product.originalPrice)}</span>
                        </div>
                    ) : (
                        <span>{formatPrice(product.price)}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}
