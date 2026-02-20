const VWORLD_KEY = import.meta.env.VITE_VWORLD_KEY;

export interface BuildingInfo {
    name: string;
    floorCount: string;
}

export const fetchBuildingInfo = async (lat: number, lng: number): Promise<BuildingInfo | null> => {
    if (!VWORLD_KEY) {
        console.warn("V-World API Key is missing");
        return null;
    }

    // V-World Data API URL (WFS GetFeature)
    // LT_C_SPBD: 연속지적도 건축물 정보 (Building Service)
    // intersect: 해당 좌표와 교차하는 폴리곤 검색
    const url = `https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LT_C_SPBD&key=${VWORLD_KEY}&domain=${window.location.hostname}&geomFilter=POINT(${lng} ${lat})&crs=EPSG:4326`;

    try {
        // V-World API supports CORS if domain is registered, otherwise JSONP is needed.
        // Assuming simple fetch works for now, or fallback to proxy.
        // Note: V-World requires callback for JSONP usually, but let's try direct fetch first.
        // If CORS fails, we might need a workaround or ensure the domain is registered on V-World side.
        // For local dev (localhost), it usually works if registered.

        // Using JSONP style via script tag is robust for older V-World endpoints, 
        // but the modern Data API often supports CORS. 
        // Let's try JSON P approach compatible logic if needed, but standard fetch is cleaner.
        // Actually, V-World 2.0 API often defaults to needing JSONP for browsers.
        // Let's use a simple JSONP implementation to be safe.

        return new Promise((resolve) => {
            const callbackName = `vworld_cb_${Date.now()}`;
            const script = document.createElement('script');

            // Add format=json&errorFormat=json&callback=...
            script.src = `${url}&format=json&errorFormat=json&callback=${callbackName}`;

            (window as any)[callbackName] = (data: any) => {
                delete (window as any)[callbackName];
                document.body.removeChild(script);

                if (data.response && data.response.status === 'OK' && data.response.result && data.response.result.featureCollection.features.length > 0) {
                    const feature = data.response.result.featureCollection.features[0];
                    const props = feature.properties;

                    const name = props.buld_nm || '';
                    const ground = props.gro_flo_co || 0;
                    const under = props.und_flo_co || 0;

                    let floorStr = '';
                    if (ground > 0) floorStr += `지상 ${ground}층`;
                    if (under > 0) floorStr += `${floorStr ? ' / ' : ''}지하 ${under}층`;

                    resolve({
                        name,
                        floorCount: floorStr
                    });
                } else {
                    resolve(null);
                }
            };

            script.onerror = () => {
                delete (window as any)[callbackName];
                document.body.removeChild(script);
                resolve(null);
            };

            document.body.appendChild(script);
        });

    } catch (error) {
        console.error("V-World Fetch Error:", error);
        return null;
    }
};
