'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DatabricksCard from '../../components/DatabricksCard';
import DetailPanel from '../../components/DetailPanel';
import FilterBar from '../../components/FilterBar';
import '../../styles/globals.css';

const CATEGORIES = [
  { value: 'all', label: 'すべて' },
  { value: 'Release', label: 'リリース' },
  { value: 'Feature', label: '機能解説' },
  { value: 'Community', label: 'コミュニティ' },
  { value: 'Qiita', label: 'Qiita' }
];

export default function DatabricksPage() {
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
      const res = await fetch('/api/databricks');
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
        <h1>⚡ Databricks Hub</h1>
        <div className="header-actions">
          <Link href="/" className="back-link">← ホームに戻る</Link>
          <button
            className="refresh-btn"
            onClick={fetchData}
            disabled={loading}
            style={{ background: '#FF3621' }}
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
            <DatabricksCard
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
        type="databricks"
      />
    </div>
  );
}
