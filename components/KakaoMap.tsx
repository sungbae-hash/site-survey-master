import React, { useEffect, useRef, useState } from 'react';
import { LocationData, KakaoMapMouseEvent } from '../types';
import { getElevation } from '../utils/geoUtils';
import { fetchBuildingInfo } from '../utils/vworld';

interface KakaoMapProps {
  currentLocation: { lat: number; lng: number } | null;
  onLocationSelect: (data: LocationData) => void;
}

const KakaoMap: React.FC<KakaoMapProps> = ({ currentLocation, onLocationSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markerInstance, setMarkerInstance] = useState<any>(null);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  // 주소 및 고도 정보 가져오기
  const fetchDetails = async (lat: number, lng: number, marker: any) => {
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) return;

    const geocoder = new window.kakao.maps.services.Geocoder();
    const elevationPromise = getElevation(lat, lng);

    geocoder.coord2Address(lng, lat, async (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const addrItem = result[0];

        // 도로명 주소 및 지번 주소
        const roadAddr = addrItem.road_address?.address_name || '도로명 주소 없음';
        const jibunAddr = addrItem.address?.address_name || '지번 주소 없음';

        const elevation = await elevationPromise;
        const vworldInfo = await fetchBuildingInfo(lat, lng);

        onLocationSelect({
          lat,
          lng,
          address: jibunAddr,
          roadAddress: roadAddr,
          buildingName: vworldInfo?.name || addrItem.road_address?.building_name || undefined,
          floorCount: vworldInfo?.floorCount,
          elevation: elevation ? Math.round(elevation) : undefined,
        });
      }
    });
  };

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 15; // 약 7.5초 동안 확인

    const initializeMap = () => {
      // 1. window.kakao 객체 존재 여부 확인
      if (typeof window.kakao !== 'undefined' && window.kakao.maps) {
        // 2. autoload=false 대응을 위해 load() 호출
        window.kakao.maps.load(() => {
          if (!mapRef.current) return;
          try {
            const center = new window.kakao.maps.LatLng(
              currentLocation?.lat || 37.566826,
              currentLocation?.lng || 126.9786567
            );

            // 지도 생성
            const map = new window.kakao.maps.Map(mapRef.current, {
              center,
              level: 3
            });
            const marker = new window.kakao.maps.Marker({ position: center });
            marker.setMap(map);

            setMapInstance(map);
            setMarkerInstance(marker);
            setLoadStatus('success');

            // 클릭 이벤트 등록
            window.kakao.maps.event.addListener(map, 'click', (mouseEvent: KakaoMapMouseEvent) => {
              const latlng = mouseEvent.latLng;
              marker.setPosition(latlng);
              fetchDetails(latlng.getLat(), latlng.getLng(), marker);
            });

            // 초기 위치 정보 즉시 분석
            fetchDetails(center.getLat(), center.getLng(), marker);
          } catch (e) {
            console.error("Map Init Error:", e);
            setLoadStatus('error');
            setErrorMessage("지도 초기화 중 오류가 발생했습니다.");
          }
        });
      } else {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(initializeMap, 500);
        } else {
          setLoadStatus('error');
          setErrorMessage("SDK 로드 실패: API 키 혹은 도메인 등록을 확인하세요.");
          console.warn("Current Origin:", window.location.origin);
          console.warn("Kakao Map Key should be registered for the origin above in Kakao Developers Console.");
        }
      }
    };

    initializeMap();
  }, []);

  // 위치 외부 변경 시 지도 이동
  useEffect(() => {
    if (loadStatus === 'success' && mapInstance && currentLocation) {
      const moveLatLon = new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng);
      mapInstance.setCenter(moveLatLon);
      markerInstance?.setPosition(moveLatLon);
      fetchDetails(currentLocation.lat, currentLocation.lng, markerInstance);
    }
  }, [currentLocation, loadStatus, mapInstance]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-inner border border-gray-200 bg-gray-50 aspect-video sm:h-80">
      {/* 로딩 상태 */}
      {loadStatus === 'loading' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-50">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-3"></div>
          <p className="text-[11px] font-bold text-slate-500">카카오맵 연결 중...</p>
        </div>
      )}

      {/* 에러 상태 (도메인 미등록 등) */}
      {loadStatus === 'error' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-red-50 p-6 text-center">
          <span className="text-3xl mb-3">⚠️</span>
          <p className="text-sm font-black text-red-600 mb-1">지도를 불러올 수 없습니다</p>
          <div className="text-[11px] text-red-400 space-y-1 leading-snug font-medium">
            <p>{errorMessage}</p>
            <div className="mt-4 p-2 bg-white rounded-lg border border-red-100 text-[10px] text-left">
              <strong>해결방법:</strong><br />
              1. <a href="https://developers.kakao.com" target="_blank" className="underline font-bold">카카오 개발자 콘솔</a> 접속<br />
              2. [내 애플리케이션] - [플랫폼] - [Web]<br />
              3. 사이트 도메인에 아래 주소 추가:<br />
              <code className="bg-gray-100 px-1 py-0.5 rounded text-red-600 break-all">{window.location.origin}</code>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-white text-red-600 text-[10px] font-black rounded-xl border border-red-100 shadow-sm active:scale-95 transition-all"
          >
            설정 후 새로고침
          </button>
        </div>
      )}

      {/* 지도 컨테이너 */}
      <div ref={mapRef} className="w-full h-full" style={{ visibility: loadStatus === 'success' ? 'visible' : 'hidden' }} />

      {/* 성공 태그 */}
      {loadStatus === 'success' && (
        <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Live Map View</span>
        </div>
      )}
    </div>
  );
};

export default KakaoMap;