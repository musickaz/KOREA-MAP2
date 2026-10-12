import React, { useEffect, useRef } from 'react';
import { ScheduleItem } from '../types';
import { CATEGORY_THEMES } from '../utils/categoryTheme';
import { 
  Plane, 
  Hotel, 
  UtensilsCrossed, 
  ShoppingBag, 
  Camera, 
  Sparkles, 
  Navigation, 
  CheckCircle2, 
  Circle, 
  ChevronRight,
  MapPin
} from 'lucide-react';

interface TimelineListProps {
  spots: ScheduleItem[];
  selectedSpotId: string | null;
  onSelectSpot: (id: string) => void;
  visitedSpotIds: Set<string>;
  onToggleVisited: (id: string, e: React.MouseEvent) => void;
}

export const TimelineList: React.FC<TimelineListProps> = ({
  spots,
  selectedSpotId,
  onSelectSpot,
  visitedSpotIds,
  onToggleVisited,
}) => {
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Auto-scroll to selected item in timeline
  useEffect(() => {
    if (!selectedSpotId) return;
    const el = itemRefs.current.get(selectedSpotId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedSpotId]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'flight':
        return <Plane className="w-3.5 h-3.5" />;
      case 'hotel':
        return <Hotel className="w-3.5 h-3.5" />;
      case 'food':
        return <UtensilsCrossed className="w-3.5 h-3.5" />;
      case 'shopping':
        return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'sightseeing':
        return <Camera className="w-3.5 h-3.5" />;
      case 'nightlife':
        return <Sparkles className="w-3.5 h-3.5" />;
      default:
        return <Navigation className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="h-full overflow-y-auto overscroll-contain pr-1 py-2 space-y-2.5 custom-scrollbar">
      {spots.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm">
          <p>該当するスケジュールがありません</p>
        </div>
      ) : (
        spots.map((spot, index) => {
          const isSelected = spot.id === selectedSpotId;
          const isVisited = visitedSpotIds.has(spot.id);
          const theme = CATEGORY_THEMES[spot.category];
          const isLast = index === spots.length - 1;

          return (
            <div
              key={spot.id}
              ref={(el) => {
                if (el) itemRefs.current.set(spot.id, el);
                else itemRefs.current.delete(spot.id);
              }}
              className="relative flex items-start gap-3 group"
            >
              {/* Timeline Connector Line */}
              {!isLast && (
                <div
                  className="absolute left-[19px] top-8 bottom-0 w-[2px] -mb-3 bg-gradient-to-b from-slate-200 to-slate-100 group-hover:from-sky-200 transition-colors"
                  aria-hidden="true"
                />
              )}

              {/* Status / Visited Toggle Button */}
              <button
                type="button"
                onClick={(e) => onToggleVisited(spot.id, e)}
                title={isVisited ? '訪問済み（クリックで未完に戻す）' : '訪問済みにチェック'}
                className="relative z-10 mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white shadow-sm border border-slate-200 hover:scale-105 active:scale-95"
              >
                {isVisited ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                ) : (
                  <span className={`text-[11px] font-bold ${isSelected ? 'text-sky-600' : 'text-slate-400'}`}>
                    {index + 1}
                  </span>
                )}
              </button>

              {/* Card Container */}
              <div
                onClick={() => onSelectSpot(spot.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectSpot(spot.id);
                  }
                }}
                className={`flex-1 min-w-0 text-left p-3.5 rounded-2xl transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-sky-50/90 to-white/95 border-sky-300 ring-2 ring-sky-400/30 shadow-md shadow-sky-900/5 -translate-y-0.5'
                    : 'bg-white/80 hover:bg-white/95 border-slate-200/80 shadow-sm hover:shadow hover:border-slate-300'
                } ${isVisited ? 'opacity-70 bg-slate-50/70' : ''}`}
              >
                {/* Header Row: Time & Category */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-mono text-xs font-bold tracking-tight px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {spot.time}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      Day {spot.day}
                    </span>
                  </div>

                  {/* Category Pill */}
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${theme.badgeBg} border-current/10`}
                  >
                    {getCategoryIcon(spot.category)}
                    <span>{theme.label.split('・')[0]}</span>
                  </span>
                </div>

                {/* Title */}
                <h3
                  className={`text-sm font-bold tracking-tight truncate ${
                    isSelected ? 'text-sky-950' : 'text-slate-900'
                  } ${isVisited ? 'line-through text-slate-500' : ''}`}
                >
                  {spot.title}
                </h3>

                {/* Subtitle / Activity preview */}
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                  {spot.subtitle}
                </p>

                {/* Taxi Transfer Badge */}
                {spot.taxiInfo && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50/90 border border-amber-200/80 px-2 py-0.5 rounded-lg w-fit">
                    <span className="text-xs">🚕</span>
                    <span>{spot.taxiInfo.duration}</span>
                    <span className="text-amber-300">•</span>
                    <span className="font-mono">{spot.taxiInfo.fareKrw.split('（')[0].replace('事前手配チャーター', '専用車').replace('基本料金', '')}</span>
                  </div>
                )}

                {/* Station or address snippet */}
                {spot.nearestStation && (
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{spot.nearestStation}</span>
                    <ChevronRight className="w-3 h-3 text-slate-300 ml-auto shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
