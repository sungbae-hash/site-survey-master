import React, { useState } from 'react';
import { SurveyField, SurveyCategory } from '../types';

interface SurveyFormProps {
  config: SurveyField[];
  data: Record<string, any>;
  onChange: (id: string, value: any) => void;
  enabledFields: Set<string>;
  onToggleField: (id: string) => void;
}

const CATEGORY_TITLES: Record<SurveyCategory, string> = {
  basic: '📝 기본 정보',
  antenna: '📡 공중선 설비',
  safety: '🦺 안전 관리',
  access: '🚧 출입 및 환경',
};

const CATEGORY_ORDER: SurveyCategory[] = ['basic', 'antenna', 'safety', 'access'];

const SurveyForm: React.FC<SurveyFormProps> = ({ config, data, onChange, enabledFields, onToggleField }) => {
  const [expandedSections, setExpandedSections] = useState<Set<SurveyCategory>>(new Set());

  const toggleSection = (category: SurveyCategory) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  // 카테고리별 필드 그룹화
  const fieldsByCategory = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = config.filter((f) => f.category === cat);
    return acc;
  }, {} as Record<SurveyCategory, SurveyField[]>);

  const renderInput = (field: SurveyField, index?: number) => {
    const fieldId = index !== undefined ? `${field.id}_${index}` : field.id;
    const isConditionMet = field.condition ? field.condition(data) : true;
    if (!isConditionMet) return null;

    const isEnabled = enabledFields.has(field.id);
    const isDisabled = !isEnabled;

    const towerType = data['towerType'] || '폴';
    const displayLabel = index !== undefined
      ? `${towerType} ${index + 1}호기 ${field.label.split('. ')[1]}`
      : field.label;

    return (
      <div
        key={fieldId}
        id={`field-${field.id}`}
        className={`bg-white p-3 rounded-lg shadow-sm border transition-all duration-200 scroll-mt-28 ${
          isDisabled ? 'border-gray-100 opacity-50' : 'border-gray-100 hover:shadow-md'
        }`}
      >
        <div className="flex items-start justify-between mb-1.5 gap-2">
          <label className={`block text-xs font-bold leading-snug ${isDisabled ? 'text-gray-400' : 'text-gray-800'}`}>
            {displayLabel}
          </label>
          {index === undefined && (
            <button
              type="button"
              onClick={() => onToggleField(field.id)}
              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                isEnabled ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-transparent'
              }`}
              title={isEnabled ? '항목 제외' : '항목 포함'}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
              </svg>
            </button>
          )}
        </div>

        {field.type === 'select' && (
          <select
            disabled={isDisabled}
            value={isDisabled ? '' : (data[fieldId] || '')}
            onChange={(e) => onChange(fieldId, e.target.value)}
            className={`block w-full rounded border shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-sm appearance-none transition-colors outline-none
              ${isDisabled ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-900 border-gray-300'}`}
            style={{
              backgroundImage: isDisabled ? 'none' : 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
              backgroundPosition: 'right 0.6rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.2em 1.2em'
            }}
          >
            <option value="">{isDisabled ? '미선택 항목' : '선택하세요'}</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}

        {field.type === 'text' && (
          <input
            type="text"
            disabled={isDisabled}
            value={isDisabled ? '' : (data[fieldId] || '')}
            onChange={(e) => onChange(fieldId, e.target.value)}
            placeholder={field.placeholder}
            className={`block w-full rounded border shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-sm transition-colors outline-none
              ${isDisabled ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed placeholder-gray-300' : 'bg-white text-gray-900 border-gray-300 placeholder-gray-400'}`}
          />
        )}

        {field.type === 'textarea' && (
          <div className="relative">
            <textarea
              disabled={isDisabled}
              value={isDisabled ? '' : (data[fieldId] || '')}
              onChange={(e) => onChange(fieldId, e.target.value)}
              placeholder={field.placeholder}
              rows={2}
              maxLength={100}
              className={`block w-full rounded border shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-sm transition-colors outline-none resize-none
                ${isDisabled ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed placeholder-gray-300' : 'bg-white text-gray-900 border-gray-300 placeholder-gray-400'}`}
            />
            {!isDisabled && (
              <div className="absolute bottom-1 right-2 text-xs text-gray-400 pointer-events-none">
                {(data[fieldId] || '').length}/100
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {CATEGORY_ORDER.map((category) => {
        const fields = fieldsByCategory[category];
        if (!fields || fields.length === 0) return null;

        const isExpanded = expandedSections.has(category);

        // 활성화된(조건 충족) 필드 수 계산
        const visibleCount = fields.filter(
          (f) => !f.condition || f.condition(data)
        ).length;

        // 입력된 필드 수
        const filledCount = fields.filter((f) => {
          if (f.condition && !f.condition(data)) return false;
          if (f.repeatBy && data[f.repeatBy]) {
            const count = parseInt(data[f.repeatBy]) || 0;
            return Array.from({ length: count }).some((_, i) => data[`${f.id}_${i}`]);
          }
          return !!data[f.id];
        }).length;

        return (
          <div key={category} id={`section-${category}`} className="rounded-xl overflow-hidden border border-gray-200 shadow-sm scroll-mt-36">
            {/* 섹션 헤더 */}
            <button
              type="button"
              onClick={() => toggleSection(category)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 text-white active:bg-slate-700 transition-colors"
            >
              <span className="text-sm font-black tracking-tight">{CATEGORY_TITLES[category]}</span>
              <div className="flex items-center gap-2">
                {filledCount > 0 && (
                  <span className="text-[10px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full">
                    {filledCount}/{visibleCount}
                  </span>
                )}
                {filledCount === 0 && (
                  <span className="text-[10px] font-bold text-slate-400">{visibleCount}개 항목</span>
                )}
                <svg
                  className={`w-4 h-4 text-slate-300 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* 섹션 내용 */}
            {isExpanded && (
              <div className="bg-gray-50 p-2 space-y-2">
                {fields.map((field) => {
                  if (field.repeatBy && data[field.repeatBy]) {
                    const count = parseInt(data[field.repeatBy]) || 0;
                    if (count > 0 && (!field.condition || field.condition(data))) {
                      return Array.from({ length: count }).map((_, i) => renderInput(field, i));
                    }
                    return null;
                  }
                  return renderInput(field);
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SurveyForm;
