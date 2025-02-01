# MCP TTS Say

MCPサーバーを利用して、テキストを音声に変換し、ローカル環境で再生するツールです。OpenAIのTTS SDKを使用して、高品質な音声合成を実現します。

## 機能

- OpenAI TTS SDKを使用したテキストの音声合成
- ローカル環境での音声再生
- MCPサーバーとの統合による簡単な音声再生ツールの提供

## 必要条件

- Node.js (v18以上)
- OpenAI APIキー
- 音声再生が可能なローカル環境

## インストール

```bash
# プロジェクトのクローン
git clone https://github.com/hirokidaichi/mcp-tts-say.git
cd mcp-tts-say

# 依存パッケージのインストール
npm install
```

## 環境設定

1. `.env`ファイルをプロジェクトルートに作成
2. 以下の環境変数を設定

```env
OPENAI_API_KEY=your_api_key_here
```

## 使用方法

### 開発モード

```bash
# TypeScriptのコンパイルと実行
npm run dev

# テストの実行
npm test

# リントチェック
npm run lint
```

### MCP Inspectorを使用したデバッグ

```bash
npm run inspect
```

## ライセンス

MIT

## 貢献

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 開発者向け情報

詳細な仕様については[spec.md](./spec.md)を参照してください。
開発タスクの進捗状況は[todo.md](./todo.md)で管理しています。
