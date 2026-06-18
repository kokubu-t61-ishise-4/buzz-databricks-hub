'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DetailPanel from '../../components/DetailPanel';
import FilterBar from '../../components/FilterBar';
import '../../styles/globals.css';

const CATEGORIES = [
  { value: 'all', label: 'すべて' },
  { value: 'Pipeline', label: 'パイプライン' },
  { value: 'Warehouse', label: 'ウェアハウス' },
  { value: 'Orchestration', label: 'オーケストレーション' },
  { value: 'Qiita', label: 'Qiita' }
];

const TYPE_STYLES = {
  Pipeline: { background: '#d1fae5', color: '#065f46' },
  Warehouse: { background: '#e0f2fe', color: '#0369a1' },
  Orchestration: { background: '#fae8ff', color: '#86198f' },
  Qiita: { background: '#f0faf0', color: '#40a000' }
};

function DataEngCard({ item, lang, onClick }) {
  const style = TYPE_STYLES[item.type] || TYPE_STYLES.Pipeline;

  return (
    <div className="card" onClick={onClick}>
      <div className="card-header">
        <span
          className="badge"
          style={{ background: style.background, color: style.color }}
        >
          {item.type}
        </span>
        {item.isNew && <span className="new-dot" style={{ background: '#10b981' }} />}
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

export default function DataEngPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('all');
  const [lang, setLang] = useState('ja');
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/data-eng');
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = category === 'all'
    ? items
    : items.filter(item => item.type === category);

  return (
    <div className="container">
      <header className="header">
        <h1>📊 データエンジニアリング Hub</h1>
        <div className="header-actions">
          <Link href="/" className="back-link">← ホームに戻る</Link>
          <button
            className="refresh-btn"
            onClick={fetchData}
            disabled={loading}
            style={{ background: '#10b981' }}
          >
            {loading ? '読み込み中...' : '再取得'}
          </button>
        </div>
      </header>

      <p style={{ color: '#6e6e73', marginBottom: '1.5rem' }}>
        データパイプライン・ウェアハウス・オーケストレーションの最新情報。Qiita記事も必ず収録
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
          エラーが発生しました: {error}
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
            <DataEngCard
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
        type="data-eng"
        borderColor="#10b981"
      />
    </div>
  );
}
