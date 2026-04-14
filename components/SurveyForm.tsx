import React from 'react';
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

const SurveyForm: React.FC<SurveyFormProps> = ({ config, data, onChange, enabledFields, onToggleField }) => {
  let lastCategory: SurveyCategory | null = null;

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
          isDisabled
            ? 'border-gray-100 opacity-50'
            : 'border-gray-100 hover:shadow-md'
        }`}
      >
        <div className="flex items-start justify-between mb-1.5 gap-2">
          <label className={`block text-xs font-bold leading-snug ${isDisabled ? 'text-gray-400' : 'text-gray-800'}`}>
            {displayLabel}
          </label>
          {/* 항목 선택 토글 (repeatBy가 없는 원본 항목에만 표시) */}
          {index === undefined && (
            <button
              type="button"
              onClick={() => onToggleField(field.id)}
              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                isEnabled
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-300 text-transparent'
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
          <div className="relative">
            <select
              disabled={isDisabled}
              value={isDisabled ? '' : (data[fieldId] || '')}
              onChange={(e) => onChange(fieldId, e.target.value)}
              className={`block w-full rounded border shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-sm appearance-none transition-colors outline-none
                ${isDisabled
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-900 border-gray-300'
                }`}
              style={{
                backgroundImage: isDisabled ? 'none' : 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
                backgroundPosition: 'right 0.6rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.2em 1.2em'
              }}
            >
              <option value="" className="text-gray-400">
                {isDisabled ? '미선택 항목' : '선택하세요'}
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
              className={`block w-full rounded border shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-sm transition-colors outline-none
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
              rows={2}
              maxLength={100}
              className={`block w-full rounded border shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-sm transition-colors outline-none resize-none
                ${isDisabled
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed placeholder-gray-300'
                  : 'bg-white text-gray-900 border-gray-300 placeholder-gray-400'
                }`}
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
      {config.map((field) => {
        const elements: React.ReactNode[] = [];

        if (field.category !== lastCategory) {
          elements.push(
            <div key={`header-${field.category}`} id={`section-${field.category}`} className="pt-3 pb-1 first:pt-1 scroll-mt-36">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b-2 border-slate-900 pb-1">
                {CATEGORY_TITLES[field.category]}
              </h3>
            </div>
          );
          lastCategory = field.category;
        }

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
