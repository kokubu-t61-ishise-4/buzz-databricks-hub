import Link from 'next/link';
import '../styles/globals.css';

export default function Home() {
  return (
    <div className="container">
      <div className="home-header">
        <h1>Tech Info Hub</h1>
        <p>エンジニアのための情報収集ツール</p>
      </div>

      <div className="home-grid">
        <div className="home-card">
          <div className="home-icon">📡</div>
          <h2 className="home-title">ByteFlow</h2>
          <p className="home-desc">
            IT全般のニュースを広くチェック。毎朝のニュースキャッチアップに最適。
          </p>
          <a
            href="https://huggingface.co/spaces/byteflow-user/byteflow"
            target="_blank"
            rel="noopener noreferrer"
            className="home-btn external"
          >
            Open ByteFlow
          </a>
        </div>

        <div className="home-card">
          <div className="home-icon">🔥</div>
          <h2 className="home-title">BuzzRadar</h2>
          <p className="home-desc">
            ITバズワードを用語として整理。会議・面接前の語彙確認に。
          </p>
          <Link href="/buzzradar" className="home-btn">
            Open BuzzRadar
          </Link>
        </div>

        <div className="home-card">
          <div className="home-icon">⚡</div>
          <h2 className="home-title">Databricks Hub</h2>
          <p className="home-desc">
            Databricks専門情報を深掘り。リリース情報からQiita記事まで。
          </p>
          <Link href="/databricks" className="home-btn" style={{ background: '#FF3621' }}>
            Open Databricks Hub
          </Link>
        </div>

        <div className="home-card">
          <div className="home-icon">🤖</div>
          <h2 className="home-title">AI Hub</h2>
          <p className="home-desc">
            AI・LLM・Claudeの最新情報をまとめて。海外・日本両方対応。
          </p>
          <Link href="/ai-hub" className="home-btn" style={{ background: '#6366f1' }}>
            Open AI Hub
          </Link>
        </div>

        <div className="home-card">
          <div className="home-icon">🚀</div>
          <h2 className="home-title">AI駆動開発 Hub</h2>
          <p className="home-desc">
            AI駆動開発・Vibe Coding・プロンプトエンジニアリングの最新情報。
          </p>
          <Link href="/ai-dev" className="home-btn" style={{ background: '#f59e0b' }}>
            Open AI駆動開発 Hub
          </Link>
        </div>

        <div className="home-card">
          <div className="home-icon">📊</div>
          <h2 className="home-title">データエンジニアリング Hub</h2>
          <p className="home-desc">
            データパイプライン・ウェアハウス・オーケストレーションの最新情報。
          </p>
          <Link href="/data-eng" className="home-btn" style={{ background: '#10b981' }}>
            Open データエンジニアリング Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
