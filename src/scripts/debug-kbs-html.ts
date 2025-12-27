
import axios from 'axios';

async function main() {
    console.log('Fetching https://event.kbs.co.kr/ ...');
    try {
        const { data } = await axios.get('https://event.kbs.co.kr/', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        console.log(`Fetched ${data.length} bytes.`);

        if (data.includes('가요무대')) {
            console.log('FOUND "가요무대" in raw HTML.');
        } else {
            console.log('NOT FOUND "가요무대" in raw HTML.');
        }

        if (data.includes('program.kbs.co.kr')) {
            console.log('FOUND "program.kbs.co.kr" links in raw HTML.');
        } else {
            console.log('NOT FOUND "program.kbs.co.kr" links in raw HTML.');
        }

    } catch (e) {
        console.error(e);
    }
}

main();
