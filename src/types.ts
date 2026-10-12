export type SpotCategory = 'flight' | 'hotel' | 'food' | 'shopping' | 'sightseeing' | 'nightlife' | 'transport';

export interface TaxiRideInfo {
  duration: string;          // 概算移動時間 (e.g. "約10〜15分")
  fareKrw: string;           // 想定料金ウォン (e.g. "約7,000〜9,500ウォン")
  fareJpy: string;           // 想定料金日本円 (e.g. "約770〜1,050円")
  perPerson?: string;        // 4名同乗時の1人あたり目安 (e.g. "4名乗車で1人約190〜260円")
  fromLocation: string;      // 出発地 (e.g. "HOTEL DM")
  tips?: string;             // タクシー乗車・配車アドバイス
  isNightSurcharge?: boolean;// 深夜割増適用フラグ (22:00〜04:00)
}

export interface ScheduleItem {
  id: string;
  day: number; // 1, 2, 3
  time: string;
  title: string;
  subtitle: string;
  koreanName?: string;
  lat: number;
  lng: number;
  category: SpotCategory;
  description: string;
  address?: string;
  nearestStation?: string;
  tips?: string[];
  recommendedMenu?: string;
  groupNote?: string; // 4名向けのアドバイス
  linkUrl?: string;
  taxiInfo?: TaxiRideInfo;
}

export interface DayInfo {
  day: number;
  date: string;
  weekday: string;
  theme: string;
  spotsCount: number;
}
