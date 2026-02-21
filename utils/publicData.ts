import { BuildingInfo } from './vworld';

const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;
const placeCache = new Map<string, BuildingInfo | null>();

/**
 * 카카오 장소 검색 API를 이용하여 해당 주소의 대표 건물명(또는 상호명)을 가져옵니다.
 *
 * @param roadAddress 도로명 주소 (ex: 강원특별자치도 원주시 한지공원길 12)
 * @param jibunAddress 지번 주소 (ex: 명륜동 821-14)
 */
export const fetchPublicBuildingInfo = async (
    roadAddress: string | undefined,
    jibunAddress: string | undefined
): Promise<BuildingInfo | null> => {
    if (!KAKAO_MAP_KEY) {
        console.warn("Kakao Map API Key is missing");
        return null;
    }

    const keyword = roadAddress && roadAddress !== '도로명 주소 없음'
        ? roadAddress
        : jibunAddress;

    if (!keyword || keyword === '지번 주소 없음') return null;

    if (placeCache.has(keyword)) {
        return placeCache.get(keyword) || null;
    }

    // 카카오 로컬 REST API - 키워드 장소 검색
    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2초 타임아웃

    try {
        const response = await fetch(url, {
            headers: { Authorization: `KakaoAK ${KAKAO_MAP_KEY}` },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) return null;

        const data = await response.json();
        const documents = data?.documents;

        if (!documents || documents.length === 0) {
            placeCache.set(keyword, null);
            return null;
        }

        // 가장 관련성 높은 첫 번째 장소의 이름을 사용합니다.
        const firstPlace = documents[0];
        const name = firstPlace.place_name || firstPlace.building_name || '';

        if (!name) {
            placeCache.set(keyword, null);
            return null;
        }

        const result = {
            name,
            floorCount: '' // 장소 API는 층수 정보 제공 안함
        };

        placeCache.set(keyword, result);
        return result;
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            console.warn("Kakao Place API timed out");
        } else {
            console.error("Kakao Place Fetch Error:", err);
        }
        return null;
    } finally {
        clearTimeout(timeoutId);
    }
};
