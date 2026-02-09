
const variant1 = '20" x 16" (Horizontal) semi-glossy';
const variant2 = '20″ x 16″ (Horizontal) semi-glossy'; // Special char

const oldRegex = /(\d+)\s*["']?\s*x\s*(\d+)/i;
const newRegex = /(\d+)\D+x\D+(\d+)/i;

console.log('Testing Old Regex:');
console.log(`'${variant1}':`, variant1.match(oldRegex));
console.log(`'${variant2}':`, variant2.match(oldRegex));

console.log('\nTesting New Regex:');
console.log(`'${variant1}':`, variant1.match(newRegex));
console.log(`'${variant2}':`, variant2.match(newRegex));
