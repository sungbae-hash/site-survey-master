import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 닷홈 같은 정적 호스팅에서는 base를 './'로 설정해야 
  // 하위 폴더나 루트 경로 어디서든 에셋(js, css)을 잘 불러옵니다.
  base: './',
})