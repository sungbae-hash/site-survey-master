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

/**
 * 위경도 좌표를 사용하여 해발 고도(Elevation)를 가져옵니다.
 * (무료 API인 open-elevation을 사용합니다)
 */
export const getElevation = async (lat: number, lng: number): Promise<number | undefined> => {
  try {
    const response = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`);
    if (!response.ok) throw new Error('Elevation API error');
    const data = await response.json();
    return data.results[0]?.elevation;
  } catch (error) {
    console.error('Failed to fetch elevation:', error);
    return undefined;
  }
};