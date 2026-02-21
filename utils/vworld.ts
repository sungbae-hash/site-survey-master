const VWORLD_KEY = import.meta.env.VITE_VWORLD_KEY;

export interface BuildingInfo {
    name: string;
    floorCount: string;
}

// 건물 정보 캐시 (동일 위경도 소수점 4자리 기준 중복 요청 방지)
const buildingCache = new Map<string, BuildingInfo | null>();

export const fetchBuildingInfo = async (lat: number, lng: number): Promise<BuildingInfo | null> => {
    if (!VWORLD_KEY) {
        console.warn("V-World API Key is missing");
        return null;
    }

    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    if (buildingCache.has(cacheKey)) {
        return buildingCache.get(cacheKey) || null;
    }

    const url = `https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LT_C_SPBD&key=${VWORLD_KEY}&domain=${window.location.hostname}&geomFilter=POINT(${lng} ${lat})&crs=EPSG:4326`;

    return new Promise((resolve) => {
        const callbackName = `vworld_cb_${Date.now()}`;
        const script = document.createElement('script');

        // 2초 타임아웃 설정 (V-World API가 느릴 경우 화면 렌더링 지연 방지)
        const timeoutId = setTimeout(() => {
            cleanup();
            console.warn("V-World API timed out");
            resolve(null);
        }, 2000);

        const cleanup = () => {
            clearTimeout(timeoutId);
            delete (window as any)[callbackName];
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };

        script.src = `${url}&format=json&errorFormat=json&callback=${callbackName}`;

        (window as any)[callbackName] = (data: any) => {
            cleanup();

            if (data.response && data.response.status === 'OK' && data.response.result && data.response.result.featureCollection.features.length > 0) {
                const feature = data.response.result.featureCollection.features[0];
                const props = feature.properties;

                const name = props.buld_nm || '';
                const ground = props.gro_flo_co || 0;
                const under = props.und_flo_co || 0;

                let floorStr = '';
                if (ground > 0) floorStr += `지상 ${ground}층`;
                if (under > 0) floorStr += `${floorStr ? ' / ' : ''}지하 ${under}층`;

                const result = { name, floorCount: floorStr };
                buildingCache.set(cacheKey, result);
                resolve(result);
            } else {
                buildingCache.set(cacheKey, null); // 빈 결과도 캐싱하여 재요청 방지
                resolve(null);
            }
        };

        script.onerror = () => {
            cleanup();
            console.error("V-World Fetch Error");
            resolve(null);
        };

        document.body.appendChild(script);
    });
};
