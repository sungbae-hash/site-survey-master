async function test() {
    const key = '8b12e617567c01104f627facd0b456a1550079d63a3282f3fa6380100fb570aa';
    const bCode = '4213011100'; // 강원특별자치도 원주시 명륜동
    const sigunguCd = bCode.substring(0, 5);
    const bjdongCd = bCode.substring(5, 10);
    const platGbCd = '0';
    const bun = '0821';
    const ji = '0014';

    // Endpoint changed from BldRgstService_2 to BldRgstHubService
    const url = `http://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo?serviceKey=${key}&sigunguCd=${sigunguCd}&bjdongCd=${bjdongCd}&platGbCd=${platGbCd}&bun=${bun}&ji=${ji}&numOfRows=1&pageNo=1&_type=json`;

    try {
        console.log("Fetching:", url);
        const res = await fetch(url);
        console.log("Status:", res.status);
        console.log("Headers:", Object.fromEntries(res.headers.entries()));
        const text = await res.text();
        console.log("Body:", text);
    } catch (e) {
        console.error(e);
    }
}

test();
