import { z } from "zod";

const envSchema = z.object({
    OPENAI_API_KEY: z.string().min(1, "OpenAI API Keyは必須です"),
    MCP_INSPECTOR_PORT: z.string().transform((val) => parseInt(val, 10)).default("3000"),
    MCP_INSPECTOR_HOST: z.string().default("localhost"),
});

export type Config = z.infer<typeof envSchema>;

export function validateConfig(): Config {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const messages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`);
            throw new Error(`環境変数の検証に失敗しました:\n${messages.join("\n")}`);
        }
        throw error;
    }
} 