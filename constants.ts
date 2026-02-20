import { SurveyField, SurveyOption } from './types';

const generateCountOptions = (start = 0, end = 10): SurveyOption[] => {
  return Array.from({ length: end - start + 1 }, (_, i) => ({
    label: `${start + i}`,
    value: `${start + i}`
  }));
};

const STEP_SUB_OPTIONS: SurveyOption[] = [
  { label: '발판상부', value: '발판상부' },
  { label: '발판상부(자리없음)', value: '발판상부(자리없음)' },
  { label: '발판 2단', value: '발판 2단' },
  { label: '발판하부', value: '발판하부' },
  { label: '발판없음', value: '발판없음' },
];

export const SURVEY_CONFIG: SurveyField[] = [
  // --- [기본 정보] Group (1~8) ---
  {
    id: 'siteType',
    label: '1. 국사형태',
    type: 'select',
    category: 'basic',
    options: [
      { label: '나대지', value: '나대지' },
      { label: '건물', value: '건물' },
      { label: '터널/지하철', value: '터널/지하철' },
      { label: '컨테이너', value: '컨테이너' },
      { label: '교각', value: '교각' },
      { label: '지하철', value: '지하철' },
      { label: '트레일러', value: '트레일러' },
      { label: '기타', value: '기타' },
    ],
  },
  {
    id: 'equipLoc',
    label: '2. 장비설치위치',
    type: 'select',
    category: 'basic',
    options: [
      { label: '실내-지상', value: '실내-지상' },
      { label: '실내-지하', value: '실내-지하' },
      { label: '실외-옥상', value: '실외-옥상' },
      { label: '실외-옥탑', value: '실외-옥탑' },
      { label: '실외-구축물', value: '실외-구축물' },
    ],
  },
  {
    id: 'installFloor',
    label: '3. 설치층',
    type: 'text',
    category: 'basic',
    placeholder: '예: 1층, B1층, 옥상'
  },
  {
    id: 'qty_dist_box',
    label: '4. 분전함 (개수)',
    type: 'select',
    category: 'basic',
    options: generateCountOptions(),
  },
  {
    id: 'qty_cabinet_a',
    label: '5. 부가함체 A망 (개수)',
    type: 'select',
    category: 'basic',
    options: generateCountOptions(),
  },
  {
    id: 'qty_cabinet_trans',
    label: '6. 부가함체 전송망 (개수)',
    type: 'select',
    category: 'basic',
    options: generateCountOptions(),
  },
  {
    id: 'qty_cabinet_batt',
    label: '7. 부가함체 축전지 (개수)',
    type: 'select',
    category: 'basic',
    options: generateCountOptions(),
  },
  {
    id: 'qty_cabinet_mixed',
    label: '8. 부가함체 A망+전송망 (개수)',
    type: 'select',
    category: 'basic',
    options: generateCountOptions(),
  },

  // --- [공중선] Group (9~13) ---
  {
    id: 'towerType',
    label: '9. 철탑유형',
    type: 'select',
    category: 'antenna',
    options: [
      { label: '철탑', value: '철탑' },
      { label: '옥상철탑', value: '옥상철탑' },
      { label: '강관주', value: '강관주' },
      { label: '전주', value: '전주' },
      { label: 'IP주', value: 'IP주' },
      { label: '벽부폴', value: '벽부폴' },
      { label: '원폴', value: '원폴' },
      { label: '분산폴', value: '분산폴' },
      { label: '프레임', value: '프레임' },
    ],
  },
  {
    id: 'towerQty',
    label: '10. 설치 수량',
    type: 'select',
    category: 'antenna',
    options: generateCountOptions(1, 10),
  },
  {
    id: 'guyWireCount',
    label: '11. 지선 수',
    type: 'select',
    category: 'antenna',
    options: [
      { label: '1', value: '1' },
      { label: '2', value: '2' },
      { label: '3', value: '3' },
      { label: '미설치', value: '미설치' },
    ],
  },
  {
    id: 'screening',
    label: '12. 가림막',
    type: 'select',
    category: 'antenna',
    options: [
      { label: '가림막 있음', value: '가림막 있음' },
      { label: '가림막 없음', value: '가림막 없음' },
      { label: '개별안테나 환경친화형', value: '개별안테나 환경친화형' },
    ],
  },
  {
    id: 'antLoc',
    label: '13. 안테나설치위치',
    type: 'select',
    category: 'antenna',
    options: [
      { label: '옥상', value: '옥상' },
      { label: '옥탑', value: '옥탑' },
    ],
  },

  // --- [안전 관리] Group (14~15) ---
  {
    id: 'step_status',
    label: '14. 발판 상태',
    type: 'select',
    category: 'safety',
    options: [
      { label: '있음 (세부항목 입력)', value: '있음' },
      { label: '없음 (높이/사다리 입력)', value: '없음' },
    ],
  },
  // 14-1 ~ 14-14 (발판 있음 경우)
  {
    id: 'step_b3',
    label: '14-1. B3 발판',
    type: 'select',
    category: 'safety',
    options: STEP_SUB_OPTIONS,
    condition: (data) => data.step_status === '있음',
  },
  {
    id: 'step_b5',
    label: '14-2. B5 발판',
    type: 'select',
    category: 'safety',
    options: STEP_SUB_OPTIONS,
    condition: (data) => data.step_status === '있음',
  },
  {
    id: 'step_b7',
    label: '14-3. B7 발판',
    type: 'select',
    category: 'safety',
    options: STEP_SUB_OPTIONS,
    condition: (data) => data.step_status === '있음',
  },
  {
    id: 'step_b1',
    label: '14-4. B1 발판',
    type: 'select',
    category: 'safety',
    options: STEP_SUB_OPTIONS,
    condition: (data) => data.step_status === '있음',
  },
  {
    id: 'step_mc',
    label: '14-5. MC 발판',
    type: 'select',
    category: 'safety',
    options: STEP_SUB_OPTIONS,
    condition: (data) => data.step_status === '있음',
  },
  {
    id: 'step_mibos',
    label: '14-6. MIBOS 발판',
    type: 'select',
    category: 'safety',
    options: STEP_SUB_OPTIONS,
    condition: (data) => data.step_status === '있음',
  },
  {
    id: 'step_rect1',
    label: '14-7. LTE정류기#1',
    type: 'select',
    category: 'safety',
    options: STEP_SUB_OPTIONS,
    condition: (data) => data.step_status === '있음',
  },
  {
    id: 'step_rect2',
    label: '14-8. LTE정류기#2',
    type: 'select',
    category: 'safety',
    options: STEP_SUB_OPTIONS,
    condition: (data) => data.step_status === '있음',
  },
  {
    id: 'step_5g_rect',
    label: '14-9. 5G정류기',
    type: 'select',
    category: 'safety',
    options: STEP_SUB_OPTIONS,
    condition: (data) => data.step_status === '있음',
  },
  {
    id: 'step_5g_mux',
    label: '14-10. 5G MUX',
    type: 'select',
    category: 'safety',
    options: STEP_SUB_OPTIONS,
    condition: (data) => data.step_status === '있음',
  },
  {
    id: 'step_dist1',
    label: '14-11. 분전함#1',
    type: 'select',
    category: 'safety',
    options: STEP_SUB_OPTIONS,
    condition: (data) => data.step_status === '있음',
  },
  {
    id: 'step_dist2',
    label: '14-12. 분전함#2',
    type: 'select',
    category: 'safety',
    options: STEP_SUB_OPTIONS,
    condition: (data) => data.step_status === '있음',
  },
  {
    id: 'step_ojc1',
    label: '14-13. OJC#1',
    type: 'select',
    category: 'safety',
    options: STEP_SUB_OPTIONS,
    condition: (data) => data.step_status === '있음',
  },
  {
    id: 'step_ojc2',
    label: '14-14. OJC#2',
    type: 'select',
    category: 'safety',
    options: STEP_SUB_OPTIONS,
    condition: (data) => data.step_status === '있음',
  },
  // 14-15 ~ 14-16 (발판 있음 경우) - *Wait, IDK why "있음" was written in previous plan for these two. It's "없음". Fixed logic below.*
  {
    id: 'step_height',
    label: '14-15. 높이',
    type: 'select',
    category: 'safety',
    options: [
      { label: '1.5m 이상', value: '1.5m 이상' },
      { label: '1.5m 미만', value: '1.5m 미만' },
    ],
    condition: (data) => data.step_status === '없음',
  },
  {
    id: 'step_ladder_req',
    label: '14-16. 사다리 필요여부',
    type: 'radio',
    category: 'safety',
    options: [
      { label: '필요', value: '필요' },
      { label: '불필요', value: '불필요' },
    ],
    condition: (data) => data.step_status === '없음',
  },

  {
    id: 'ladder_status',
    label: '15. 사다리',
    type: 'radio',
    category: 'safety',
    options: [
      { label: '있음', value: '있음' },
      { label: '없음', value: '없음' },
    ],
  },

  // --- [출입] Group (16~19) ---
  {
    id: 'military',
    label: '16. 군부대',
    type: 'select',
    category: 'access',
    options: [
      { label: '민통선 내', value: '민통선 내' },
      { label: '민통선 군부대 내', value: '민통선 군부대 내' },
      { label: '일반 군부대 내', value: '일반 군부대 내' },
      { label: '해당 없음', value: '해당 없음' },
    ],
  },
  {
    id: 'accessRequired',
    label: '17. 상시출입 필요',
    type: 'select',
    category: 'access',
    options: [
      { label: '군부대 통보 필요', value: '군부대 통보 필요' },
      { label: '관리자 통보 필요', value: '관리자 통보 필요' },
      { label: '해당 없음', value: '해당 없음' },
    ],
  },
  {
    id: 'highAltitude',
    label: '18. 고지국소',
    type: 'select',
    category: 'access',
    options: [
      { label: '폭설 시 진입불가', value: '폭설 시 진입불가' },
      { label: '해당 없음', value: '해당 없음' },
    ],
  },
  {
    id: 'floodingRisk',
    label: '19. 침수예상',
    type: 'select',
    category: 'access',
    options: [
      { label: '침수위험(강, 하천)', value: '침수위험(강, 하천)' },
      { label: '침수위험(저수지)', value: '침수위험(저수지)' },
      { label: '침수위험(지하)', value: '침수위험(지하)' },
      { label: '해당 없음', value: '해당 없음' },
    ],
  },

  // --- [비고] ---
  {
    id: 'remarks',
    label: '비고',
    type: 'textarea',
    category: 'access',
    placeholder: '특이사항을 입력하세요 (100자 이내)',
  },
];