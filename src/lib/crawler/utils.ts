
import axios from 'axios';
import * as cheerio from 'cheerio';

interface CrawlResult {
    success: boolean;
    data?: any;
    error?: string;
}

export const fetchHtml = async (url: string) => {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });
        return data;
    } catch (error) {
        console.error(`Failed to fetch HTML from ${url}:`, error);
        throw error;
    }
};

export const parseHtml = (html: string) => {
    return cheerio.load(html);
};

export const normalizeDate = (dateStr: string): Date | null => {
    // Common Korean date formats: 
    // "2024.01.05 (금) 19:00", "2024.01.05", "2024-01-05"
    try {
        // 1. Extract Time first (HH:mm)
        let hours = 0;
        let minutes = 0;
        const timeMatch = dateStr.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
            hours = parseInt(timeMatch[1]);
            minutes = parseInt(timeMatch[2]);
        }

        // 2. Remove time, parens, and weekday chars to isolate date
        const dateOnlyStr = dateStr
            .replace(/(\d{1,2}):(\d{2})/, '') // Remove time
            .replace(/[\(\)월화수목금토일]/g, '') // Remove parens/weekdays
            .replace(/[년월일]/g, '.') // Normalize separators
            .trim();

        const parts = dateOnlyStr.split(/[\.\-]/).map(s => s.trim()).filter(s => s);

        if (parts.length >= 3) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1;
            const day = parseInt(parts[2]);
            return new Date(year, month, day, hours, minutes);
        }
        return null;
    } catch (e) {
        return null;
    }
};
