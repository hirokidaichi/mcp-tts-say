import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import OpenAI from "openai";
import { synthesizeAndPlayAudio } from "../ttsPlayback";
import { z } from "zod";

// モックの設定
jest.mock("../ttsPlayback");
const mockSynthesizeAndPlayAudio = synthesizeAndPlayAudio as jest.MockedFunction<typeof synthesizeAndPlayAudio>;

describe("Server Integration Tests", () => {
    let server: McpServer;
    let serverTransport: StdioServerTransport;
    let sayHandler: (params: any) => Promise<any>;

    beforeEach(async () => {
        // テスト前にモックをリセット
        jest.clearAllMocks();

        // サーバーの初期化
        server = new McpServer({
            name: "TestLocalVoicePlaybackServer",
            version: "1.0.0",
        });

        // sayツールのハンドラーを保存
        sayHandler = async ({ text, voice = "echo" }) => {
            try {
                await synthesizeAndPlayAudio(new OpenAI(), text, voice);
                return {
                    content: [{
                        type: "text",
                        text: `音声再生中... (声色: ${voice})`,
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
        };

        // sayツールの登録
        server.tool(
            "say",
            {
                text: z.string().min(1, "テキストは必須です").describe("音声に変換して再生するテキスト"),
                voice: z.enum(["echo", "alloy", "fable", "onyx", "nova", "shimmer"])
                    .default("echo")
                    .describe("音声の声色を選択します")
            },
            sayHandler
        );

        // トランスポートの設定
        serverTransport = new StdioServerTransport();

        // サーバーの起動
        await server.connect(serverTransport);
    });

    afterEach(() => {
        // テスト後のクリーンアップ
        serverTransport.close();
    });

    it("should successfully handle say tool request", async () => {
        // モックの設定
        mockSynthesizeAndPlayAudio.mockResolvedValueOnce();

        // sayツールのハンドラーを直接呼び出し
        const result = await sayHandler({
            text: "こんにちは、世界！"
        });

        // 検証
        expect(mockSynthesizeAndPlayAudio).toHaveBeenCalledWith(
            expect.any(OpenAI),
            "こんにちは、世界！",
            "echo"
        );
        expect(result.content).toEqual([{
            type: "text",
            text: "音声再生中... (声色: echo)",
        }]);
    });

    it("should successfully handle say tool request with specified voice", async () => {
        // モックの設定
        mockSynthesizeAndPlayAudio.mockResolvedValueOnce();

        // sayツールのハンドラーを直接呼び出し
        const result = await sayHandler({
            text: "こんにちは、世界！",
            voice: "shimmer"
        });

        // 検証
        expect(mockSynthesizeAndPlayAudio).toHaveBeenCalledWith(
            expect.any(OpenAI),
            "こんにちは、世界！",
            "shimmer"
        );
        expect(result.content).toEqual([{
            type: "text",
            text: "音声再生中... (声色: shimmer)",
        }]);
    });

    it("should handle errors from say tool", async () => {
        // モックの設定
        mockSynthesizeAndPlayAudio.mockRejectedValueOnce(new Error("音声合成に失敗しました"));

        // sayツールのハンドラーを直接呼び出し
        const result = await sayHandler({
            text: "こんにちは、世界！"
        });

        // 検証
        expect(result.content).toEqual([{
            type: "text",
            text: "音声合成に失敗しました。",
        }]);
        expect(result.isError).toBe(true);
    });
}); 