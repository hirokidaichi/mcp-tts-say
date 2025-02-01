以下は、これまでの議論内容をもとに、**開発向け指示書・全体仕様書**としてまとめたドキュメント例です。以下の仕様書には、システムの概要、利用する技術、設計思想、使用シチュエーション、及びサンプルコードの構成例が含まれています。

---

# 開発向け仕様書  
**タイトル:** MCP サーバーによる音声合成＆ローカル再生ツール "say" の実装仕様書  
**作成日:** 2025-02-01  
**対象:** エージェントがユーザーに対し、視覚情報に頼らず音声で指示・通知を行うシステムの開発

---

## 1. システム概要

本システムは、MCP（Model Context Protocol）の仕組みを用いて、LLM（大規模言語モデル）との連携時に、エージェントがユーザーへ音声フィードバックを提供するためのツールを実装するものです。具体的には、以下の機能を実現します。

- **音声合成:**  
  OpenAI の公式 TTS SDK（TypeScript 用）を利用し、指定されたテキストから音声データ（例：MP3）を生成する。

- **ローカル再生:**  
  生成された音声データを一時ファイルに保存し、Node.js 用の外部再生ライブラリ（例: `play-sound`）を用いてサーバー上で再生する。

- **MCP サーバーとの統合:**  
  MCP SDK を利用して、外部ツール（ここでは「say」ツール）として音声再生処理を登録し、エージェントが必要に応じて呼び出せるようにする。

---

## 2. 対象環境・前提条件

- **開発言語:** TypeScript  
- **主要ライブラリ・SDK:**  
  - [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)  
  - [openai](https://platform.openai.com/docs/guides/text-to-speech) (OpenAI の TTS SDK)  
  - [play-sound](https://www.npmjs.com/package/play-sound)  
  - その他、Node.js 標準モジュール（fs, path など）

- **実行環境:**  
  音声再生が可能なローカル環境（OS側で再生可能なオーディオプレイヤーがインストールされていること）  
- **認証:**  
  環境変数 `OPENAI_API_KEY` により、OpenAI API の認証を行う。

---

## 3. システムアーキテクチャ

システムは以下の３つの主要コンポーネントから構成されます。

1. **MCP サーバー:**  
   MCP SDK を用いてサーバーを構築し、ツールやリソース、プロンプトを定義。今回は、ツールとして「say」を登録します。

2. **音声合成＆再生モジュール:**  
   OpenAI の TTS SDK を呼び出して音声を生成し、生成された音声データを一時ファイルに保存、その後 `play-sound` などのライブラリでローカル再生を行うモジュール。

3. **ツール定義:**  
   MCP サーバーにおいて「say」ツールとして、上記音声合成＆再生モジュールを呼び出すエントリーポイントを提供。ツール定義には、エージェント向けの詳細な説明（description）を付与し、どのようなシチュエーションで利用すべきかを明示する。

---

## 4. ツール使用シチュエーション

**say ツールの利用が推奨される状況：**

- ユーザーが画面の確認が難しい環境（例：移動中、視覚障害がある場合）で、視覚情報ではなく音声による指示や通知が必要な場合。
- エージェントが対話中にユーザーへ次の操作指示を音声で行うことで、ユーザーが画面を逐一監視せずにシステムを利用できるようにする場合。
- 動的なフィードバックやアラートを音声で伝え、ユーザーの注意を喚起する必要がある場合。

---

## 5. 開発方針・設計思想

- **分離と再利用:**  
  音声合成と再生処理を別モジュール (`ttsPlayback.ts`) として切り出すことで、MCP サーバー本体のコードがシンプルになり、将来の変更・拡張に柔軟に対応できる設計とする。

- **標準 API の活用:**  
  OpenAI の TTS SDK を使用することで、外部サービスとの認証やレスポンス処理を統一的に扱うとともに、最新の公式仕様に合わせたパラメータ設定を行う。

- **エラーハンドリング:**  
  音声合成、ファイル操作、再生処理それぞれに対して適切なエラーハンドリングを実施し、エラー発生時には MCP ツールのレスポンスに反映する。

- **ドキュメント・コメントの充実:**  
  ツール定義に対して description を付与し、エージェントや将来の開発者がどのような状況でこのツールを利用すべきか理解できるようにする。

---

## 6. サンプルコード構成

以下に、モジュール別のサンプルコード例を示します。

### 6.1. `ttsPlayback.ts`  
音声合成とローカル再生を担当するモジュール

```typescript
// ttsPlayback.ts
import { OpenAIApi } from "openai";
import fs from "fs";
import path from "path";
import player from "play-sound";

// play-sound ライブラリのインスタンス生成
const audioPlayer = player();

/**
 * テキストから音声を合成し、ローカル再生を行う関数
 * @param openai OpenAIApi のインスタンス
 * @param text 再生するテキスト
 */
export async function synthesizeAndPlayAudio(openai: OpenAIApi, text: string): Promise<void> {
  // OpenAI の TTS SDK を用いた音声合成リクエスト
  const response = await openai.createTTS({
    text,
    voice: "default",  // 必要に応じたオプションを指定（最新の仕様に合わせてください）
  });
  
  // 返却された音声データを Buffer として取得（レスポンス形式は公式仕様に合わせる）
  const audioBuffer: Buffer = response.data as Buffer;
  
  // 一時ファイルとして保存するパスを生成
  const tmpFilePath = path.join(__dirname, "temp_audio.mp3");
  fs.writeFileSync(tmpFilePath, audioBuffer);
  
  // 音声再生を Promise 化して再生完了を待つ
  await new Promise<void>((resolve, reject) => {
    audioPlayer.play(tmpFilePath, (err: any) => {
      if (err) {
        reject(err);
      } else {
        // 再生完了後に一時ファイルを削除
        fs.unlinkSync(tmpFilePath);
        resolve();
      }
    });
  });
}
```

### 6.2. `main.ts`  
MCP サーバーの実装と "say" ツールの登録

```typescript
// main.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Configuration, OpenAIApi } from "openai";
import { z } from "zod";
import { synthesizeAndPlayAudio } from "./ttsPlayback";

// OpenAI SDK の初期化（環境変数から API キーを取得）
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// MCP サーバーの作成
const server = new McpServer({
  name: "LocalVoicePlaybackServer",
  version: "1.0.0"
});

/**
 * "say" ツールの定義
 *
 * Description:
 * このツールは、指定されたテキストを基に音声を合成し、ローカルで再生します。
 * 主に、ユーザーが画面を確認できない状況や視覚情報に頼らず、音声で次の指示や通知を行いたい場合に利用してください.
 *
 * 入力:
 * - text: 再生するテキスト（string）
 */
server.tool(
  "say",
  { text: z.string() },
  async ({ text }) => {
    try {
      await synthesizeAndPlayAudio(openai, text);
      return {
        content: [{
          type: "text",
          text: "音声再生中…"
        }]
      };
    } catch (error) {
      console.error("TTS エラー:", error);
      return {
        content: [{
          type: "text",
          text: "音声合成に失敗しました。"
        }],
        isError: true
      };
    }
  },
  {
    // ツールの説明（description）
    description: "このツールは、指定されたテキストから音声を合成し、ローカル環境で再生します。ユーザーが画面を見ていない場合や、視覚情報に頼らず音声で指示・通知を伝えたい際に利用してください。"
  }
);

// サーバー起動（stdio トランスポートを使用）
const transport = new StdioServerTransport();
server.connect(transport).then(() => {
  console.log("LocalVoicePlaybackServer が起動しました。");
});
```

---

## 7. 開発・運用上の注意点

- **依存パッケージの管理:**  
  最新の OpenAI TTS SDK、MCP SDK、play-sound など、利用する各ライブラリのバージョン管理を適切に行うこと。

- **エラーハンドリングの強化:**  
  本サンプルコードでは基本的なエラーハンドリングのみ実装していますが、プロダクション環境では各種例外（ネットワークエラー、ファイル操作エラーなど）への対応をさらに強化する必要があります。

- **並行実行の検討:**  
  複数の同時再生リクエストが発生する場合、ファイル名の一意性や再生キューの管理を検討すること。

- **環境依存性:**  
  サーバーが動作する環境で音声出力が可能であること、OS 側の再生コマンドが正しく設定されていることを確認する。

---

## 8. まとめ

本仕様書では、MCP サーバー上でエージェントがユーザーへ音声指示を提供するための「say」ツールの実装方法について、以下の点を明示しました。

- **音声合成とローカル再生の統合:**  
  OpenAI の TTS SDK を利用し、生成した音声データを一時ファイルに保存、play-sound を用いてローカル再生を実現する。

- **MCP SDK との連携:**  
  MCP の仕組みを利用してツールとして登録し、エージェントが利用しやすい形で提供する。

- **使用シチュエーションの明示:**  
  ツールの description により、ユーザーが画面確認できない環境や視覚情報に頼らず音声で指示・通知を行う場合に利用すべきことを説明。

- **コードの分割と再利用:**  
  音声合成・再生処理を独立したモジュールとして実装することで、保守性・拡張性を向上。

これにより、エージェントは適切なタイミングで「say」ツールを呼び出し、ユーザーへ音声フィードバックを提供できるシステムを構築できます。

---

以上が、開発向けの指示書とサンプルコードイメージを含む全体の仕様書の例です。これをもとに、各種環境や要件に合わせた実装を進めてください。