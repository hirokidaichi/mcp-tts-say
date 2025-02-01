import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import OpenAI from "openai";
import { z } from "zod";
import { synthesizeAndPlayAudio } from "./ttsPlayback";
import { validateConfig } from "./config";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

// ログ出力の設定
const log = (message: string) => {
    console.error(`${new Date().toISOString()} - ${message}`);
};

// コマンドライン引数からAPIキーを取得
const apiKeyFromArg = process.argv[2];
if (apiKeyFromArg) {
    process.env.OPENAI_API_KEY = apiKeyFromArg;
    log("APIキーをコマンドライン引数から設定しました。");
}

// 環境変数のバリデーション
const config = validateConfig();

const openai = new OpenAI({
    apiKey: config.OPENAI_API_KEY,
});

const server = new McpServer({
    name: "LocalVoicePlaybackServer",
    version: "1.0.0",
});

const saySchema = {
    text: z.string().min(1, "テキストは必須です").describe("音声に変換して再生するテキスト"),
    voice: z.enum(["echo", "alloy", "fable", "onyx", "nova", "shimmer"])
        .default("echo")
        .describe("音声の声色を選択します。echo: こだまのような透明感のある声, alloy: 多目的で万能な声, fable: 物語に適した暖かみのある声, onyx: 力強く信頼感のある声, nova: 成熟した重厚な声, shimmer: 明るく陽気な声")
};

server.tool(
    "say",
    saySchema,
    async ({ text, voice }) => {
        try {
            await synthesizeAndPlayAudio(openai, text, voice);
            return {
                content: [{
                    type: "text",
                    text: `音声再生中... (声色: ${voice})`,
                }],
            };
        } catch (error) {
            log(`TTSエラー: ${error}`);
            return {
                content: [{
                    type: "text",
                    text: "音声合成に失敗しました。",
                }],
                isError: true,
            };
        }
    }
);

const transport = new StdioServerTransport();

void server.connect(transport).then((): void => {
    log("LocalVoicePlaybackServer が起動しました。");
}); 