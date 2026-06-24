# Tech Info Hub

## 概要
エンジニアのための情報収集ツールを集約したポータルサイトです。
複数のRSSフィードから最新記事を取得し、AIで関連性の高い記事をフィルタリング・要約・翻訳して表示します。
バズワード、Databricks、AI、AI駆動開発、データエンジニアリングの5つの専門Hubと、IT全般ニュースのByteFlowを提供しています。

## 主な機能
- **BuzzRadar**: ITバズワードを収集し、カテゴリ（AI/ML、インフラ、データ、セキュリティ）別に整理。用語の定義・背景・関連記事を表示
- **Databricks Hub**: Databricksのリリース情報・機能解説・コミュニティ情報・Qiita記事を収集。データエンジニアへの影響も解説
- **AI Hub**: AI・LLM・Claudeの最新情報をモデル・研究・ツール・Qiita記事に分類して収集
- **AI駆動開発 Hub**: Cursor・GitHub Copilot・プロンプトエンジニアリング・エージェント関連の最新動向を収集
- **データエンジニアリング Hub**: dbt・Airflow・Sparkなどパイプライン・ウェアハウス・オーケストレーション情報を収集
- **ByteFlow**: HuggingFace Spaces上のIT全般ニュースツール（外部リンク）
- **日英切替**: すべてのHubで日本語・英語表示を切り替え可能
- **カテゴリフィルタ**: 各Hubでカテゴリ別に情報を絞り込み
- **詳細パネル**: カードをクリックすると詳細情報・関連リンクを表示

## アーキテクチャ

### データ取得フロー
```
RSSフィード → rss2json API → Groq API（フィルタリング・要約・翻訳）→ フロントエンド表示
```

### Groq APIの役割
Groq API（Llama 3.3 70B）は情報の**生成**には使用せず、以下の目的のみに使用しています：
- **フィルタリング**: 取得した記事から各Hubのテーマに関連する記事を選別
- **要約**: 記事内容を簡潔にまとめる
- **翻訳**: 日本語・英語の両言語での表示用にタイトル・要約を翻訳
- **構造化**: JSON形式で整形して返却

### 各Hubの情報源

| Hub | 情報源（RSSフィード） |
|-----|----------------------|
| **AI Hub** | Qiita（LLM, AI, Claude）、Zenn（LLM）、The Decoder、HuggingFace Blog |
| **AI駆動開発 Hub** | Qiita（Cursor, GitHub Copilot, Claude Code）、Zenn（Cursor, GitHub Copilot）、GitHub Blog、VS Code Blog |
| **Databricks Hub** | Qiita（Databricks）、Zenn（Databricks）、Databricks公式、Medium（Databricks）、DevelopersIO |
| **データエンジニアリング Hub** | Qiita（dbt, Airflow, Apache Spark, DataEngineering）、Zenn（dbt, Airflow）、Medium（Data Engineering）、AWS Big Data Blog |
| **BuzzRadar** | Publickey、Hacker News、Zenn、Qiita人気記事、TechCrunch AI、gihyo.jp |

## 使い方
1. ホーム画面から利用したいHubを選択
2. カテゴリフィルタで興味のある分野を絞り込み
3. 日本語/英語ボタンで表示言語を切り替え
4. カードをクリックして詳細情報を確認
5. 「再取得」ボタンで最新情報を取得

## 技術スタック
- **フレームワーク**: Next.js 16 (React 19)
- **言語**: JavaScript
- **RSS取得**: rss2json API（CORS回避）
- **AI（フィルタリング・要約・翻訳）**: Groq API (Llama 3.3 70B)
- **ホスティング**: Netlify

## 環境変数
```
GROQ_API_KEY=your_groq_api_key
```

## URL
https://6a337791c1ea93000826eb38--musical-stardust-da3de9.netlify.app/
