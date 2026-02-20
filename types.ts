export type FieldType = 'select' | 'radio' | 'checkbox' | 'text' | 'textarea';
export type SurveyMode = 'baseStation' | 'repeater';
export type SurveyCategory = 'basic' | 'antenna' | 'safety' | 'access';

export interface SurveyOption {
  label: string;
  value: string;
}

export interface SurveyField {
  id: string;
  label: string;
  type: FieldType;
  category: SurveyCategory; // 카테고리 추가
  options?: SurveyOption[];
  placeholder?: string;
  required?: boolean;
  condition?: (formData: Record<string, any>) => boolean;
  prerequisite?: string; // 선행 조건에 대한 설명 텍스트
  mode?: SurveyMode[];
  repeatBy?: string; // 수량(ID)을 참조하여 항목을 반복 생성할 때 사용
}

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
  roadAddress: string;
  elevation?: number;
  buildingName?: string;
  floorCount?: string;
}

export interface KakaoMapMouseEvent {
  latLng: {
    getLat: () => number;
    getLng: () => number;
  };
}

declare global {
  interface Window {
    kakao: any;
  }
}