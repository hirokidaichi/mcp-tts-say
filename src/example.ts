import OpenAI from "openai";
import { synthesizeAndPlayAudio } from './ttsPlayback';

async function main() {
    console.log('音声合成を開始します...');
    const openai = new OpenAI();
    try {
        const message = 'ヒロキさん、こんにちは。私はしらせと申します。本日はあなたのアシスタントとして、できる限りのサポートをさせていただきます。どのようなお手伝いが必要でしょうか？';
        await synthesizeAndPlayAudio(openai, message, 'fable'); // fable は表現力豊かな声
        console.log('音声合成と再生が完了しました');
    } catch (error) {
        console.error('エラーが発生しました:', error);
    }
}

main().catch(console.error); 