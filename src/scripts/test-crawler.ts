
import { crawlKBS } from '../lib/crawler/kbs';

async function main() {
    console.log('Starting crawler test...');
    const kbsResults = await crawlKBS();
    console.log('KBS Results:', JSON.stringify(kbsResults, null, 2));
}

main();
