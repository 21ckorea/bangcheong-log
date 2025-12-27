
import { crawlKBS } from '../lib/crawler/kbs';

async function main() {
    console.log('--- Testing KBS Crawler ---');
    const results = await crawlKBS();
    console.log('Results:', JSON.stringify(results, null, 2));
}

main();
