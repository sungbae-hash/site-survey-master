import React from 'react';
import { SurveyField, SurveyCategory } from '../types';

interface SurveyFormProps {
  config: SurveyField[];
  data: Record<string, any>;
  onChange: (id: string, value: any) => void;
}

const CATEGORY_TITLES: Record<SurveyCategory, string> = {
  basic: '📝 기본 정보',
  antenna: '📡 공중선 설비',
  safety: '🦺 안전 관리',
  access: '🚧 출입 및 환경',
};

const SurveyForm: React.FC<SurveyFormProps> = ({ config, data, onChange }) => {
  let lastCategory: SurveyCategory | null = null;

  const renderInput = (field: SurveyField, index?: number) => {
    const fieldId = index !== undefined ? `${field.id}_${index}` : field.id;
    const isActive = field.condition ? field.condition(data) : true;

    // 조건 미충족 시 아예 숨김 처리 (사용자 요청: "목록이 너무 길어")
    if (!isActive) return null;

    const isDisabled = false; // 더 이상 비활성화 상태 사용 안함 (숨김 처리됨)

    // 호기별 라벨 생성 (예: 원폴 1호기 지선 수)
    const towerType = data['towerType'] || '폴';
    const displayLabel = index !== undefined
      ? `${towerType} ${index + 1}호기 ${field.label.split('. ')[1]}`
      : field.label;

    return (
      <div
        key={fieldId}
        id={`field-${field.id}`} // 네비게이션을 위한 ID
        className={`bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 scroll-mt-28 ${isDisabled ? 'bg-gray-50 opacity-80' : 'hover:shadow-md'}`}
      >
        <label className={`block text-base font-bold mb-3 ${isDisabled ? 'text-gray-400' : 'text-gray-800'}`}>
          {displayLabel}
        </label>

        {isDisabled && field.prerequisite && (
          <div className="mb-3 px-3 py-2 bg-orange-50 border border-orange-100 rounded-lg text-xs font-bold text-orange-600 flex items-start gap-1.5">
            <span className="text-sm">⚠️</span>
            <span>{field.prerequisite}</span>
          </div>
        )}

        {field.type === 'select' && (
          <div className="relative">
            <select
              disabled={isDisabled}
              value={isDisabled ? '' : (data[fieldId] || '')}
              onChange={(e) => onChange(fieldId, e.target.value)}
              className={`block w-full rounded-lg border shadow-sm focus:border-blue-500 focus:ring-blue-500 py-4 px-4 text-lg appearance-none transition-colors outline-none
                ${isDisabled
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-900 border-gray-300'
                }`}
              style={{
                backgroundImage: isDisabled ? 'none' : 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
                backgroundPosition: 'right 1rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="" className="text-gray-400">
                {isDisabled ? '선행 조건 미충족' : '선택하세요'}
              </option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {field.type === 'text' && (
          <div className="relative">
            <input
              type="text"
              disabled={isDisabled}
              value={isDisabled ? '' : (data[fieldId] || '')}
              onChange={(e) => onChange(fieldId, e.target.value)}
              placeholder={field.placeholder}
              className={`block w-full rounded-lg border shadow-sm focus:border-blue-500 focus:ring-blue-500 py-4 px-4 text-lg transition-colors outline-none
                ${isDisabled
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed placeholder-gray-300'
                  : 'bg-white text-gray-900 border-gray-300 placeholder-gray-400'
                }`}
            />
          </div>
        )}

        {field.type === 'textarea' && (
          <div className="relative">
            <textarea
              disabled={isDisabled}
              value={isDisabled ? '' : (data[fieldId] || '')}
              onChange={(e) => onChange(fieldId, e.target.value)}
              placeholder={field.placeholder}
              rows={3}
              maxLength={100}
              className={`block w-full rounded-lg border shadow-sm focus:border-blue-500 focus:ring-blue-500 py-4 px-4 text-lg transition-colors outline-none resize-none
                ${isDisabled
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed placeholder-gray-300'
                  : 'bg-white text-gray-900 border-gray-300 placeholder-gray-400'
                }`}
            />
            {field.type === 'textarea' && !isDisabled && (
              <div className="absolute bottom-2 right-3 text-xs text-gray-400 pointer-events-none">
                {(data[fieldId] || '').length}/100
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {config.map((field) => {
        const elements = [];

        // 새로운 카테고리가 시작되면 헤더 추가
        if (field.category !== lastCategory) {
          elements.push(
            <div key={`header-${field.category}`} id={`section-${field.category}`} className="pt-6 pb-2 first:pt-2 scroll-mt-36">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 border-b-2 border-slate-900 pb-2">
                {CATEGORY_TITLES[field.category]}
              </h3>
            </div>
          );
          lastCategory = field.category;
        }

        // 항목 렌더링
        if (field.repeatBy && data[field.repeatBy]) {
          const count = parseInt(data[field.repeatBy]) || 0;
          if (count > 0 && (!field.condition || field.condition(data))) {
            elements.push(...Array.from({ length: count }).map((_, i) => renderInput(field, i)));
          }
        } else {
          elements.push(renderInput(field));
        }

        return elements;
      })}
    </div>
  );
};

export default SurveyForm;