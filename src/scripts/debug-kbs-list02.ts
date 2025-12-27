
import axios from 'axios';

async function main() {
    console.log('Fetching KBS Event Page (list02.html)...');
    try {
        const { data } = await axios.get('https://event.kbs.co.kr/list02.html', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        console.log(`Fetched ${data.length} bytes.`);

        const scriptMatch = data.match(/var json = JSON\.parse\('([^']+)'\)/);
        if (scriptMatch) {
            console.log('FOUND JSON in list02.html!');
            const rawString = scriptMatch[1];
            const unescaped = rawString.replace(/\\"/g, '"');
            try {
                const json = JSON.parse(unescaped);
                const jsonStr = JSON.stringify(json);
                if (jsonStr.includes('가요무대')) {
                    console.log('FOUND "가요무대" in JSON!');
                } else {
                    console.log('NOT FOUND "가요무대" in JSON.');
                }
                // Print keys to see structure
                console.log(JSON.stringify(json).substring(0, 500));
            } catch (e) {
                console.log('JSON Parse Failed');
            }
        } else {
            if (data.includes('가요무대')) {
                console.log('FOUND "가요무대" in HTML body!');
            } else {
                console.log('NOT FOUND "가요무대" in HTML body.');
            }
        }

    } catch (e) {
        console.error(e);
    }
}

main();
