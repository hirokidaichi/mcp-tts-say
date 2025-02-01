export interface TTSResponse {
    data: Buffer;
}

export interface TTSError {
    code: string;
    message: string;
}

/**
 * sayツールのパラメータ型定義
 * @description テキストを音声に変換して再生するためのパラメータ
 */
export interface SayToolParams {
    /** 音声に変換して再生するテキスト */
    text: string;
}

/**
 * sayツールのレスポンス型定義
 */
export interface SayToolResponse {
    content: {
        type: 'text';
        text: string;
    }[];
    isError?: boolean;
} 