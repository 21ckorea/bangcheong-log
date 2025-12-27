
import { crawlKBSDiscovery } from '../lib/crawler/discovery/kbs-discovery';

async function main() {
    console.log('--- Testing KBS Discovery Crawler ---');
    const results = await crawlKBSDiscovery();
    console.log('Discovery Results:', JSON.stringify(results, null, 2));
}

main();
