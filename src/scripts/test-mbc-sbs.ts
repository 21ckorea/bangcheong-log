
import { crawlMBC } from '../lib/crawler/mbc';
import { crawlSBS } from '../lib/crawler/sbs';

async function main() {
    console.log('--- Testing MBC Crawler ---');
    const mbc = await crawlMBC();
    console.log('MBC Results:', JSON.stringify(mbc, null, 2));

    console.log('\n--- Testing SBS Crawler ---');
    const sbs = await crawlSBS();
    console.log('SBS Results:', JSON.stringify(sbs, null, 2));
}

main();
