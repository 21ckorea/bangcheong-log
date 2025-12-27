
import axios from 'axios';

async function main() {
    console.log('Fetching KBS Event Page...');
    try {
        const { data } = await axios.get('https://event.kbs.co.kr/', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        // Regex used in production
        const scriptMatch = data.match(/var json = JSON\.parse\('([^']+)'\)/);

        if (!scriptMatch) {
            console.log('No JSON match found!');
            return;
        }

        const rawString = scriptMatch[1];
        console.log('--- Raw Captured String (First 100 chars) ---');
        console.log(rawString.substring(0, 100));
        console.log('---------------------------------------------');

        // Test Parsing Strategy 1: Direct Parse
        try {
            JSON.parse(rawString);
            console.log('Strategy 1 (Direct): SUCCESS');
        } catch (e) {
            console.log('Strategy 1 (Direct): FAILED');
        }

        // Test Parsing Strategy 2: Unescape \" to "
        try {
            const unescaped = rawString.replace(/\\"/g, '"');
            JSON.parse(unescaped);
            console.log('Strategy 2 (Replace \\" with "): SUCCESS');
            // Check if it works for the whole string
            const json = JSON.parse(unescaped);
            console.log('Parsed Keys:', Object.keys(json));
        } catch (e) {
            console.log('Strategy 2 (Replace \\" with "): FAILED', e.message);
        }

        // Test Parsing Strategy 3: JSON.parse the string as a string literal? 
        // No, that's what we are doing manually.

        // Test Strategy 4: Full unescape (backslashes)
        try {
            // If the server sends `var json = JSON.parse('{\"a\":1}')`
            // The string literal is `{\"a\":1}`.
            // We need `{"a":1}`.
            // So we strictly need to remove the backslash before the quote.

            let s = rawString.replace(/\\"/g, '"');
            s = s.replace(/\\\\/g, '\\'); // unescape backslashes?
            JSON.parse(s);
            console.log('Strategy 4 (Full Unescape): SUCCESS');
        } catch (e) {
            console.log('Strategy 4: FAILED');
        }

    } catch (e) {
        console.error(e);
    }
}

main();
