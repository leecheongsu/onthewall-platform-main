import { PRICES } from '@/constants/price';

const getPriceByCountry = (countryCode: string) => {
  return PRICES[countryCode] || PRICES['US']; // 국가 코드가 없으면 기본값 US 사용
};

export default getPriceByCountry;
