import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const GRADES = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const STANDARDS_TYPES = [
  'ccss-ela',
  'ccss-math',
  'ngss',
  'hss',
  'vapa',
  'pe',
  'cte',
];

export default function ClassForm({ initialValues, onSave, onCancel, isEdit }) {
  const { t } = useTranslation();

  const [nickname, setNickname] = useState(initialValues?.nickname || '');
  const [gradeLevel, setGradeLevel] = useState(initialValues?.grade_level || 'K');
  const [subject, setSubject] = useState(initialValues?.subject || '');
  const [standardsType, setStandardsType] = useState(initialValues?.standards_type || 'ccss-ela');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave({ nickname, grade_level: gradeLevel, subject, standards_type: standardsType });
    } catch (err) {
      setError(err.userMessage || t('errors.generic'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        {isEdit ? t('classes.edit_title') : t('classes.add_title')}
      </h2>

      {error && (
        <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-sm text-danger-700">
          {error}
        </div>
      )}

      <div>
        <label className="label">{t('classes.nickname')}</label>
        <input
          type="text"
          required
          maxLength={100}
          className="input"
          placeholder={t('classes.nickname_placeholder')}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">{t('classes.grade_level')}</label>
          <select
            className="input"
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
          >
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {t(`grades.${g}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">{t('classes.standards_type')}</label>
          <select
            className="input"
            value={standardsType}
            onChange={(e) => setStandardsType(e.target.value)}
          >
            {STANDARDS_TYPES.map((s) => (
              <option key={s} value={s}>
                {t(`classes.standards_types.${s}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">{t('classes.subject')}</label>
        <input
          type="text"
          required
          maxLength={255}
          className="input"
          placeholder={t('classes.subject_placeholder')}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? t('classes.saving') : t('classes.save')}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          {t('classes.cancel')}
        </button>
      </div>
    </form>
  );
}
