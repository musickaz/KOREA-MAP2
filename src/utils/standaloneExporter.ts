import { SCHEDULE_ITEMS, DAYS_INFO } from '../data/scheduleData';

export function buildStandaloneHtmlContent(): string {
  const scheduleJson = JSON.stringify(SCHEDULE_ITEMS);
  const daysJson = JSON.stringify(DAYS_INFO);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>ソウル旅行しおり (SEOUL TRIP 2026)</title>
  <!-- Leaflet CSS -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
  <!-- Tailwind via CDN for standalone portability -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Leaflet JS -->
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
  <style>
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif; }
    .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.3); border-radius: 9999px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.5); }
    .pin-pulse { animation: pinPulse 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
    @keyframes pinPulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.6); opacity: 0; }
      100% { transform: scale(1); opacity: 0; }
    }
  </style>
</head>
<body class="bg-slate-100 text-slate-800 h-screen w-screen overflow-hidden flex flex-col antialiased select-none sm:select-auto">

  <!-- UPPER HALF (40vh): LEAFLET MAP -->
  <div id="map-section" class="h-[40vh] relative w-full bg-slate-200 border-b border-slate-200 shrink-0">
    <div id="standalone-map" class="w-full h-full z-0"></div>
    
    <!-- Map Controls Overlay -->
    <div class="absolute top-2 right-2 z-20 flex flex-col gap-1">
      <button onclick="resetMapView()" title="全体表示" class="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-lg shadow border border-white/60 text-slate-700 hover:bg-slate-50 text-xs font-bold">
        ⛶
      </button>
      <button onclick="locateMe()" title="現在地" class="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-lg shadow border border-white/60 text-slate-700 hover:bg-slate-50 text-xs font-bold">
        📍
      </button>
    </div>

    <!-- Current Day Title Badge -->
    <div class="absolute top-2 left-2 z-20 pointer-events-none">
      <div id="map-badge" class="px-2.5 py-1 bg-white/90 backdrop-blur-md border border-white/70 rounded-full shadow text-[11px] font-bold text-slate-700">
        Day 1: 到着・休息・深夜卸売市場集中調査
      </div>
    </div>
  </div>

  <!-- CONTROL BAR (Zero height waste, 40px bar aligning Tabs + Days + Status) -->
  <div class="h-10 bg-white/95 backdrop-blur-md border-b border-slate-200 px-2 sm:px-3 flex items-center justify-between gap-1 shrink-0 z-20 shadow-2xs">
    <!-- Mobile view toggle buttons -->
    <div class="md:hidden flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
      <button onclick="setMobileView('timeline')" id="tab-mobile-timeline" class="px-2.5 py-1 text-xs font-bold text-sky-600 bg-white rounded-md shadow-2xs transition-all">
        タイムライン
      </button>
      <button onclick="setMobileView('detail')" id="tab-mobile-detail" class="px-2.5 py-1 text-xs font-bold text-slate-600 rounded-md transition-all">
        詳細
      </button>
    </div>

    <!-- Desktop subtitle -->
    <div class="hidden md:flex items-center gap-1.5 text-xs font-bold text-slate-700">
      <span class="text-sky-600">🇰🇷</span>
      <span>ソウル視察 (4名)</span>
    </div>

    <!-- Day Filter Pills -->
    <div class="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
      <button onclick="setDayFilter('all')" id="btn-day-all" class="day-filter-btn px-2 py-0.5 text-xs font-bold rounded-md transition-all text-slate-600">全日程</button>
      <button onclick="setDayFilter(1)" id="btn-day-1" class="day-filter-btn px-2 py-0.5 text-xs font-bold rounded-md transition-all bg-sky-500 text-white shadow-xs">DAY 1</button>
      <button onclick="setDayFilter(2)" id="btn-day-2" class="day-filter-btn px-2 py-0.5 text-xs font-bold rounded-md transition-all text-slate-600">DAY 2</button>
      <button onclick="setDayFilter(3)" id="btn-day-3" class="day-filter-btn px-2 py-0.5 text-xs font-bold rounded-md transition-all text-slate-600">DAY 3</button>
    </div>
  </div>

  <!-- LOWER SECTION (60vh): TIMELINE (LEFT) + DETAILS (RIGHT) -->
  <div class="flex-1 flex flex-col md:flex-row bg-slate-50 overflow-hidden">
    
    <!-- BOTTOM LEFT: TIMELINE LIST -->
    <div id="timeline-container" class="w-full md:w-1/2 h-full overflow-y-auto custom-scrollbar p-3 border-r border-slate-200/80 bg-white/50 backdrop-blur-xs">
      <div id="timeline-list" class="space-y-2"></div>
    </div>

    <!-- BOTTOM RIGHT: SPOT DETAIL PANEL -->
    <div id="detail-container" class="hidden md:block w-full md:w-1/2 h-full overflow-y-auto custom-scrollbar p-4 bg-white/80 backdrop-blur-md">
      <div id="detail-content" class="h-full">
        <!-- Populated by JS -->
      </div>
    </div>

  </div>

  <script>
    const SCHEDULE_DATA = ${scheduleJson};
    const DAYS_INFO = ${daysJson};

    let currentDayFilter = 1;
    let selectedSpotId = 'd1-1';
    let map = null;
    let markersMap = {};
    let polyline = null;
    let userMarker = null;
    let mobileView = 'timeline';

    // Initialize Leaflet Map
    function initMap() {
      map = L.map('standalone-map', {
        zoomControl: false,
        attributionControl: false
      }).setView([37.5714, 127.0163], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        crossOrigin: true
      }).addTo(map);

      renderTimeline();
      updateMapPins();
      renderDetail(selectedSpotId);

      // Handle map resize
      window.addEventListener('resize', () => {
        if (map) map.invalidateSize();
      });
    }

    function getFilteredSpots() {
      if (currentDayFilter === 'all') return SCHEDULE_DATA;
      return SCHEDULE_DATA.filter(s => s.day === currentDayFilter);
    }

    function setDayFilter(day) {
      currentDayFilter = day;
      document.querySelectorAll('.day-filter-btn').forEach(btn => {
        btn.className = 'day-filter-btn px-2 py-0.5 text-xs font-bold rounded-md transition-all text-slate-600 hover:bg-slate-200';
      });
      const activeBtn = document.getElementById('btn-day-' + day);
      if (activeBtn) {
        activeBtn.className = 'day-filter-btn px-2 py-0.5 text-xs font-bold rounded-md transition-all bg-sky-500 text-white shadow-xs';
      }

      // Update badge
      const badge = document.getElementById('map-badge');
      if (badge) {
        if (day === 'all') {
          badge.textContent = '全日程ルートマップ (ソウル・福岡)';
        } else {
          const dInfo = DAYS_INFO.find(d => d.day === day);
          badge.textContent = 'Day ' + day + ': ' + (dInfo ? dInfo.theme : '');
        }
      }

      // Select first spot of day if current selected isn't in filtered
      const spots = getFilteredSpots();
      if (spots.length > 0 && !spots.some(s => s.id === selectedSpotId)) {
        selectedSpotId = spots[0].id;
      }

      renderTimeline();
      updateMapPins();
      renderDetail(selectedSpotId);
      resetMapView();
    }

    function updateMapPins() {
      // Clear previous markers
      Object.values(markersMap).forEach(m => map.removeLayer(m));
      markersMap = {};
      if (polyline) map.removeLayer(polyline);

      const spots = getFilteredSpots();
      if (!spots.length) return;

      // Draw polyline
      const latLngs = spots.map(s => [s.lat, s.lng]);
      polyline = L.polyline(latLngs, {
        color: currentDayFilter === 'all' ? '#6366f1' : '#0284c7',
        weight: 3.5,
        opacity: 0.75,
        dashArray: '6, 8',
        lineCap: 'round'
      }).addTo(map);

      // Add pins
      spots.forEach((spot, idx) => {
        const isSel = spot.id === selectedSpotId;
        const iconHtml = \`
          <div class="relative flex items-center justify-center cursor-pointer transition-all duration-200 \${isSel ? 'scale-125 z-50' : 'hover:scale-110 z-20'}">
            \${isSel ? '<span class="absolute -inset-2 rounded-full bg-sky-400/40 pin-pulse"></span>' : ''}
            <div class="flex items-center gap-1 px-2 py-1 rounded-full shadow-md border \${
              isSel
                ? 'bg-slate-900 text-white border-sky-400 ring-2 ring-sky-400 ring-offset-1'
                : 'bg-white/95 text-slate-800 border-slate-200/80 backdrop-blur-sm'
            }">
              <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold \${isSel ? 'bg-sky-400 text-slate-900' : 'bg-slate-100 text-slate-700'}">
                \${idx + 1}
              </span>
              <span class="text-xs font-semibold whitespace-nowrap tracking-tight">\${spot.time}</span>
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 \${isSel ? 'bg-slate-900' : 'bg-white'} border-r border-b border-slate-300"></div>
          </div>
        \`;

        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-pin',
          iconSize: [80, 36],
          iconAnchor: [40, 36]
        });

        const marker = L.marker([spot.lat, spot.lng], { icon, zIndexOffset: isSel ? 1000 : 10 })
          .addTo(map)
          .on('click', () => {
            selectSpot(spot.id);
          });

        marker.bindTooltip('<div class="text-xs font-bold p-1">' + spot.title + '</div>', { direction: 'top', offset: [0, -28] });
        markersMap[spot.id] = marker;
      });
    }

    function selectSpot(id) {
      selectedSpotId = id;
      const spot = SCHEDULE_DATA.find(s => s.id === id);
      if (!spot) return;

      // 1. Zoom & Center map on pin
      map.flyTo([spot.lat, spot.lng], 16, { animate: true, duration: 0.8 });
      updateMapPins();

      // 2. Highlight timeline item & scroll into view
      renderTimeline();
      const el = document.getElementById('timeline-item-' + id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // 3. Render detail panel
      renderDetail(id);

      // On mobile, if in timeline view and clicked, auto-switch to detail if desired or stay
      if (window.innerWidth < 768 && mobileView === 'timeline') {
        // can switch or let user tap tab
      }
    }

    function renderTimeline() {
      const container = document.getElementById('timeline-list');
      const spots = getFilteredSpots();

      container.innerHTML = spots.map((spot, idx) => {
        const isSel = spot.id === selectedSpotId;
        return \`
          <div 
            id="timeline-item-\${spot.id}"
            onclick="selectSpot('\${spot.id}')"
            class="p-3 rounded-xl border transition-all cursor-pointer \${
              isSel
                ? 'bg-gradient-to-r from-sky-50 to-white border-sky-300 ring-2 ring-sky-400/30 shadow-sm -translate-y-0.5'
                : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-2xs'
            }"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-bold font-mono px-2 py-0.5 rounded \${isSel ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-700'}">
                \${spot.time}
              </span>
              <span class="text-[11px] text-slate-400 font-medium">Day \${spot.day}</span>
            </div>
            <div class="text-sm font-bold \${isSel ? 'text-sky-950' : 'text-slate-900'} truncate">\${spot.title}</div>
            <div class="text-xs text-slate-500 truncate mt-0.5">\${spot.subtitle}</div>
            \${spot.taxiInfo ? \`
              <div class="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50/90 border border-amber-200/80 px-2 py-0.5 rounded-lg w-fit">
                <span>🚕</span>
                <span>\${spot.taxiInfo.duration}</span>
                <span class="text-amber-300">•</span>
                <span class="font-mono">\${spot.taxiInfo.fareKrw.split('（')[0].replace('事前手配チャーター', '専用車').replace('基本料金', '')}</span>
              </div>
            \` : ''}
            \${spot.koreanName ? '<div class="text-[11px] text-slate-400 font-medium mt-1">🇰🇷 ' + spot.koreanName + '</div>' : ''}
          </div>
        \`;
      }).join('');
    }

    function renderDetail(id) {
      const container = document.getElementById('detail-content');
      const spot = SCHEDULE_DATA.find(s => s.id === id);
      if (!spot) {
        container.innerHTML = '<div class="flex items-center justify-center h-full text-xs text-slate-400">スポットを選択してください</div>';
        return;
      }

      const spots = getFilteredSpots();
      const currIdx = spots.findIndex(s => s.id === id);
      const prevId = currIdx > 0 ? spots[currIdx - 1].id : null;
      const nextId = currIdx < spots.length - 1 ? spots[currIdx + 1].id : null;

      container.innerHTML = \`
        <div class="h-full flex flex-col justify-between space-y-4">
          <div>
            <!-- Navigation buttons -->
            <div class="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <div class="flex gap-1">
                <button onclick="\${prevId ? \`selectSpot('\${prevId}')\` : ''}" \${!prevId ? 'disabled' : ''} class="px-2.5 py-1 bg-slate-100 disabled:opacity-30 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200">
                  ← 前へ
                </button>
                <button onclick="\${nextId ? \`selectSpot('\${nextId}')\` : ''}" \${!nextId ? 'disabled' : ''} class="px-2.5 py-1 bg-slate-100 disabled:opacity-30 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200">
                  次へ →
                </button>
              </div>
              <span class="text-xs font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                Day \${spot.day} • \${spot.time}
              </span>
            </div>

            <!-- Title & Subtitle -->
            <h2 class="text-lg font-black text-slate-900 leading-tight">\${spot.title}</h2>
            <p class="text-xs text-slate-500 font-medium mt-0.5">\${spot.subtitle}</p>

            <!-- Taxi Transit Support Chip / Card -->
            \${spot.taxiInfo ? \`
              <div class="mt-3 p-3 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-orange-500/10 border border-amber-300/80 rounded-2xl shadow-2xs space-y-2.5">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <span class="text-base">🚕</span>
                    <span class="text-xs font-black text-amber-950">タクシー移動サポート</span>
                    \${spot.taxiInfo.isNightSurcharge ? '<span class="text-[10px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded">🌙 深夜割増</span>' : ''}
                  </div>
                  <span class="text-[10px] text-amber-800 font-semibold">\${spot.taxiInfo.fromLocation} → \${spot.title}</span>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div class="p-2 bg-white rounded-xl border border-amber-200/70">
                    <div class="text-[10px] text-slate-400 font-semibold">概算移動時間</div>
                    <div class="text-xs font-black text-slate-900 mt-0.5">\${spot.taxiInfo.duration}</div>
                  </div>
                  <div class="p-2 bg-white rounded-xl border border-amber-200/70">
                    <div class="text-[10px] text-slate-400 font-semibold">想定料金 (1台)</div>
                    <div class="text-xs font-black text-slate-900 mt-0.5 leading-tight">\${spot.taxiInfo.fareKrw}</div>
                    <div class="text-[10px] text-slate-500 mt-0.5">\${spot.taxiInfo.fareJpy}</div>
                  </div>
                </div>

                \${spot.taxiInfo.perPerson ? \`
                  <div class="px-2.5 py-1 bg-amber-100/70 rounded-lg text-[11px] font-medium text-amber-950 flex justify-between">
                    <span class="font-bold text-amber-900">👥 4名割り勘</span>
                    <span class="font-bold">\${spot.taxiInfo.perPerson}</span>
                  </div>
                \` : ''}

                \${spot.taxiInfo.tips ? \`
                  <div class="text-[11px] text-amber-950 bg-white/80 p-2 rounded-lg border border-amber-200/60 leading-relaxed">
                    💡 \${spot.taxiInfo.tips}
                  </div>
                \` : ''}
              </div>
            \` : ''}

            <!-- Korean Name Box (Taxi show mode) -->
            \${spot.koreanName ? \`
              <div class="mt-3 p-3 bg-sky-50/70 border border-sky-200/80 rounded-xl flex items-center justify-between">
                <div>
                  <span class="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">タクシー提示用ハングル</span>
                  <p class="text-base font-black text-slate-900">\${spot.koreanName}</p>
                </div>
                <button onclick="navigator.clipboard.writeText('\${spot.koreanName}'); alert('コピーしました: ' + '\${spot.koreanName}');" class="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs">
                  コピー
                </button>
              </div>
            \` : ''}

            <!-- Description -->
            <div class="mt-3 text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              \${spot.description}
            </div>

            <!-- Recommended Menu -->
            \${spot.recommendedMenu ? \`
              <div class="mt-2.5 p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl">
                <span class="text-[11px] font-bold text-amber-900 block">🍲 おすすめメニュー</span>
                <p class="text-xs text-amber-950 font-medium mt-0.5">\${spot.recommendedMenu}</p>
              </div>
            \` : ''}

            <!-- Business Inspection Group Note -->
            \${spot.groupNote ? \`
              <div class="mt-2.5 p-2.5 bg-indigo-50/80 border border-indigo-200/80 rounded-xl">
                <span class="text-[11px] font-bold text-indigo-900 block">👥 視察・行動メモ (4名)</span>
                <p class="text-xs text-indigo-950 mt-0.5">\${spot.groupNote}</p>
              </div>
            \` : ''}

            <!-- Address & Station -->
            <div class="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
              \${spot.address ? '<div>📍 <span class="font-mono text-[11px]">' + spot.address + '</span></div>' : ''}
              \${spot.nearestStation ? '<div class="text-slate-500">🚇 ' + spot.nearestStation + '</div>' : ''}
            </div>
          </div>

          <!-- Bottom External Maps -->
          <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <a href="https://map.naver.com/v5/search/\${encodeURIComponent(spot.koreanName || spot.title)}" target="_blank" class="py-2 text-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs">
              Naver Map
            </a>
            <a href="https://www.google.com/maps/search/?api=1&query=\${spot.lat},\${spot.lng}" target="_blank" class="py-2 text-center bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-2xs">
              Google Maps
            </a>
          </div>
        </div>
      \`;
    }

    function resetMapView() {
      const spots = getFilteredSpots();
      if (!spots.length || !map) return;
      const bounds = L.latLngBounds(spots.map(s => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }

    function locateMe() {
      if (!navigator.geolocation) {
        alert('位置情報に対応していません');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        pos => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          if (userMarker) map.removeLayer(userMarker);
          userMarker = L.circleMarker([lat, lng], { radius: 8, fillColor: '#0284c7', color: '#fff', weight: 2, fillOpacity: 0.9 }).addTo(map);
          map.flyTo([lat, lng], 16);
        },
        err => alert('現在地を取得できませんでした')
      );
    }

    function setMobileView(view) {
      mobileView = view;
      const timelineCont = document.getElementById('timeline-container');
      const detailCont = document.getElementById('detail-container');
      const tabTimeline = document.getElementById('tab-mobile-timeline');
      const tabDetail = document.getElementById('tab-mobile-detail');

      if (view === 'timeline') {
        timelineCont.classList.remove('hidden');
        detailCont.classList.add('hidden');
        tabTimeline.className = 'flex-1 py-2 text-xs font-bold text-sky-600 border-b-2 border-sky-500';
        tabDetail.className = 'flex-1 py-2 text-xs font-bold text-slate-500 border-b-2 border-transparent';
      } else {
        timelineCont.classList.add('hidden');
        detailCont.classList.remove('hidden');
        tabTimeline.className = 'flex-1 py-2 text-xs font-bold text-slate-500 border-b-2 border-transparent';
        tabDetail.className = 'flex-1 py-2 text-xs font-bold text-sky-600 border-b-2 border-sky-500';
      }
    }

    window.onload = initMap;
  </script>
</body>
</html>`;
}

export function generateStandaloneHtml(): void {
  const content = buildStandaloneHtmlContent();
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ソウル旅行しおり_SEOUL_TRIP_2026.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
