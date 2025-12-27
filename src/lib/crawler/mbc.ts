import { CrawledProgramData } from './kbs';

// MBC Show! Music Core Rule:
// Web is CSR and API often returns empty/secure.
// Broadcast: Every Saturday 15:15
// Viewer Committee Application is the main method.

const MBC_URL = 'https://program.imbc.com/Apply/musiccore';

export const crawlMBC = async (): Promise<CrawledProgramData[]> => {
    // User Feedback: Viewer Committee is seasonal and currently closed.
    // Do not generate false "Weekly" schedule.
    // When we find a real Weekly Audience source, we can re-enable this or scrape it.

    console.log(`MBC: Viewer recruitment is closed/seasonal. Returning empty.`);
    return [];

};
