'use client';

import { useState } from 'react';
import Link from 'next/link';
import BuzzCard from '../../components/BuzzCard';
import DetailPanel from '../../components/DetailPanel';
import FilterBar from '../../components/FilterBar';
import { useCachedFetch } from '../../hooks/useCachedFetch';
import '../../styles/globals.css';

const CATEGORIES = [
  { value: 'all', label: 'すべて' },
  { value: 'AI/ML', label: 'AI・ML' },
  { value: 'Infrastructure', label: 'インフラ' },
  { value: 'Data', label: 'データ' },
  { value: 'Security', label: 'セキュリティ' }
];

export default function BuzzRadarPage() {
  const { items, loading, error, refresh } = useCachedFetch('/api/buzzradar', 'buzzradar-cache');
  const [category, setCategory] = useState('all');
  const [lang, setLang] = useState('ja');
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems = category === 'all'
    ? items
    : items.filter(item => item.category === category);

  return (
    <div className="container">
      <header className="header">
        <h1>🔥 BuzzRadar</h1>
        <div className="header-actions">
          <Link href="/" className="back-link">← ホームに戻る</Link>
          <button
            className="refresh-btn"
            onClick={refresh}
            disabled={loading}
          >
            {loading ? '読み込み中...' : '再取得'}
          </button>
        </div>
      </header>

      <FilterBar
        categories={CATEGORIES}
        activeCategory={category}
        onCategoryChange={setCategory}
        lang={lang}
        onLangChange={setLang}
      />

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {loading ? (
        <div className="skeleton-grid">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="skeleton-card">
              <div className="skeleton-line short"></div>
              <div className="skeleton-line medium"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-grid">
          {filteredItems.map((item, idx) => (
            <BuzzCard
              key={idx}
              item={item}
              lang={lang}
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>
      )}

      <DetailPanel
        item={selectedItem}
        lang={lang}
        onClose={() => setSelectedItem(null)}
        type="buzzradar"
      />
    </div>
  );
}
