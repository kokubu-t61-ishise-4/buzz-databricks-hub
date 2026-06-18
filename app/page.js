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
          <Link href="/databricks" className="home-btn databricks">
            Open Databricks Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
