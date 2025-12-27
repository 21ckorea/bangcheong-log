
import axios from 'axios';
import * as cheerio from 'cheerio';
import { normalizeDate } from './utils';
import { CrawledProgramData } from './jtbc'; // Reuse interface or move to shared

const TVCHOSUN_URL = 'https://broadcast.tvchosun.com/broadcast/program/2/C202500100/bbs/11600/C202500100_7/705835.cstv';

export const crawlTVChosun = async (): Promise<CrawledProgramData[]> => {
    console.log('Starting TV Chosun Crawler...');
    try {
        const { data } = await axios.get(TVCHOSUN_URL, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        const results: CrawledProgramData[] = [];

        // Title Assumption
        const title = '미스터트롯4 본선 3차 방청';

        // Image Extraction
        let image = $('meta[property="og:image"]').attr('content');
        if (image && image.startsWith('//')) {
            image = `https:${image}`;
        }

        // Content Extraction
        const contentBox = $('.cont-box');
        let dateStr = '일정 확인 필요';
        let applyEnd: Date | null = null;
        let isApplying = true;
        let link = TVCHOSUN_URL;

        contentBox.find('div, p, span').each((_, el) => {
            const text = $(el).text().trim();

            // 녹화 일시
            if (text.includes('녹화 일시') || text.includes('녹화일')) {
                const match = text.match(/(\d{4}년\s*\d{1,2}월\s*\d{1,2}일)/);
                if (match) dateStr = match[1];
            }

            // 신청 기간 (End Date)
            if (text.includes('신청 기간')) {
                // ... ~ 2026년 1월 6일
                const match = text.match(/~\s*(\d{4}년\s*\d{1,2}월\s*\d{1,2}일)/);
                if (match) {
                    applyEnd = normalizeDate(match[1]);
                }
            }

            // External Link (Naver Form)
            if (text.includes('naver.me')) {
                const href = $(el).find('a').attr('href');
                if (href) link = href;
            }
        });

        results.push({
            title: title,
            broadcaster: 'TV CHOSUN',
            date: dateStr,
            normalizedDate: normalizeDate(dateStr),
            link: link,
            isApplying: isApplying,
            applyEnd: applyEnd,
            image: image
        });

        return results;

    } catch (e) {
        console.error('TV Chosun Crawl Failed:', e);
        return [];
    }
};
