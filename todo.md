# TODO リスト

## 1. 初期セットアップ
- [x] プロジェクトの初期化 (`npm init -y`)
- [x] TypeScript、必要なパッケージのインストール
  ```bash
  npm install typescript @types/node @modelcontextprotocol/sdk openai play-sound
  npm install --save-dev jest ts-jest @types/jest eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin @modelcontextprotocol/inspector
  ```
- [x] TypeScript設定ファイル (tsconfig.json) の作成
- [x] ESLint設定ファイル (.eslintrc.js) の作成
- [x] Jest設定ファイル (jest.config.js) の作成
- [x] .gitignore の設定
- [x] ソースコードディレクトリ構造の作成
- [x] 最小限のTypeScriptファイル作成

## 2. テスト環境の構築
- [x] `__tests__` ディレクトリの作成
- [x] ttsPlayback のモック作成
- [x] テストヘルパー関数の作成
- [x] MCP Inspector用のスクリプト追加
- [x] Lintエラーの修正

## 3. 型定義
- [x] TTSResponse 型の定義
- [x] エラー型の定義
- [x] MCPツールのパラメータ型定義

## 4. ttsPlayback モジュールの実装
- [x] synthesizeAndPlayAudio 関数の実装
- [x] 一時ファイル管理の実装
- [x] エラーハンドリングの実装
- [x] ユニットテストの作成と実行
- [ ] 音声再生時のエラーハンドリングの修正 (@todo)

## 5. MCP サーバー実装
- [x] main.ts の実装（sayツール追加）
- [x] sayツールのパラメータ型定義
- [x] 統合テストの作成と実行（一部スキップ）

## 6. 環境変数対応
- [x] .env ファイルの作成
- [x] 環境変数のバリデーション実装
- [x] MCP Inspector用の環境変数設定

## 7. デバッグ・動作確認
- [ ] ローカルでの動作確認
- [ ] エラーケースの確認
- [ ] パフォーマンステスト
- [ ] MCP Inspectorを使用したエンドツーエンドテスト
  - [ ] 正常系シナリオ
  - [ ] エラー系シナリオ
  - [ ] 境界値テスト

## 8. ドキュメント整備
- [ ] README.md の作成
  - [ ] MCP Inspector使用方法の追加
  - [ ] デバッグ手順の追加
- [ ] API ドキュメントの生成
- [ ] 使用例の追加

## 9. 声色選択機能の実装
- [ ] saySchemaに声色パラメータを追加
  - [ ] 利用可能な声色のリスト作成
  - [ ] 声色の特徴説明の追加
  - [ ] デフォルト値（echo）の設定
- [ ] 声色に応じたTTS生成ロジックの実装
- [ ] 声色選択のテストケース追加

## 10. NPXツールとしての提供
- [ ] package.jsonの設定更新
  - [ ] bin エントリの追加
  - [ ] 実行可能なスクリプトの作成
- [ ] GitHub Packagesへの公開設定
- [ ] インストール・実行手順のドキュメント作成

## 11. テスト強化
- [ ] ユニットテストの拡充
  - [ ] 声色選択機能のテスト
  - [ ] エッジケースのテスト追加
- [ ] 統合テストの拡充
  - [ ] E2Eテストシナリオの追加
  - [ ] パフォーマンステストの追加
- [ ] テストカバレッジ目標の設定と達成

## 注意点
- 各実装ステップでlintチェックを実施
- 型の厳密な定義を心がける
- テストカバレッジを重視
- エラーハンドリングを適切に実装
- コードの可読性を重視
- MCP Inspectorでの動作確認を定期的に実施

## 優先順位の高い実装項目
1. 音声再生時のエラーハンドリングの修正
2. ローカルでの動作確認
3. MCP Inspectorを使用した統合テスト
4. ドキュメント整備 