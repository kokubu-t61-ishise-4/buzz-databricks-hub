# Tech Info Hub

## 概要
エンジニアのための情報収集ツールを集約したポータルサイトです。
Qiita・ZennのタグベースRSSフィードから最新記事を取得し、新着順に5件を表示します。
バズワード、Databricks、AI、AI駆動開発、データエンジニアリングの5つの専門Hubと、IT全般ニュースのByteFlowを提供しています。

## 主な機能
- **BuzzRadar**: ITバズワードを収集し、カテゴリ（AI/ML、インフラ、データ、セキュリティ）別に整理
- **Databricks Hub**: Databricks・Sparkの最新記事を収集
- **AI Hub**: AI・LLM・Claude・ChatGPTの最新記事を収集
- **AI駆動開発 Hub**: Cursor・GitHub Copilot・Claude Code・VS Code関連の最新記事を収集
- **データエンジニアリング Hub**: dbt・Airflow・Spark・BigQueryなどの記事を収集
- **ByteFlow**: HuggingFace Spaces上のIT全般ニュースツール（外部リンク）
- **日英切替**: すべてのHubで日本語・英語表示を切り替え可能
- **カテゴリフィルタ**: 各Hubでソース（Qiita/Zenn）別に情報を絞り込み
- **詳細パネル**: カードをクリックすると詳細情報・元記事リンクを表示

## アーキテクチャ

### データ取得フロー
```
Qiita/Zenn RSSフィード → rss2json API → フロントエンド表示
```

### 表示データ
RSSフィードから取得した情報をそのまま表示しています：
- **タイトル**: RSSのtitle
- **日付**: RSSのpubDate（YYYY-MM-DD形式）
- **要約**: RSSのdescription（HTMLタグ除去、100文字）
- **ソース**: URLからQiita/Zennを自動判定
- **リンク**: 元記事URL

### 各Hubの情報源（Qiita/Zennタグベース）

| Hub | Qiitaタグ | Zennトピック |
|-----|----------|-------------|
| **AI Hub** | llm, ai, claude, chatgpt | llm, ai, claude |
| **AI駆動開発 Hub** | cursor, githubcopilot, claudecode, vscode | cursor, githubcopilot, vscode |
| **Databricks Hub** | databricks, spark | databricks, spark |
| **データエンジニアリング Hub** | dbt, airflow, apachespark, bigquery | dbt, airflow, bigquery |
| **BuzzRadar** | popular-items, tech | feed（トレンド）, frontend, backend |

### RSSフィードURL形式
- Qiita: `https://qiita.com/tags/【タグ名】/feed`
- Zenn: `https://zenn.dev/topics/【トピック名】/feed`

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
- **ホスティング**: Netlify

## 環境変数
環境変数は不要です。外部APIキーなしで動作します。

## URL
https://6a337791c1ea93000826eb38--musical-stardust-da3de9.netlify.app/
