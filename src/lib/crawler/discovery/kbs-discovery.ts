
import axios from 'axios';
import { CrawledProgramData } from '../kbs'; // Verify this path

// Discovery Crawler for KBS
// Source: https://event.kbs.co.kr/ uses embedded JSON in <script> tag.

export const crawlKBSDiscovery = async (): Promise<CrawledProgramData[]> => {
    console.log(`Starting KBS Discovery detailed crawl...`);
    try {
        const { data } = await axios.get('https://event.kbs.co.kr/', {
            headers: {
                'User-Agent': 'Mozilla/5.0',
            }
        });

        const results: CrawledProgramData[] = [];
        const seenTitles = new Set<string>();

        // KBS Event page uses embedded JSON in <script> tags.
        // Look for: var json = JSON.parse(' ... ');

        const scriptMatch = data.match(/var json = JSON\.parse\('([^']+)'\)/);
        if (!scriptMatch) {
            console.log('KBS Discovery: No embedded JSON found.');
            return []; // Fallback or empty if structure changed
        }

        let jsonData: any;
        try {
            // Fix: The string contains escaped double quotes (\") which need to be unescaped to " 
            // before parsing as a standard JSON string.
            const unescaped = scriptMatch[1].replace(/\\"/g, '"');
            jsonData = JSON.parse(unescaped);
        } catch (e) {
            console.error('KBS Discovery: JSON parse failed with custom unescape', e);
            return [];
        }

        // Traverse the JSON to find items
        // Structure seems: cgroup_data -> section -> data -> item -> target_url / title

        const traverse = (obj: any) => {
            if (!obj) return;
            if (Array.isArray(obj)) {
                obj.forEach(traverse);
            } else if (typeof obj === 'object') {
                if (obj.target_url && obj.title) {
                    const link = obj.target_url;
                    const title = obj.title;

                    // Heuristic: Must include 'program.kbs.co.kr' and not be ignored titles
                    if (link.includes('program.kbs.co.kr') && !seenTitles.has(title)) {
                        // Filter out generic titles if needed
                        if (title.length > 2 && !title.includes('로그인')) {
                            results.push({
                                title: `[New] ${title}`,
                                broadcaster: 'KBS',
                                date: '일정 확인 필요',
                                normalizedDate: new Date(),
                                link: link,
                                isApplying: false,
                                applyEnd: undefined
                            });
                            seenTitles.add(title);
                        }
                    }
                }
                // Recursively check values
                Object.values(obj).forEach(traverse);
            }
        };

        traverse(jsonData);

        console.log(`Discovered ${results.length} potential programs.`);
        return results;

    } catch (e) {
        console.error('Error in KBS Discovery:', e);
        return [];
    }
};
