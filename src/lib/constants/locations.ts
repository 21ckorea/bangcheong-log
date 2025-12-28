export interface StudioLocation {
    name: string;
    address: string;
    naverMapQuery: string;
    kakaoMapQuery: string;
}

export const BROADCASTER_LOCATIONS: Record<string, StudioLocation> = {
    'KBS': {
        name: 'KBS 신관 공개홀',
        address: '서울 영등포구 여의공원로 13',
        naverMapQuery: 'KBS신관공개홀',
        kakaoMapQuery: 'KBS신관공개홀'
    },
    'MBC': {
        name: 'MBC 상암 신사옥',
        address: '서울 마포구 성암로 267',
        naverMapQuery: 'MBC신사옥',
        kakaoMapQuery: 'MBC신사옥'
    },
    'SBS': {
        name: 'SBS 등촌동 공개홀',
        address: '서울 강서구 양천로 442',
        naverMapQuery: 'SBS등촌동공개홀',
        kakaoMapQuery: 'SBS등촌동공개홀'
    },
    'JTBC': {
        name: 'JTBC 일산 스튜디오',
        address: '경기 고양시 일산동구 한류월드로 270',
        naverMapQuery: 'JTBC일산스튜디오',
        kakaoMapQuery: 'JTBC일산스튜디오'
    },
    'TVChosun': {
        name: 'TV조선 씨스퀘어 빌딩',
        address: '서울 중구 세종대로21길 40',
        naverMapQuery: 'TV조선',
        kakaoMapQuery: 'TV조선'
    }
};

// Helper to get location safely (defaulting if not found)
export function getLocation(broadcaster: string): StudioLocation | null {
    // Normalize string removal of spaces or case
    const normalized = broadcaster.replace(/\s/g, '').toUpperCase();

    // Try exact match
    if (BROADCASTER_LOCATIONS[broadcaster]) return BROADCASTER_LOCATIONS[broadcaster];

    // Try keys
    const foundKey = Object.keys(BROADCASTER_LOCATIONS).find(k =>
        k.toUpperCase() === normalized ||
        normalized.includes(k.toUpperCase())
    );

    return foundKey ? BROADCASTER_LOCATIONS[foundKey] : null;
}
