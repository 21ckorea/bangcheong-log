import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: '방청로그 - 방송 방청 신청 통합 플랫폼',
        short_name: '방청로그',
        description: '모든 방송사 방청 정보가 한곳에! 흩어진 방청 신청, 알림 받고 한 번에 성공해봐!',
        start_url: '/',
        display: 'standalone',
        background_color: '#09090b',
        theme_color: '#09090b',
        icons: [
            {
                src: '/icon.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    };
}
