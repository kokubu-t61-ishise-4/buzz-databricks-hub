'use client';

import { useState } from 'react';
import Link from 'next/link';
import DetailPanel from '../../components/DetailPanel';
import FilterBar from '../../components/FilterBar';
import { useCachedFetch } from '../../hooks/useCachedFetch';
import '../../styles/globals.css';

const CATEGORIES = [
  { value: 'all', label: 'すべて' },
  { value: 'IDE', label: 'IDE' },
  { value: 'Prompt', label: 'プロンプト' },
  { value: 'Agent', label: 'エージェント' },
  { value: 'Qiita', label: 'Qiita' }
];

const TYPE_STYLES = {
  IDE: { background: '#fef3c7', color: '#92400e' },
  Prompt: { background: '#ffe4e6', color: '#9f1239' },
  Agent: { background: '#e0f2fe', color: '#0369a1' },
  Qiita: { background: '#f0faf0', color: '#40a000' }
};

function AIDevCard({ item, lang, onClick }) {
  const style = TYPE_STYLES[item.type] || TYPE_STYLES.IDE;

  return (
    <div className="card" onClick={onClick}>
      <div className="card-header">
        <span
          className="badge"
          style={{ background: style.background, color: style.color }}
        >
          {item.type}
        </span>
        {item.isNew && <span className="new-dot" style={{ background: '#f59e0b' }} />}
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

export default function AIDevPage() {
  const { items, loading, error, refresh } = useCachedFetch('/api/ai-dev', 'ai-dev-cache');
  const [category, setCategory] = useState('all');
  const [lang, setLang] = useState('ja');
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems = category === 'all'
    ? items
    : items.filter(item => item.type === category);

  return (
    <div className="container">
      <header className="header">
        <h1>🚀 AI駆動開発 Hub</h1>
        <div className="header-actions">
          <Link href="/" className="back-link">← ホームに戻る</Link>
          <button
            className="refresh-btn"
            onClick={refresh}
            disabled={loading}
            style={{ background: '#f59e0b' }}
          >
            {loading ? '読み込み中...' : '再取得'}
          </button>
        </div>
      </header>

      <p style={{ color: '#6e6e73', marginBottom: '1.5rem' }}>
        AI駆動開発・Vibe Coding・プロンプトエンジニアリングの最新情報
      </p>

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
            <AIDevCard
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
        type="ai-dev"
        borderColor="#f59e0b"
      />
    </div>
  );
}
