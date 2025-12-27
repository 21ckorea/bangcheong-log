
import axios from 'axios';
import * as cheerio from 'cheerio';
import { normalizeDate } from './utils';

export interface CrawledProgramData {
    title: string;
    broadcaster: string;
    date: string;
    normalizedDate: Date | null;
    link: string;
    isApplying: boolean;
    applyEnd?: Date | null;
    guideLink?: string;
}

const JTBC_URL = 'https://tv.jtbc.co.kr/event/pr10011781/pm10071222';

export const crawlJTBC = async (): Promise<CrawledProgramData[]> => {
    console.log('Starting JTBC Crawler...');
    try {
        const { data } = await axios.get(JTBC_URL, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        const results: CrawledProgramData[] = [];

        // Title Extraction
        let title = $('meta[property="og:title"]').attr('content') || '싱어게인4 파이널 관객 모집';
        title = title.replace(' | JTBC', '').trim();

        // Date Extraction
        // Looking for "녹화일" or "일시" in the content
        let dateStr = '일정 확인 필요';
        let applyEnd: Date | null = null;
        let isApplying = true;

        const contentText = $('div.cont_area').text() || $('div.event_view').text() || $('body').text();

        // Simple regex to find dates
        // 녹화 : 202X년 X월 X일
        const recordDateMatch = contentText.match(/녹화\s*:?\s*(\d{4}년\s*\d{1,2}월\s*\d{1,2}일)/);
        if (recordDateMatch) {
            dateStr = recordDateMatch[1];
        }

        // Apply End Date
        // 신청 기간 : ~ X월 X일
        const applyPeriodMatch = contentText.match(/신청\s*기간\s*:?.*~\s*(\d{4}년)?\s*(\d{1,2}월\s*\d{1,2}일)/);
        if (applyPeriodMatch) {
            const year = applyPeriodMatch[1] || '2026년'; // Assumption if year missing, but usually present
            const datePart = applyPeriodMatch[2];
            applyEnd = normalizeDate(`${year} ${datePart}`);
        }

        // Check if closed
        if (applyEnd && new Date() > applyEnd) {
            isApplying = false;
        }

        results.push({
            title: title,
            broadcaster: 'JTBC',
            date: dateStr,
            normalizedDate: normalizeDate(dateStr),
            link: JTBC_URL,
            isApplying: isApplying,
            applyEnd: applyEnd
        });

        return results;

    } catch (e) {
        console.error('JTBC Crawl Failed:', e);
        return [];
    }
};
