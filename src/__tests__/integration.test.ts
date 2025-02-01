import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import OpenAI from "openai";
import { synthesizeAndPlayAudio } from "../ttsPlayback";
import { SayToolParams, SayToolResponse } from "../types";
import { z } from "zod";

// モックの設定
jest.mock("../ttsPlayback");
const mockSynthesizeAndPlayAudio = synthesizeAndPlayAudio as jest.MockedFunction<typeof synthesizeAndPlayAudio>;

describe("MCP Server Integration Tests", () => {
    let server: McpServer;

    beforeEach(() => {
        // テスト前にモックをリセット
        jest.clearAllMocks();

        // サーバーの初期化
        server = new McpServer({
            name: "TestLocalVoicePlaybackServer",
            version: "1.0.0",
        });

        // sayツールの登録
        server.tool(
            "say",
            { text: z.string() },
            async (args) => {
                try {
                    await synthesizeAndPlayAudio(new OpenAI(), args.text);
                    return {
                        content: [{
                            type: "text",
                            text: "音声再生中...",
                        }],
                    };
                } catch (error) {
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
    });

    it("should successfully process say tool request", async () => {
        // モックの設定
        mockSynthesizeAndPlayAudio.mockResolvedValueOnce();

        // ツールの実行
        const result = await server.tools.say({ text: "テストメッセージ" });

        // 検証
        expect(mockSynthesizeAndPlayAudio).toHaveBeenCalledTimes(1);
        expect(mockSynthesizeAndPlayAudio).toHaveBeenCalledWith(expect.any(OpenAI), "テストメッセージ");
        expect(result).toEqual({
            content: [{
                type: "text",
                text: "音声再生中...",
            }],
        });
    });

    it("should handle errors in say tool", async () => {
        // モックの設定
        mockSynthesizeAndPlayAudio.mockRejectedValueOnce(new Error("テストエラー"));

        // ツールの実行
        const result = await server.tools.say({ text: "テストメッセージ" });

        // 検証
        expect(mockSynthesizeAndPlayAudio).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            content: [{
                type: "text",
                text: "音声合成に失敗しました。",
            }],
            isError: true,
        });
    });
}); 