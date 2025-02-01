import OpenAI from "openai";
import { synthesizeAndPlayAudio } from "../ttsPlayback";
import fs from "fs";
import path from "path";

jest.mock("openai");
jest.mock("fs");

// 音声再生のモック
let playErrorCallback: ((err?: Error) => void) | undefined;
jest.mock("play-sound", () => {
    return () => ({
        play: (filepath: string, callback: (err?: Error) => void) => {
            playErrorCallback = callback;
            if (process.env.TEST_PLAY_ERROR === "true") {
                setTimeout(() => {
                    if (playErrorCallback) {
                        playErrorCallback(new Error("再生エラー"));
                    }
                }, 100);
            } else {
                setTimeout(() => {
                    if (playErrorCallback) {
                        playErrorCallback();
                    }
                }, 100);
            }
        }
    });
});

describe("ttsPlayback", () => {
    const mockOpenAI = {
        apiKey: "test-key",
        organization: null,
        project: null,
        audio: {
            speech: {
                create: jest.fn()
            }
        }
    } as unknown as jest.Mocked<OpenAI>;
    
    const mockAudioBuffer = Buffer.from("test audio data");
    const mockResponse = {
        arrayBuffer: jest.fn().mockResolvedValue(mockAudioBuffer)
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (mockOpenAI.audio.speech.create as jest.Mock).mockResolvedValue(mockResponse);
        playErrorCallback = undefined;
        process.env.TEST_PLAY_ERROR = "false";
    });

    it("正常に音声を合成して再生できる", async () => {
        await expect(synthesizeAndPlayAudio(mockOpenAI, "テストテキスト"))
            .resolves.not.toThrow();

        expect(mockOpenAI.audio.speech.create).toHaveBeenCalledWith({
            model: "tts-1",
            voice: "alloy",
            input: "テストテキスト"
        });

        expect(fs.writeFileSync).toHaveBeenCalled();
        expect(fs.unlinkSync).toHaveBeenCalled();
    });

    it("OpenAI APIエラー時に適切なエラーを投げる", async () => {
        const error = new Error("API Error");
        (mockOpenAI.audio.speech.create as jest.Mock).mockRejectedValue(error);

        await expect(synthesizeAndPlayAudio(mockOpenAI, "テストテキスト"))
            .rejects
            .toThrow("音声合成に失敗しました");
    });

    it.skip("音声再生時のエラーを適切に処理する", async () => {
        process.env.TEST_PLAY_ERROR = "true";

        const promise = synthesizeAndPlayAudio(mockOpenAI, "テストテキスト");

        await expect(promise)
            .rejects
            .toThrow("音声再生に失敗しました");
    });
}); 