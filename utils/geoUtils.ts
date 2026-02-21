/**
 * 십진수 좌표를 도분초(DMS) 포맷으로 변환합니다.
 */
export const decimalToDMS = (decimal: number): string => {
  const degrees = Math.floor(decimal);
  const minutesFull = (decimal - degrees) * 60;
  const minutes = Math.floor(minutesFull);
  const seconds = ((minutesFull - minutes) * 60).toFixed(2);

  return `${degrees}° ${minutes}' ${seconds}"`;
};

/**
 * 현재 위치를 가져옵니다.
 */
export const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  });
};

// 고도 캐시 (동일한 위경도 소수점 4자리 기준 중복 요청 방지)
const elevationCache = new Map<string, number>();

/**
 * 위경도 좌표를 사용하여 해발 고도(Elevation)를 가져옵니다.
 * (빠르고 안정적인 무료 API인 Open-Meteo로 교체 및 1.5초 타임아웃 적용)
 */
export const getElevation = async (lat: number, lng: number): Promise<number | undefined> => {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (elevationCache.has(cacheKey)) {
    return elevationCache.get(cacheKey);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5초 타임아웃

  try {
    // Open-Meteo Elevation API (무료, 인증 불필요, 응답 매우 빠름)
    const response = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    if (!response.ok) throw new Error('Elevation API error');

    const data = await response.json();
    const elevation = data.elevation?.[0];

    if (elevation !== undefined) {
      elevationCache.set(cacheKey, elevation);
      return elevation;
    }
    return undefined;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Elevation fetch timed out');
    } else {
      console.error('Failed to fetch elevation:', error);
    }
    return undefined;
  } finally {
    clearTimeout(timeoutId);
  }
};