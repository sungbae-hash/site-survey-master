// Add React import to use React namespace (e.g., React.FC)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import KakaoMap from './components/KakaoMap';
import SurveyForm from './components/SurveyForm';
import { SURVEY_CONFIG } from './constants';
import { getCurrentLocation, decimalToDMS } from './utils/geoUtils';
import { loadKakaoMapScript } from './utils/kakaoLoader';
import { LocationData, SurveyMode } from './types';

const App: React.FC = () => {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [currentGps, setCurrentGps] = useState<{ lat: number; lng: number } | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [surveyMode, setSurveyMode] = useState<SurveyMode>('baseStation');
  const [copyStatus, setCopyStatus] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadKakaoMapScript();
    handleGpsClick();
  }, []);

  const handleGpsClick = async () => {
    try {
      setCopyStatus('위치 찾는 중...');
      const coords = await getCurrentLocation();
      setCurrentGps(coords);
      setCopyStatus('');
    } catch (error) {
      console.error(error);
      setCopyStatus('GPS 오류 발생');
      setCurrentGps({ lat: 37.566826, lng: 126.9786567 });
    }
  };

  const handleLocationSelect = useCallback((data: LocationData) => {
    setLocationData(data);
  }, []);

  const handleFormChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const filteredSurveyFields = useMemo(() => {
    return SURVEY_CONFIG.filter(field =>
      !field.mode || field.mode.includes(surveyMode)
    );
  }, [surveyMode]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const reportText = useMemo(() => {
    if (!locationData) return '';

    const lines: string[] = [];
    lines.push(`[${surveyMode === 'baseStation' ? '기지국' : '중계기'} 현장 조사 데이터]`);
    lines.push(`작성일시: ${new Date().toLocaleString('ko-KR')}`);
    lines.push(`----------------------------------------`);
    lines.push(`[위치 및 환경 정보]`);
    // 요청사항 반영: 위도, 경도 문구 추가 및 DMS : 십진수 좌표 병기
    lines.push(`좌표: 위도 ${locationData.lat.toFixed(6)}, 경도 ${locationData.lng.toFixed(6)}`);
    lines.push(`위도: ${decimalToDMS(locationData.lat)} : ${locationData.lat.toFixed(6)}`);
    lines.push(`경도: ${decimalToDMS(locationData.lng)} : ${locationData.lng.toFixed(6)}`);

    if (locationData.elevation) lines.push(`해발 고도: ${locationData.elevation}m`);

    if (locationData.buildingName) {
      lines.push(`건물명: ${locationData.buildingName}`);
    }

    if (locationData.floorCount) {
      lines.push(`층수: ${locationData.floorCount}`);
    }

    lines.push(`주소(지번): ${locationData.address}`);
    lines.push(`주소(도로명): ${locationData.roadAddress}`);
    lines.push(`----------------------------------------`);
    lines.push(`[조사 항목]`);

    filteredSurveyFields.forEach((field) => {
      if (field.condition && !field.condition(formData)) return;

      if (field.repeatBy && formData[field.repeatBy]) {
        const count = parseInt(formData[field.repeatBy]) || 0;
        const serializedValues: string[] = [];

        for (let i = 0; i < count; i++) {
          const val = formData[`${field.id}_${i}`] || '미입력';
          serializedValues.push(val);
        }
        lines.push(`${field.label}: ${serializedValues.join(';')}`);
      } else {
        const value = formData[field.id];
        if (field.id === 'towerQty') {
          lines.push(`${field.label}: ${value ? value + '개' : '(미입력)'}`);
        } else {
          lines.push(`${field.label}: ${value || '(미입력)'}`);
        }
      }
    });

    lines.push(`----------------------------------------`);
    return lines.join('\n');
  }, [locationData, surveyMode, formData, filteredSurveyFields]);

  const handleCopyAction = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopyStatus('클립보드에 복사되었습니다!');
      setShowPreview(false);
      setTimeout(() => setCopyStatus(''), 3000);
    } catch (err) {
      setCopyStatus('복사 실패');
    }
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto bg-gray-100 shadow-2xl overflow-hidden relative font-sans">
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">📡</span>
            <h1 className="text-lg font-bold tracking-tight">Site Survey Master</h1>
          </div>
          <button onClick={handleGpsClick} className="text-[11px] font-bold bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-full transition-all active:scale-95 shadow-lg shadow-blue-900/20">
            📍 GPS 갱신
          </button>
        </div>
      </header>

      <main className="p-4 space-y-4 relative">
        <section className="space-y-3">
          <KakaoMap currentLocation={currentGps} onLocationSelect={handleLocationSelect} />

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 space-y-4">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Coordinates</span>
                {/* 화면 표시 포맷 변경: 위도 DMS : 십진수 */}
                <p className="font-mono text-xs text-gray-700 font-bold">
                  {locationData ? (
                    <>
                      위도 {decimalToDMS(locationData.lat)} : {locationData.lat.toFixed(6)}<br />
                      경도 {decimalToDMS(locationData.lng)} : {locationData.lng.toFixed(6)}
                    </>
                  ) : <span className="text-gray-300 italic">지도를 클릭하여 위치 선택...</span>}
                </p>
              </div>
              {locationData?.elevation !== undefined && (
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                  <span className="text-xs font-black">⛰️ {locationData.elevation}m</span>
                </div>
              )}
            </div>

            {locationData?.buildingName && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-xl">🏢</div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">건물 정보</span>
                  <span className="font-bold text-slate-800 leading-tight">{locationData.buildingName}</span>
                  {locationData.floorCount && (
                    <span className="text-[10px] text-slate-500 font-medium">{locationData.floorCount}</span>
                  )}
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-3">
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 block">도로명 주소</span>
                <span className="text-sm font-bold text-slate-700 leading-snug break-keep">
                  {locationData?.roadAddress || '-'}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 block">지번 주소</span>
                <span className="text-sm font-bold text-slate-600 leading-snug break-keep">
                  {locationData?.address || '-'}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 flex mb-2">
          <button
            onClick={() => setSurveyMode('baseStation')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black transition-all ${surveyMode === 'baseStation' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <span className="text-lg">📡</span>
            <span className="text-sm">기지국</span>
          </button>
          <button
            onClick={() => setSurveyMode('repeater')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black transition-all ${surveyMode === 'repeater' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <span className="text-lg">🔁</span>
            <span className="text-sm">중계기</span>
          </button>
        </section>

        <div className="flex gap-2 sticky top-[72px] z-20 pb-2">
          <button
            onClick={() => scrollToSection('section-basic')}
            className="flex-1 bg-white/90 backdrop-blur border border-gray-200 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-sm active:scale-95 transition-all"
          >
            📝 기본정보
          </button>
          <button
            onClick={() => scrollToSection('section-antenna')}
            className="flex-1 bg-white/90 backdrop-blur border border-gray-200 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-sm active:scale-95 transition-all"
          >
            📡 공중선
          </button>
          <button
            onClick={() => scrollToSection('section-access')}
            className="flex-1 bg-white/90 backdrop-blur border border-gray-200 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-sm active:scale-95 transition-all"
          >
            🚧 출입
          </button>
        </div>

        <section className="relative pt-2">
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="h-5 w-1.5 bg-blue-600 rounded-full"></div>
            <h2 className="font-black text-slate-800 tracking-tight uppercase text-sm">
              {surveyMode === 'baseStation' ? 'Base Station' : 'Repeater'} Checklist
            </h2>
          </div>
          <SurveyForm config={filteredSurveyFields} data={formData} onChange={handleFormChange} />
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-200 z-40 max-w-md mx-auto">
        <button
          onClick={() => setShowPreview(true)}
          disabled={!locationData}
          className={`w-full font-black text-lg py-4 rounded-2xl shadow-xl transition-all flex justify-center items-center gap-3 active:scale-95 ${!locationData ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
        >
          <span className="text-xl">📋</span>
          <span>조사 결과 복사</span>
        </button>
        {copyStatus && (
          <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-slate-900/95 text-white text-[11px] font-bold px-5 py-2.5 rounded-2xl shadow-2xl animate-bounce whitespace-nowrap z-50">
            {copyStatus}
          </div>
        )}
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-[slide-up_0.3s_ease-out]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <span className="text-xl">📄</span> 결과 미리보기
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 active:scale-90 transition-transform"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <pre className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-[13px] leading-relaxed text-slate-700 font-mono whitespace-pre-wrap break-all shadow-inner">
                {reportText}
              </pre>
            </div>

            <div className="p-6 bg-white border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl active:scale-95 transition-all"
              >
                취소
              </button>
              <button
                onClick={handleCopyAction}
                className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="text-lg">📋</span> 최종 복사하기
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;