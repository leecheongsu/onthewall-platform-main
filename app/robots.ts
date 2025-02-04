import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: 'Googlebot', // 구글
                allow: ['/'],
                disallow: ['/account/payment', '/manage'],
            },
            {
                userAgent: ['Applebot', 'Bingbot'], // 애플, MS
                allow: ['/'],
                disallow: ['/account/payment', '/manage'],
            },
            {
                userAgent: ['Yeti', 'Daum'], //네이버, 다음
                allow: ['/'],
                disallow: ['/account/payment', '/manage'],
            },
        ],
        sitemap: `${process.env.NEXT_PUBLIC_ONTHEWALL_CLOUD_URL}/sitemap.xml`,
    }
}