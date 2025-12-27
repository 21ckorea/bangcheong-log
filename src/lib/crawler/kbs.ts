
import axios from 'axios';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';
import { normalizeDate } from './utils';

const KBS_API_URL = 'https://pbbsapi.kbs.co.kr/board/v1/list_board';
const KBS_TICKET_URL = 'https://kbsticket.kbs.co.kr/requestnew/list.do';

const PROGRAMS = [
    {
        code: 'T2000-0027',
        name: '뮤직뱅크',
        broadcaster: 'KBS2',
        type: 'api', // Uses list_board API
        linkPattern: 'https://program.kbs.co.kr/2tv/enter/musicbank/pc/board.html?smenu=3b7ca1&m_seq=',
    },
    {
        code: '8', // m_seq for ticket page
        name: '개그콘서트',
        broadcaster: 'KBS2',
        type: 'ticket', // Uses kbsticket crawling
        linkPattern: 'https://program.kbs.co.kr/2tv/enter/gagcon/pc/board.html?smenu=3b7ca1&m_seq=8',
    },
    {
        code: '7', // m_seq for Gayo Stage
        name: '가요무대',
        broadcaster: 'KBS1',
        type: 'ticket',
        linkPattern: 'https://program.kbs.co.kr/1tv/enter/gayo/pc/board.html?smenu=3b7ca1&m_seq=7',
    },
    {
        code: '139', // m_seq for The Seasons
        name: '더 시즌즈',
        broadcaster: 'KBS2',
        type: 'ticket',
        linkPattern: 'https://program.kbs.co.kr/2tv/enter/theseasons/pc/board.html?smenu=8c80ee&bbs_loc=139,list,none,1,0',
    },
];

export interface CrawledProgramData {
    title: string;
    broadcaster: string;
    date: string;
    normalizedDate: Date | null;
    link: string;
    isApplying: boolean;
    applyEnd?: Date | null; // Add applyEnd field
    guideLink?: string; // Add guideLink field
}


interface KBSApiResponse {
    ret: number;
    msg: string;
    data: any[];
    total: number;
}

export const crawlKBS = async (): Promise<CrawledProgramData[]> => {
    console.log(`Starting KBS Crawler...`);
    let allResults: CrawledProgramData[] = [];

    for (const program of PROGRAMS) {
        console.log(`Crawling ${program.name}...`);
        try {
            if (program.type === 'api') {
                const results = await crawlKBSApi(program);
                allResults = [...allResults, ...results];
            } else if (program.type === 'ticket') {
                const results = await crawlKBSTicket(program);
                allResults = [...allResults, ...results];
            }
        } catch (error) {
            console.error(`Error crawling ${program.name}:`, error);
        }
    }

    return allResults;
};

// Strategy 1: JSON API (Music Bank)
async function crawlKBSApi(program: any): Promise<CrawledProgramData[]> {
    const response = await axios.get<KBSApiResponse>(KBS_API_URL, {
        params: {
            program_code: program.code,
            bbs_db: '01',
            attr: '01,02,10',
            event_state: 'ing',
            page: 1,
            page_size: 10,
        },
        headers: {
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://program.kbs.co.kr/',
        },
    });

    const { data } = response;
    if (data.ret !== 0 || !data.data) return [];

    return data.data.map((item) => ({
        title: item.title,
        broadcaster: program.broadcaster,
        date: item.date_event_start || '',
        normalizedDate: normalizeDate(item.title),
        link: `${program.linkPattern}${item.post_id}`,
        isApplying: true,
    }));
}

// Strategy 2: Ticket Page Scraping (Gag Concert)
async function crawlKBSTicket(program: any): Promise<CrawledProgramData[]> {
    const response = await axios.get(KBS_TICKET_URL, {
        params: { m_seq: program.code },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://program.kbs.co.kr/',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'Connection': 'keep-alive',
            'Sec-Fetch-Dest': 'iframe',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-site',
            'Upgrade-Insecure-Requests': '1',
        },
        responseType: 'arraybuffer', // Required for manual decoding
    });

    // Decode EUC-KR response
    const html = iconv.decode(Buffer.from(response.data), 'EUC-KR');

    // console.log(`[DEBUG] Fetched ${html.length} bytes`);

    const $ = cheerio.load(html);
    const results: CrawledProgramData[] = [];

    $('li.attend-list-box').each((_, el) => {
        const state = $(el).find('.state').text().trim();
        // console.log(`[DEBUG] Item state: '${state}'`);

        // Match '신청가능' (Available)
        if (!state.includes('신청가능')) return;

        const dateStr = $(el).find('.date').text().replace(/\s+/g, ' ').trim();
        const title = $(el).find('.tit').text().trim();

        // Extract "Announcement" date (발표) from definition list
        let applyEnd: Date | null = null;
        $(el).find('dl').each((_, dl) => {
            const dtText = $(dl).find('dt').text().trim();
            if (dtText.includes('발표')) {
                const ddText = $(dl).find('dd').text().trim(); // e.g., "2026.01.08 (목)"
                applyEnd = normalizeDate(ddText);
            }
        });

        const guideLink = 'https://kbsticket.kbs.co.kr/popupnew/guide.do';

        results.push({
            title: title || `${program.name} 방청신청`,
            broadcaster: program.broadcaster,
            date: dateStr,
            normalizedDate: normalizeDate(dateStr),
            link: program.linkPattern,
            isApplying: true,
            applyEnd: applyEnd,
            guideLink: guideLink, // Add guide link
        });
    });

    console.log(`Found ${results.length} tickets for ${program.name}.`);
    return results;
}
