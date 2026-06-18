export default function BuzzCard({ item, lang, onClick }) {
  const getCategoryBadgeClass = (category) => {
    const map = {
      'AI/ML': 'badge-ai',
      'Infrastructure': 'badge-infra',
      'Data': 'badge-data',
      'Security': 'badge-security'
    };
    return map[category] || 'badge-ai';
  };

  const getRegionLabel = (region) => {
    if (lang === 'ja') {
      const map = { overseas: '海外', japan: '日本', both: '海外・日本' };
      return map[region] || region;
    }
    return region;
  };

  return (
    <div className="card" onClick={onClick}>
      <div className="card-header">
        <span className={`badge ${getCategoryBadgeClass(item.category)}`}>
          {item.category}
        </span>
        <div className="heat-dots">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={`heat-dot ${n <= item.heat ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>
      <div className="card-title">{item.termEn}</div>
      <div className="card-subtitle">{item.termJa}</div>
      <span className="region-badge">{getRegionLabel(item.region)}</span>
      <p className="card-summary" style={{ marginTop: '0.75rem' }}>
        {lang === 'ja' ? item.summaryJa : item.summaryEn}
      </p>
    </div>
  );
}
