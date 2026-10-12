import React, { useState } from 'react';
import { ScheduleItem } from '../types';
import { CATEGORY_THEMES } from '../utils/categoryTheme';
import { 
  Clock, 
  MapPin, 
  Copy, 
  Check, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Utensils, 
  Users, 
  Lightbulb, 
  Share2, 
  Smartphone,
  CheckCircle2,
  Maximize,
  Car,
  Coins,
  Moon,
  Navigation
} from 'lucide-react';

interface DetailPanelProps {
  spot: ScheduleItem | null;
  onPrevSpot: () => void;
  onNextSpot: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  isVisited: boolean;
  onToggleVisited: () => void;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  spot,
  onPrevSpot,
  onNextSpot,
  hasPrev,
  hasNext,
  isVisited,
  onToggleVisited,
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showLargeHangul, setShowLargeHangul] = useState(false);

  if (!spot) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 shadow-sm">
        <MapPin className="w-10 h-10 text-slate-300 stroke-1 mb-2 animate-bounce" />
        <h4 className="text-sm font-semibold text-slate-600">スポットを選択してください</h4>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          上の地図のピンまたは左のタイムラインからスポットをタップすると、詳細情報が表示されます。
        </p>
      </div>
    );
  }

  const theme = CATEGORY_THEMES[spot.category];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Naver Map & Google Maps links
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${spot.lat},${spot.lng}`
  )}`;
  const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(spot.koreanName || spot.title)}`;

  return (
    <div className="h-full flex flex-col bg-white/85 backdrop-blur-md rounded-2xl border border-white/80 shadow-sm overflow-hidden">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-white/70">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevSpot}
            disabled={!hasPrev}
            aria-label="前のスポット"
            className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-medium text-slate-500">
            Day {spot.day} • {spot.time}
          </span>
          <button
            type="button"
            onClick={onNextSpot}
            disabled={!hasNext}
            aria-label="次のスポット"
            className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Visited Checkbox */}
        <button
          type="button"
          onClick={onToggleVisited}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
            isVisited
              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${isVisited ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span>{isVisited ? '訪問済み' : '完了にする'}</span>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 custom-scrollbar">
        {/* Category & Title */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${theme.badgeBg}`}
            >
              {theme.label}
            </span>
            <span className="text-xs text-slate-400 font-medium">{spot.subtitle}</span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
            {spot.title}
          </h2>

          {/* Korean Name Card with Taxi display mode */}
          {spot.koreanName && (
            <div className="mt-2.5 p-2.5 bg-gradient-to-r from-slate-50 to-sky-50/50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-semibold tracking-wider text-sky-700 block uppercase">
                  韓国語・ハングル表記（タクシー提示用）
                </span>
                <p className="text-base font-bold text-slate-900 font-sans tracking-wide truncate">
                  {spot.koreanName}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowLargeHangul(true)}
                  title="タクシー運転手に大きく見せる"
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-white/80 hover:text-sky-600 transition-colors shadow-2xs border border-slate-200"
                >
                  <Maximize className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(spot.koreanName!, 'korean')}
                  title="ハングルをコピー"
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-white/80 hover:text-sky-600 transition-colors shadow-2xs border border-slate-200"
                >
                  {copiedText === 'korean' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Taxi Transit Support Chip / Card */}
        {spot.taxiInfo && (
          <div className="p-3.5 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-orange-500/10 border border-amber-300/80 rounded-2xl shadow-xs space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-base">
                  🚕
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-extrabold text-amber-950">タクシー移動サポート</span>
                    {spot.taxiInfo.isNightSurcharge && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-800 rounded-md border border-purple-200">
                        <Moon className="w-2.5 h-2.5" />
                        <span>深夜割増</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-amber-800 font-medium truncate mt-0.5">
                    {spot.taxiInfo.fromLocation} → {spot.title}
                  </p>
                </div>
              </div>

              {spot.koreanName && (
                <button
                  type="button"
                  onClick={() => setShowLargeHangul(true)}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300/80 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95"
                >
                  <Maximize className="w-3.5 h-3.5 text-amber-700" />
                  <span>運転手に見せる</span>
                </button>
              )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Duration */}
              <div className="p-2.5 bg-white/95 rounded-xl border border-amber-200/80 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mb-0.5">
                  <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>概算移動時間</span>
                </div>
                <div className="text-sm font-black text-slate-900 font-sans">
                  {spot.taxiInfo.duration}
                </div>
              </div>

              {/* Fare */}
              <div className="p-2.5 bg-white/95 rounded-xl border border-amber-200/80 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mb-0.5">
                  <Coins className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>想定料金 (1台あたり)</span>
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900 font-sans leading-tight">
                    {spot.taxiInfo.fareKrw}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    {spot.taxiInfo.fareJpy}
                  </div>
                </div>
              </div>
            </div>

            {/* Per Person Estimate Pill (for 4 members) */}
            {spot.taxiInfo.perPerson && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-amber-100/70 border border-amber-200/80 rounded-xl text-[11px]">
                <span className="flex items-center gap-1 font-bold text-amber-900">
                  <Users className="w-3 h-3 text-amber-700 shrink-0" />
                  <span>4名割り勘目安</span>
                </span>
                <span className="font-extrabold text-amber-950 font-sans">{spot.taxiInfo.perPerson}</span>
              </div>
            )}

            {/* Tips */}
            {spot.taxiInfo.tips && (
              <div className="text-xs text-amber-950 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-amber-200/70">
                <div className="flex items-start gap-1.5">
                  <span className="shrink-0 text-amber-600 font-bold">💡</span>
                  <span>{spot.taxiInfo.tips}</span>
                </div>
              </div>
            )}

            {/* Fast Taxi Copy Action Buttons */}
            <div className="flex items-center gap-2 pt-0.5">
              {spot.koreanName && (
                <button
                  type="button"
                  onClick={() => handleCopy(spot.koreanName!, 'taxi-korean')}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold transition-all shadow-2xs"
                >
                  {copiedText === 'taxi-korean' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">コピー完了</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>目的地ハングル</span>
                    </>
                  )}
                </button>
              )}

              {spot.address && (
                <button
                  type="button"
                  onClick={() => handleCopy(spot.address!, 'taxi-addr')}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold transition-all shadow-2xs"
                >
                  {copiedText === 'taxi-addr' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">コピー完了</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>住所コピー(配車用)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white/60 p-3 rounded-xl border border-slate-100">
          {spot.description}
        </div>

        {/* Recommended Menu if food */}
        {spot.recommendedMenu && (
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
            <div className="flex items-center gap-1.5 text-amber-900 text-xs font-bold mb-1">
              <Utensils className="w-3.5 h-3.5 text-amber-700" />
              <span>名物・おすすめメニュー</span>
            </div>
            <p className="text-xs text-amber-950 font-medium leading-normal">
              {spot.recommendedMenu}
            </p>
          </div>
        )}

        {/* Business Group Note */}
        {spot.groupNote && (
          <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl">
            <div className="flex items-center gap-1.5 text-indigo-900 text-xs font-bold mb-1">
              <Users className="w-3.5 h-3.5 text-indigo-700" />
              <span>視察・行動メモ (4名)</span>
            </div>
            <p className="text-xs text-indigo-950 leading-normal">
              {spot.groupNote}
            </p>
          </div>
        )}

        {/* Spot Tips List */}
        {spot.tips && spot.tips.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-slate-700 text-xs font-bold">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>現地Tips・耳寄り情報</span>
            </div>
            <ul className="space-y-1 pl-1">
              {spot.tips.map((tip, idx) => (
                <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Address & Nearest Station */}
        <div className="space-y-2 pt-1 border-t border-slate-100 text-xs">
          {spot.address && (
            <div className="flex items-start justify-between gap-2 text-slate-600">
              <div className="flex items-start gap-1.5 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span className="break-all">{spot.address}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(spot.address!, 'address')}
                className="shrink-0 text-[11px] text-sky-600 hover:text-sky-700 flex items-center gap-1 font-medium"
              >
                {copiedText === 'address' ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>コピー</span>
              </button>
            </div>
          )}

          {spot.nearestStation && (
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>最寄: {spot.nearestStation}</span>
            </div>
          )}
        </div>

        {/* External Map Links */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <a
            href={naverMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Naver Map</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Large Hangul Modal (For showing directly to Seoul taxi drivers or store staff!) */}
      {showLargeHangul && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowLargeHangul(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs font-bold text-amber-600 tracking-wider flex items-center justify-center gap-1">
              <span>🚕</span>
              <span>택시 기사님께 보여주세요 (運転手さんに見せてください)</span>
            </div>
            
            <div className="py-4 border-y border-slate-100 space-y-3">
              <div className="text-xs font-bold text-slate-400">
                목적지 (目的地)
              </div>
              <div className="text-3xl font-black text-slate-900 leading-snug tracking-wide select-all">
                {spot.koreanName}
              </div>
              <div className="text-sm font-semibold text-slate-600">
                {spot.title}
              </div>

              {spot.taxiInfo && (
                <div className="px-3 py-2 bg-amber-50 rounded-xl border border-amber-200/80 text-left text-xs space-y-1">
                  <div className="text-[11px] font-bold text-amber-900 flex items-center justify-between">
                    <span>출발지: {spot.taxiInfo.fromLocation}</span>
                    <span className="font-extrabold text-amber-700">{spot.taxiInfo.duration}</span>
                  </div>
                  <div className="text-[10px] text-amber-800">
                    예상요금: {spot.taxiInfo.fareKrw}
                  </div>
                </div>
              )}

              {spot.address && (
                <div className="text-xs text-slate-700 p-2.5 bg-slate-50 rounded-xl text-left border border-slate-200 font-mono break-all select-all">
                  <span className="text-[10px] text-slate-400 block font-sans">주소 (住所):</span>
                  {spot.address}
                </div>
              )}
            </div>

            <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-100 text-xs text-sky-950 font-medium space-y-0.5">
              <div className="font-bold text-sky-800">🗣️ 伝えるフレーズ:</div>
              <div>「기사님, 여기로 가주세요」</div>
              <div className="text-[11px] text-slate-500 font-sans">（キサニム、ヨギロ カジュセヨ / 運転手さん、ここへ行ってください）</div>
            </div>

            <button
              type="button"
              onClick={() => setShowLargeHangul(false)}
              className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
