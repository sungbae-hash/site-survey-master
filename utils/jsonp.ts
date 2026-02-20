
export const jsonp = (url: string, callbackParam: string = 'callback'): Promise<any> => {
  return new Promise((resolve, reject) => {
    const callbackName = `jsonp_callback_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const script = document.createElement('script');
    
    // URL에 콜백 파라미터 추가
    const separator = url.includes('?') ? '&' : '?';
    script.src = `${url}${separator}${callbackParam}=${callbackName}`;
    script.async = true;

    // 전역 콜백 함수 정의
    (window as any)[callbackName] = (data: any) => {
      cleanup();
      resolve(data);
    };

    // 에러 핸들링
    script.onerror = () => {
      cleanup();
      reject(new Error(`JSONP request failed: ${url}`));
    };

    // 청소 함수
    const cleanup = () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      delete (window as any)[callbackName];
    };

    document.body.appendChild(script);
  });
};
