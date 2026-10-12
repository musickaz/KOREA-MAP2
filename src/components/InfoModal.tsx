import React, { useState } from 'react';
import { 
  X, 
  PhoneCall, 
  Languages, 
  Coins, 
  Download, 
  ShieldAlert, 
  Copy, 
  Check, 
  WifiOff, 
  Users 
} from 'lucide-react';
import { generateStandaloneHtml } from '../utils/standaloneExporter';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitedCount: number;
  totalCount: number;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  visitedCount,
  totalCount,
}) => {
  const [activeTab, setActiveTab] = useState<'korean' | 'emergency' | 'calc' | 'offline'>('korean');
  const [krwAmount, setKrwAmount] = useState('50000');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const koreanPhrases = [
    { ko: '호텔 디엠으로 가주세요. (종로구 난계로29길 73, 동묘앞역 3번출구 근처)', reading: 'ホテルディエムロ カジュセヨ', ja: 'HOTEL DM（東廟前駅3番出口近く）まで行ってください（タクシー）' },
    { ko: '얼마예요?', reading: 'オルマエヨ？', ja: 'いくらですか？' },
    { ko: '깎아주세요!', reading: 'カッカジュセヨ！', ja: '安くしてください！（市場で）' },
    { ko: '계산해 주세요.', reading: 'ケサネ ジュセヨ', ja: 'お会計をお願いします' },
    { ko: '따로따로 계산해 주세요.', reading: 'タロタロ ケサネ ジュセヨ', ja: '別々に会計してください' },
    { ko: '추천 메뉴가 뭐예요?', reading: 'チュチョン メニュガ ムォエヨ？', ja: 'おすすめは何ですか？' },
    { ko: '화장실이 어디예요?', reading: 'ファジャンシリ オディエヨ？', ja: 'トイレはどこですか？' },
    { ko: '동대문역으로 가주세요.', reading: 'トンデムンヨグロ カジュセヨ', ja: '東大門駅まで行ってください（タクシー）' },
    { ko: '영수증 주세요.', reading: 'ヨンスジュン ジュセヨ', ja: 'レシートをください' },
    { ko: '물 좀 주세요.', reading: 'ムル チョム ジュセヨ', ja: 'お水をください' },
    { ko: '감사합니다 / 고맙습니다.', reading: 'カムサハムニダ / コマッスムニダ', ja: 'ありがとうございます' },
  ];

  const emergencyContacts = [
    { name: 'HOTEL DM（宿泊拠点）', number: '+82-2-2233-2882', note: 'ソウル特別市鍾路区難渓路29キル73（東廟前駅3番出口徒歩約3分）' },
    { name: '韓国 観光案内・通訳ダイヤル (24時間対応/日本語OK)', number: '1330', note: '韓国観光公社 無料案内' },
    { name: '警察（犯罪・トラブル）', number: '112', note: '緊急通報' },
    { name: '救急・消防', number: '119', note: '急病・ケガ' },
    { name: '在韓国日本国大使館 領事部', number: '+82-2-739-7400', note: 'ソウル特別市鐘路区（パスポート紛失など）' },
  ];

  const handleCopyPhrase = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadStandalone = () => {
    generateStandaloneHtml();
  };

  // Approximate KRW to JPY conversion (100 KRW = ~11.0 JPY)
  const krw = parseFloat(krwAmount) || 0;
  const jpy = Math.round(krw * 0.11);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-900">旅の便利ツール・緊急連絡先</h3>
            <p className="text-xs text-slate-500">ソウル視察 (大人4名・送迎車＆タクシー優先・HOTEL DM宿泊)</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200/80 px-4 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('korean')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'korean'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>韓国語フレーズ</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('emergency')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'emergency'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>緊急連絡先</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calc')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'calc'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>レート換算</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('offline')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'offline'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <WifiOff className="w-3.5 h-3.5" />
            <span>1枚HTML保存</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {/* Korean Tab */}
          {activeTab === 'korean' && (
            <div className="space-y-2.5">
              <div className="text-xs text-slate-500 mb-2">
                タップして韓国語をコピーできます。タクシーやお店で見せる際にも便利です。
              </div>
              <div className="grid gap-2">
                {koreanPhrases.map((phrase, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleCopyPhrase(phrase.ko, idx)}
                    className="p-3 bg-slate-50 hover:bg-sky-50/50 rounded-xl border border-slate-200/80 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-sky-700">
                        {phrase.ko}
                      </div>
                      <div className="text-xs text-sky-600 font-medium mt-0.5">
                        {phrase.reading}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {phrase.ja}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-sky-600 hover:bg-white shadow-2xs"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emergency Contacts Tab */}
          {activeTab === 'emergency' && (
            <div className="space-y-3">
              <div className="p-3 bg-rose-50 border border-rose-200/70 rounded-xl text-xs text-rose-900 leading-relaxed">
                万が一のパスポート紛失・トラブル時は慌てず1330（日本語無料通話）または日本大使館へ連絡してください。
              </div>

              <div className="space-y-2">
                {emergencyContacts.map((contact, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{contact.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{contact.note}</div>
                      <a 
                        href={`tel:${contact.number}`}
                        className="inline-block mt-1 font-mono text-sm font-bold text-sky-600 hover:underline"
                      >
                        {contact.number}
                      </a>
                    </div>
                    <a
                      href={`tel:${contact.number}`}
                      className="p-2 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                      title="発信"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Currency Calculator Tab */}
          {activeTab === 'calc' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-amber-900 block">
                  ウォン (KRW) → 日本円 (JPY) かんたん計算
                </span>
                
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    韓国ウォン額 (₩)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1000"
                      value={krwAmount}
                      onChange={(e) => setKrwAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 font-mono text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="absolute right-3 top-2 text-slate-400 font-bold text-sm">₩</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {['10000', '30000', '50000', '100000', '200000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setKrwAmount(amt)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-white border border-slate-200 hover:bg-amber-100/50 font-mono font-medium text-slate-700 transition-colors"
                    >
                      ₩{parseInt(amt).toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                  <span className="text-xs text-amber-900 font-medium">日本円換算の目安:</span>
                  <span className="text-xl font-bold font-mono text-slate-900">
                    約 ¥{jpy.toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  ※ 目安レート: 1,000 KRW ≒ 約110 円（為替により変動します）
                </div>
              </div>
            </div>
          )}

          {/* 1-File Standalone HTML Tab */}
          {activeTab === 'offline' && (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <WifiOff className="w-4 h-4 text-emerald-700" />
                  <span>完全オフライン用 1ファイルHTML書き出し</span>
                </div>
                <p className="text-xs text-emerald-950 leading-relaxed">
                  20人のメンバー全員にLINEやAirDropで配布できる、<strong>「CSS・JavaScript・Leaflet地図・全スケジュール」が1つのHTMLファイルに完結したしおりファイル</strong>をダウンロードします。
                </p>
                <p className="text-[11px] text-emerald-800">
                  機内モードや現地の地下・電波の届かない場所でも、スマートフォンのSafariやChromeでそのまま開いて全日程・地図ピン・詳細情報を閲覧可能です。
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadStandalone}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>「ソウル旅行しおり.html」を保存する</span>
              </button>

              <div className="text-xs text-slate-400 text-center">
                ※ファイルサイズは約180KB、電波不要で即座に開けます。
              </div>
            </div>
          )}
        </div>

        {/* Footer Progress & Close */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-sky-600" />
            <span>進捗: {visitedCount} / {totalCount} 完了</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
