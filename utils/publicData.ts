import { BuildingInfo } from './vworld';

const PUBLIC_DATA_KEY = import.meta.env.VITE_PUBLIC_DATA_KEY;
const publicDataCache = new Map<string, BuildingInfo | null>();

/**
 * 공공데이터포털 건축물대장정보(표제부) API에서 층수를 가져옵니다.
 *
 * @param bCode 법정동코드 10자리 (ex: 1168010100)
 * @param platGbCd 대지구분코드 (0: 대지, 1: 산, 2: 블록)
 * @param bun 본번
 * @param ji 부번
 */
export const fetchPublicBuildingInfo = async (
    bCode: string | undefined,
    platGbCd: string,
    bun: string | undefined,
    ji: string | undefined
): Promise<BuildingInfo | null> => {
    if (!PUBLIC_DATA_KEY) {
        console.warn("Public Data API Key is missing");
        return null;
    }

    if (!bCode || bCode.length !== 10) return null;

    let sigunguCd = bCode.substring(0, 5);
    const bjdongCd = bCode.substring(5, 10);

    // 강원특별자치도(42->51), 전북특별자치도(45->52) 적용
    // 카카오맵 최신화 여부에 따라 구 법정동 코드가 들어올 수 있으므로 강제 매핑합니다.
    if (sigunguCd.startsWith('42')) sigunguCd = '51' + sigunguCd.substring(2);
    if (sigunguCd.startsWith('45')) sigunguCd = '52' + sigunguCd.substring(2);
    const formattedBun = (bun || '0').padStart(4, '0');
    const formattedJi = (ji || '0').padStart(4, '0');

    const cacheKey = `${sigunguCd}-${bjdongCd}-${platGbCd}-${formattedBun}-${formattedJi}`;
    if (publicDataCache.has(cacheKey)) {
        return publicDataCache.get(cacheKey) || null;
    }

    // 건축물대장 표제부조회 국토부 API 엔드포인트 (건축HUB 신규 API)
    const url = `https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo?serviceKey=${PUBLIC_DATA_KEY}&sigunguCd=${sigunguCd}&bjdongCd=${bjdongCd}&platGbCd=${platGbCd}&bun=${formattedBun}&ji=${formattedJi}&numOfRows=1&pageNo=1&_type=json`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5초 타임아웃

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) return null;

        const data = await response.json();
        const items = data?.response?.body?.items?.item;

        if (!items) {
            publicDataCache.set(cacheKey, null);
            return null;
        }

        // items가 배열일 수도 있고 단일 객체일 수도 있음 (공공데이터포털 JSON 특성)
        const item = Array.isArray(items) ? items[0] : items;

        const name = item.bldNm || ''; // 건물명
        const ground = item.grndFlrCnt || 0; // 지상층
        const under = item.ugrndFlrCnt || 0; // 지하층

        let floorStr = '';
        if (ground > 0) floorStr += `지상 ${ground}층`;
        if (under > 0) floorStr += `${floorStr ? ' / ' : ''}지하 ${under}층`;

        // 층수 정보가 없는 경우 null 처리
        if (!floorStr) {
            publicDataCache.set(cacheKey, null);
            return null;
        }

        const result = {
            name,
            floorCount: floorStr
        };

        publicDataCache.set(cacheKey, result);
        return result;
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            console.warn("Public Data API timed out");
        } else {
            console.error("Public Data Fetch Error:", err);
        }
        return null;
    } finally {
        clearTimeout(timeoutId);
    }
};
