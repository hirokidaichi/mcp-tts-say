import OpenAI from "openai";
import fs from "fs";
import path from "path";
import player from "play-sound";

const audioPlayer = player();

type VoiceType = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

/**
 * テキストから音声を合成し、ローカル再生を行う関数
 * @param openai OpenAIのインスタンス
 * @param text 再生するテキスト
 * @param voice 声色の種類（デフォルトは'echo'）
 * @throws {Error} 音声合成やファイル操作に失敗した場合
 */
export async function synthesizeAndPlayAudio(
    openai: OpenAI, 
    text: string, 
    voice: VoiceType = 'echo'
): Promise<void> {
    let tmpFilePath: string | undefined;
    try {
        // 音声合成
        const response = await openai.audio.speech.create({
            model: "tts-1",
            voice: voice,
            input: text
        });

        // 一時ファイルの作成
        tmpFilePath = path.join(process.cwd(), `temp_audio_${Date.now()}.mp3`);
        fs.writeFileSync(tmpFilePath, Buffer.from(await response.arrayBuffer()));

        // 音声再生
        await new Promise<void>((resolve, reject) => {
            audioPlayer.play(tmpFilePath!, (err?: Error) => {
                if (err) {
                    reject(new Error("音声再生に失敗しました"));
                } else {
                    resolve();
                }
            });
        });
    } catch (error) {
        if (error instanceof Error && error.message === "音声再生に失敗しました") {
            throw error;
        }
        throw new Error("音声合成に失敗しました");
    } finally {
        // 一時ファイルの削除
        if (tmpFilePath && fs.existsSync(tmpFilePath)) {
            try {
                fs.unlinkSync(tmpFilePath);
            } catch (error) {
                console.error("一時ファイルの削除に失敗しました:", error);
            }
        }
    }
} 