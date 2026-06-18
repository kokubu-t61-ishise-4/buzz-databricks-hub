export default function DatabricksCard({ item, lang, onClick }) {
  const getTypeBadgeClass = (type) => {
    const map = {
      'Release': 'badge-release',
      'Feature': 'badge-feature',
      'Community': 'badge-community',
      'Qiita': 'badge-qiita'
    };
    return map[type] || 'badge-feature';
  };

  return (
    <div className="card" onClick={onClick}>
      <div className="card-header">
        <span className={`badge ${getTypeBadgeClass(item.type)}`}>
          {item.type}
        </span>
        {item.isNew && <span className="new-dot" title="New" />}
      </div>
      <div className="card-title">
        {lang === 'ja' ? item.titleJa : item.titleEn}
      </div>
      <p className="card-summary">
        {lang === 'ja' ? item.summaryJa : item.summaryEn}
      </p>
      {item.date && <div className="card-date">{item.date}</div>}
    </div>
  );
}
