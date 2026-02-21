async function test() {
    const confmKey = 'U01TX0FVVEgyMDI2MDIyMTE5MTczMzExNzYzODA=';
    const keyword = encodeURIComponent('강원특별자치도 원주시 한지공원길 12');
    const url = `https://business.juso.go.kr/addrlink/addrLinkApi.do?confmKey=${confmKey}&currentPage=1&countPerPage=1&keyword=${keyword}&resultType=json`;

    try {
        const res = await fetch(url);
        const json = await res.json();
        console.log(JSON.stringify(json, null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
