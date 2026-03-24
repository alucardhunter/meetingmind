/**
 * Ollama Configuration
 * 
 * All Ollama-related configuration is centralized here.
 * API keys and settings should be set via environment variables.
 */

export const ollamaConfig = {
  apiKey: process.env.OLLAMA_API_KEY,
  baseUrl: process.env.OLLAMA_API_URL || 'https://ollama.com/api',
  model: process.env.OLLAMA_MODEL || 'minimax-m2.7:cloud',
} as const;

export type OllamaConfig = typeof ollamaConfig;
