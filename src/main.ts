import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import OpenAI from "openai";
import { synthesizeAndPlayAudio } from "./ttsPlayback";
import { SayToolParams, SayToolResponse } from "./types";
import { validateConfig } from "./config";

// 環境変数のバリデーション
const config = validateConfig();

const openai = new OpenAI({
    apiKey: config.OPENAI_API_KEY,
});

const server = new McpServer({
    name: "LocalVoicePlaybackServer",
    version: "1.0.0",
});

server.tool(
    "say",
    "テキストを音声に変換して再生します",
    async (extra) => {
        const text = (extra.args as SayToolParams).text;
        try {
            await synthesizeAndPlayAudio(openai, text);
            return {
                content: [{
                    type: "text",
                    text: "音声再生中...",
                }],
            };
        } catch (error) {
            console.error("TTSエラー:", error);
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
    console.log("LocalVoicePlaybackServer が起動しました。");
    console.log(`MCP Inspector: http://${config.MCP_INSPECTOR_HOST}:${config.MCP_INSPECTOR_PORT}`);
}); 