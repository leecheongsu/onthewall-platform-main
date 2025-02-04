import axios from "axios";

interface GeoInfo {
    request: string;
    status: number;
    delay: string;
    credit: string;
    city?: string;
    region?: string;
    regionCode?: string;
    regionName?: string;
    areaCode?: string;
    dmaCode?: string;
    countryCode?: string;
    countryName?: string;
    inEU: number;
    euVATrate: boolean;
    continentCode?: string;
    continentName?: string;
    latitude?: string;
    longitude?: string;
    locationAccuracyRadius?: string;
    timezone?: string;
    currencyCode?: string;
    currencySymbol?: string;
    currencySymbol_UTF8: string;
    currencyConverter: number;
}

function isSuccess(geoInfo: GeoInfo): boolean {
    return geoInfo.status === 200;
}

const Config = axios.create({
    baseURL: "http://www.geoplugin.net",
});

export const getIpInfo = async (ip: string): Promise<GeoInfo> => {
    const response = await Config({
        method: 'get',
        url: `/json.gp?ip=${ip}`,
    });
    return response.data;
};

export const getClientIp = async (): Promise<string> => {
    try {
         return await axios.get("https://api.ip.pe.kr/json/");
    } catch (error) {
        console.error("Failed to get client IP address:", error);
        throw error;
    }
};

export const getClientIpInfo = async (): Promise<GeoInfo | {}> => {
    try {
        const ip = await getClientIp();
        const info = await getIpInfo(ip);
        if (isSuccess(info)) {
            return info;
        } else {
            return {};
        }
    } catch (error) {
        console.error("Failed to get IP info:", error);
        throw error;
    }
};
