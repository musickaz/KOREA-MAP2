import React, { useState, useEffect, useMemo } from 'react';
import { SCHEDULE_ITEMS, DAYS_INFO } from './data/scheduleData';
import { ScheduleItem } from './types';
import { TravelMap } from './components/TravelMap';
import { TimelineList } from './components/TimelineList';
import { DetailPanel } from './components/DetailPanel';
import { InfoModal } from './components/InfoModal';
import { 
  Compass, 
  Calendar, 
  Search, 
  Sparkles, 
  Download, 
  HelpCircle, 
  CheckCircle2, 
  ListOrdered, 
  FileText,
  Smartphone,
  Share2
} from 'lucide-react';
import { generateStandaloneHtml } from './utils/standaloneExporter';

export default function App() {
  const [currentDay, setCurrentDay] = useState<number | 'all'>(1);
  const [selectedSpotId, setSelectedSpotId] = useState<string>('d1-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [visitedSpotIds, setVisitedSpotIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('seoul_trip_visited');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [mobileBottomView, setMobileBottomView] = useState<'timeline' | 'detail'>('timeline');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Save visited spots to localStorage for offline persistence
  useEffect(() => {
    try {
      localStorage.setItem('seoul_trip_visited', JSON.stringify(Array.from(visitedSpotIds)));
    } catch (e) {
      console.error('Failed to persist visited spots', e);
    }
  }, [visitedSpotIds]);

  // Filter spots by Day and Search query
  const filteredSpots = useMemo(() => {
    return SCHEDULE_ITEMS.filter((spot) => {
      const matchesDay = currentDay === 'all' || spot.day === currentDay;
      const matchesSearch = !searchQuery || 
        spot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (spot.koreanName && spot.koreanName.includes(searchQuery)) ||
        spot.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDay && matchesSearch;
    });
  }, [currentDay, searchQuery]);

  // Selected spot object
  const selectedSpot = useMemo(() => {
    return SCHEDULE_ITEMS.find((s) => s.id === selectedSpotId) || null;
  }, [selectedSpotId]);

  // Handle spot selection from either Timeline OR Map pin
  const handleSelectSpot = (id: string) => {
    setSelectedSpotId(id);
    // On mobile, keep track and switch to detail if user tapped a pin or item
    const target = SCHEDULE_ITEMS.find(s => s.id === id);
    if (target && currentDay !== 'all' && target.day !== currentDay) {
      setCurrentDay(target.day);
    }
  };

  // Previous & Next navigation in filtered list
  const currentIndex = filteredSpots.findIndex((s) => s.id === selectedSpotId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < filteredSpots.length - 1;

  const handlePrevSpot = () => {
    if (hasPrev) {
      handleSelectSpot(filteredSpots[currentIndex - 1].id);
    }
  };

  const handleNextSpot = () => {
    if (hasNext) {
      handleSelectSpot(filteredSpots[currentIndex + 1].id);
    }
  };

  // Toggle visited status
  const handleToggleVisited = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setVisitedSpotIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Handle day tab click
  const handleDayChange = (day: number | 'all') => {
    setCurrentDay(day);
    // Automatically select the first spot of the day
    const daySpots = day === 'all' ? SCHEDULE_ITEMS : SCHEDULE_ITEMS.filter(s => s.day === day);
    if (daySpots.length > 0) {
      setSelectedSpotId(daySpots[0].id);
    }
  };

  // Progress stats
  const totalCount = SCHEDULE_ITEMS.length;
  const visitedCount = visitedSpotIds.size;
  const progressPercent = Math.round((visitedCount / totalCount) * 100);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-100 text-slate-800 font-sans select-none sm:select-auto">
      {/* 1. UPPER SECTION (2/5 = 40vh): LEAFLET MAP */}
      <section 
        id="map-panel" 
        aria-label="地図ビュー"
        className="h-[40vh] relative w-full border-b border-slate-200 shrink-0"
      >
        <TravelMap
          spots={SCHEDULE_ITEMS}
          selectedSpotId={selectedSpotId}
          onSelectSpot={handleSelectSpot}
          currentDay={currentDay}
        />
      </section>

      {/* 2. UNIFIED CONTROL BAR DIRECTLY BELOW MAP (Zero wasted height, clean inline alignment) */}
      <div 
        id="control-bar"
        className="h-10 bg-white/95 backdrop-blur-md border-b border-slate-200 px-2 sm:px-3 flex items-center justify-between gap-1.5 shrink-0 z-20 shadow-2xs"
      >
        {/* Left: Mobile View Switcher (Timeline vs Detail) & Desktop Label */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Mobile switcher */}
          <div className="flex md:hidden items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
            <button
              type="button"
              onClick={() => setMobileBottomView('timeline')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                mobileBottomView === 'timeline'
                  ? 'bg-white text-sky-600 shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>タイムライン</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileBottomView('detail')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                mobileBottomView === 'detail'
                  ? 'bg-white text-sky-600 shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>詳細パネル</span>
            </button>
          </div>

          {/* Desktop compact indicator */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-bold">
              <Compass className="w-3.5 h-3.5 text-sky-600" />
              <span>ソウル視察</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              {visitedCount}/{totalCount}完了 ({progressPercent}%)
            </span>
          </div>
        </div>

        {/* Center: Day Selector Tabs (DAY 1, DAY 2, DAY 3, 全日程) */}
        <div className="flex items-center bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/80">
          <button
            type="button"
            onClick={() => handleDayChange('all')}
            className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all ${
              currentDay === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            全日程
          </button>
          {DAYS_INFO.map((d) => (
            <button
              key={d.day}
              type="button"
              onClick={() => handleDayChange(d.day)}
              className={`px-2 sm:px-2.5 py-0.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
                currentDay === d.day
                  ? 'bg-sky-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>DAY {d.day}</span>
              <span className="text-[10px] opacity-80 hidden lg:inline">({d.date})</span>
            </button>
          ))}
        </div>

        {/* Right: Quick Action Buttons (Compact icons/buttons) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={generateStandaloneHtml}
            title="完全オフライン用1ファイルHTMLを保存"
            className="flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">1枚HTML</span>
          </button>
          <button
            type="button"
            onClick={() => setIsInfoModalOpen(true)}
            title="旅の便利帳・緊急連絡先"
            className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80 rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-95"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">便利帳</span>
          </button>
        </div>
      </div>

      {/* 3. LOWER SECTION (3/5 = 60vh minus bar): RESPONSIVE EXPANDED VIEW */}
      <section 
        id="content-panel" 
        aria-label="スケジュールおよびスポット詳細"
        className="flex-1 flex flex-col overflow-hidden bg-slate-100/70"
      >
        {/* SPLIT LOWER AREA: 50% LEFT TIMELINE + 50% RIGHT DETAIL PANEL (DESKTOP) */}
        <div className="flex-1 flex flex-row overflow-hidden p-2 sm:p-3 gap-2 sm:gap-3">
          
          {/* LEFT PANE: TIMELINE LIST */}
          <div 
            className={`w-full md:w-1/2 h-full flex flex-col bg-white/80 backdrop-blur-md rounded-2xl border border-white shadow-sm overflow-hidden ${
              mobileBottomView === 'detail' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Timeline Header & Search Bar */}
            <div className="p-2 sm:p-2.5 border-b border-slate-100 bg-white/70 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-800 tracking-tight">
                  {currentDay === 'all' ? '全行程' : `Day ${currentDay}`} タイムライン
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600">
                  {filteredSpots.length} 件
                </span>
              </div>

              {/* Search input */}
              <div className="relative w-36 sm:w-44">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="スポット検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-100/90 rounded-xl border border-slate-200/60 focus:outline-none focus:ring-1 focus:ring-sky-400 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Scrollable Timeline */}
            <div className="flex-1 overflow-hidden p-2">
              <TimelineList
                spots={filteredSpots}
                selectedSpotId={selectedSpotId}
                onSelectSpot={(id) => {
                  handleSelectSpot(id);
                  // On mobile, tapping item can immediately show detail
                  if (window.innerWidth < 768) {
                    setMobileBottomView('detail');
                  }
                }}
                visitedSpotIds={visitedSpotIds}
                onToggleVisited={handleToggleVisited}
              />
            </div>

            {/* Progress Footer */}
            <div className="px-3 py-1.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-sky-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span>制覇率 {progressPercent}%</span>
              </div>
              <span>{visitedCount} / {totalCount} スポット</span>
            </div>
          </div>

          {/* RIGHT PANE: SPOT DETAIL PANEL */}
          <div 
            className={`w-full md:w-1/2 h-full flex flex-col ${
              mobileBottomView === 'timeline' ? 'hidden md:flex' : 'flex'
            }`}
          >
              <DetailPanel
                spot={selectedSpot}
                onPrevSpot={handlePrevSpot}
                onNextSpot={handleNextSpot}
                hasPrev={hasPrev}
                hasNext={hasNext}
                isVisited={selectedSpot ? visitedSpotIds.has(selectedSpot.id) : false}
                onToggleVisited={() => {
                  if (selectedSpot) {
                    handleToggleVisited(selectedSpot.id);
                  }
                }}
              />
            </div>

          </div>
        </section>

      {/* 3. MODAL FOR EMERGENCY CONTACTS, KOREAN PHRASES, AND STANDALONE EXPORT */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        visitedCount={visitedCount}
        totalCount={totalCount}
      />
    </div>
  );
}
