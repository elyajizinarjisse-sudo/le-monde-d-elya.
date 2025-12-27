/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                pastel: {
                    pink: '#F9E4D4', // Warm Sand/Peach (replaces pink)
                    yellow: '#FAEDCD', // Papyrus/Cream
                    blue: '#E0E7FF',  // Soft Indigo
                },
                primary: '#C06C54', // Terracotta / Rust (replaces dark pink)
                secondary: '#D4A373', // Warm Beige/Camel
            },
            fontFamily: {
                sans: ['Quicksand', 'Inter', 'sans-serif'], // Cuter font if possible, falling back to Inter
                cursive: ['Pacifico', 'cursive'],
            }
        },
    },
    plugins: [],
}
