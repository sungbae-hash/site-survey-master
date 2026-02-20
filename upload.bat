@echo off
echo.
echo ==============================================
echo ====  GitHub 업로드 자동화 스크립트  ====
echo ==============================================
echo.

:: 1. 모든 변경사항 추가
echo [1/3] 변경사항을 추가하는 중...
git add .
echo 완료!
echo.

:: 2. 현재 날짜와 시간으로 커밋
echo [2/3] 저장소에 기록(Commit)하는 중...
:: 날짜와 시간 포맷 설정 (YYYY-MM-DD HH:MM:SS)
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set commit_msg=자동 업데이트: %datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2% %datetime:~8,2%:%datetime:~10,2%

git commit -m "%commit_msg%"
echo 완료! (%commit_msg%)
echo.

:: 3. GitHub으로 업로드(Push)
echo [3/3] GitHub로 푸시(Push)하는 중...
git push
echo 완료!
echo.

echo ==============================================
echo ====        업로드가 완료되었습니다!      ====
echo ==============================================
echo 잠시 후 GitHub Action이 실행되어 닷홈에 배포됩니다.
echo.
pause
