export default function FilterBar({
  categories,
  activeCategory,
  onCategoryChange,
  lang,
  onLangChange
}) {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        {categories.map((cat) => (
          <button
            key={cat.value}
            className={`filter-btn ${activeCategory === cat.value ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="lang-toggle">
        <button
          className={`lang-btn ${lang === 'ja' ? 'active' : ''}`}
          onClick={() => onLangChange('ja')}
        >
          日本語
        </button>
        <button
          className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
          onClick={() => onLangChange('en')}
        >
          English
        </button>
      </div>
    </div>
  );
}
