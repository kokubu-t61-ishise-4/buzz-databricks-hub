'use client';

import { useState } from 'react';

export default function DetailPanel({ item, lang, onClose, type, borderColor }) {
  const [showOriginalDef, setShowOriginalDef] = useState(false);
  const [showOriginalBg, setShowOriginalBg] = useState(false);
  const [showOriginalDesc, setShowOriginalDesc] = useState(false);
  const [showOriginalImpact, setShowOriginalImpact] = useState(false);

  if (!item) return null;

  const isBuzzRadar = type === 'buzzradar';
  const isHubType = ['databricks', 'ai-hub', 'ai-dev', 'data-eng'].includes(type);

  const getBorderColor = () => {
    if (borderColor) return borderColor;
    const colors = {
      databricks: '#FF3621',
      'ai-hub': '#6366f1',
      'ai-dev': '#f59e0b',
      'data-eng': '#10b981'
    };
    return colors[type] || '#0071e3';
  };

  return (
    <>
      <div className={`overlay ${item ? 'visible' : ''}`} onClick={onClose} />
      <div
        className={`detail-panel ${item ? 'open' : ''}`}
        style={isHubType ? { borderLeft: `4px solid ${getBorderColor()}` } : {}}
      >
        <button className="detail-close" onClick={onClose}>&times;</button>

        {isBuzzRadar && (
          <>
            <h2 className="detail-title">{item.termEn}</h2>
            <p className="detail-subtitle">{item.termJa}</p>

            <div className="detail-section">
              <h3 className="detail-section-title">
                {lang === 'ja' ? '概要' : 'Definition'}
              </h3>
              <p className="detail-section-content">
                {lang === 'ja'
                  ? (showOriginalDef ? item.definitionEn : item.definitionJa)
                  : (showOriginalDef ? item.definitionJa : item.definitionEn)}
              </p>
              <button
                className="toggle-original"
                onClick={() => setShowOriginalDef(!showOriginalDef)}
              >
                {showOriginalDef
                  ? (lang === 'ja' ? '日本語に戻す' : 'Back to English')
                  : (lang === 'ja' ? '原文を表示' : 'Show Japanese')}
              </button>
            </div>

            <div className="detail-section">
              <h3 className="detail-section-title">
                {lang === 'ja' ? '登場背景' : 'Background'}
              </h3>
              <p className="detail-section-content">
                {lang === 'ja'
                  ? (showOriginalBg ? item.backgroundEn : item.backgroundJa)
                  : (showOriginalBg ? item.backgroundJa : item.backgroundEn)}
              </p>
              <button
                className="toggle-original"
                onClick={() => setShowOriginalBg(!showOriginalBg)}
              >
                {showOriginalBg
                  ? (lang === 'ja' ? '日本語に戻す' : 'Back to English')
                  : (lang === 'ja' ? '原文を表示' : 'Show Japanese')}
              </button>
            </div>

            <div className="detail-section">
              <h3 className="detail-section-title">
                {lang === 'ja' ? '関連記事' : 'Related Articles'}
              </h3>
              <ul className="article-list">
                {item.articles?.map((article, idx) => (
                  <li key={idx} className="article-item">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="article-link"
                    >
                      {lang === 'ja' ? article.titleJa : article.titleEn}
                    </a>
                    <div className="article-source">{article.source}</div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {isHubType && (
          <>
            <h2 className="detail-title">
              {lang === 'ja' ? item.titleJa : item.titleEn}
            </h2>
            <p className="detail-subtitle">
              {item.type} {item.date && `- ${item.date}`}
            </p>

            <div className="detail-section">
              <h3 className="detail-section-title">
                {lang === 'ja' ? '概要' : 'Description'}
              </h3>
              <p className="detail-section-content">
                {lang === 'ja'
                  ? (showOriginalDesc ? item.descEn : item.descJa)
                  : (showOriginalDesc ? item.descJa : item.descEn)}
              </p>
              <button
                className="toggle-original"
                onClick={() => setShowOriginalDesc(!showOriginalDesc)}
              >
                {showOriginalDesc
                  ? (lang === 'ja' ? '日本語に戻す' : 'Back to English')
                  : (lang === 'ja' ? '原文を表示' : 'Show Japanese')}
              </button>
            </div>

            <div className="detail-section">
              <h3 className="detail-section-title">
                {lang === 'ja' ? 'エンジニアへの影響' : 'Impact for Engineers'}
              </h3>
              <p className="detail-section-content">
                {lang === 'ja'
                  ? (showOriginalImpact ? item.impactEn : item.impactJa)
                  : (showOriginalImpact ? item.impactJa : item.impactEn)}
              </p>
              <button
                className="toggle-original"
                onClick={() => setShowOriginalImpact(!showOriginalImpact)}
              >
                {showOriginalImpact
                  ? (lang === 'ja' ? '日本語に戻す' : 'Back to English')
                  : (lang === 'ja' ? '原文を表示' : 'Show Japanese')}
              </button>
            </div>

            <div className="detail-section">
              <h3 className="detail-section-title">
                {lang === 'ja' ? '関連リンク' : 'Related Links'}
              </h3>
              <ul className="article-list">
                {item.links?.map((link, idx) => (
                  <li key={idx} className="article-item">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`article-link ${link.source === 'Qiita' ? 'qiita' : ''}`}
                    >
                      {lang === 'ja' ? link.titleJa : link.titleEn}
                    </a>
                    <div className="article-source">{link.source}</div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </>
  );
}
