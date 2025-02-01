import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import OpenAI from "openai";
import { z } from "zod";
import { synthesizeAndPlayAudio } from "./ttsPlayback";
import { validateConfig } from "./config";
import fs from "fs";

// ログファイルの設定
const logFile = "mcp-server.log";
const log = (message: string) => {
    fs.appendFileSync(logFile, `${new Date().toISOString()} - ${message}\n`);
};

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
    text: z.string().min(1, "テキストは必須です").describe("音声に変換して再生するテキスト")
};

server.tool(
    "say",
    saySchema,
    async ({ text }) => {
        try {
            await synthesizeAndPlayAudio(openai, text);
            return {
                content: [{
                    type: "text",
                    text: "音声再生中...",
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
    log(`MCP Inspector: http://${config.MCP_INSPECTOR_HOST}:${config.MCP_INSPECTOR_PORT}`);
}); 