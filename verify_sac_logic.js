function normalize(str) {
    return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '-') : '';
}

const products = [
    { id: 23, title: 'Sac en toile weekender', category: 'Personnalisation', subcategory: 'Sac' },
    { id: 24, title: 'Sac weekender personalisable ', category: 'Personnalisation', subcategory: 'Sac' }
];

const subcategorySlug = 'sac';

const filtered = products.filter(p => p.subcategory && normalize(p.subcategory).includes(subcategorySlug));

console.log('Filtered (slug):', filtered.map(p => p.id));

const resolvedSubcategoryLabel = 'Sac';
const filteredByLabel = products.filter(p => p.subcategory && p.subcategory.toLowerCase().includes(resolvedSubcategoryLabel.toLowerCase()));

console.log('Filtered (label):', filteredByLabel.map(p => p.id));
