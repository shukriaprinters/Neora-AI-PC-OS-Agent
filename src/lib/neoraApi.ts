type JsonObject = Record<string, unknown>;

type NeoraFetchOptions = {
  retries?: number;
  retryDelayMs?: number;
};

export class NeoraApiError extends Error {
  endpoint: string;

  constructor(endpoint: string, message: string) {
    super(message);
    this.name = "NeoraApiError";
    this.endpoint = endpoint;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }
  return (await response.text()) as T;
}

async function fetchWithRetry(path: string, init: RequestInit, options?: NeoraFetchOptions): Promise<Response> {
  const retries = options?.retries ?? 3;
  const retryDelayMs = options?.retryDelayMs ?? 300;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(path, init);
      // If response is OK, we are good.
      // If response has status >= 500 (e.g. 503), we want to retry unless it is the last attempt
      if (response.ok) {
        return response;
      }
      if (response.status < 500) {
        // Client errors (4xx) shouldn't be retried
        return response;
      }
      // If it's 5xx and we have attempts remaining, loop to retry
      if (attempt === retries) {
        return response;
      }
    } catch (error) {
      lastError = error;
      
      const errMsg = error instanceof Error ? error.message : String(error);
      const isFailedToFetch = errMsg.includes("Failed to fetch") || errMsg.includes("fetch") || errMsg.includes("NetworkError");
      const isLocalService = path.includes("ollama") || path.includes("11434") || path.includes("local") || path.includes("/api/chat-ollama");
      
      if (isFailedToFetch && isLocalService) {
        if (typeof window !== "undefined") {
          // Dispatch SystemEvent to AutoHealRegistry
          const customEvt = new CustomEvent("neora-system-event", {
            detail: {
              id: "heal-failed-fetch-" + Math.floor(Math.random() * 100000),
              timestamp: new Date().toTimeString().split(" ")[0],
              category: "system_heal",
              level: "WARNING",
              message: `Local Service Failure: Failed to fetch on '${path}'`,
              details: JSON.stringify({
                path,
                error: errMsg,
                attempt: attempt + 1,
                action: "Initiated a graceful background retry cycle and notified UI.",
                timestamp: new Date().toISOString()
              }, null, 2),
              latency: "1.5ms"
            }
          });
          window.dispatchEvent(customEvt);

          // Notify UI of status
          const statusEvt = new CustomEvent("neora-autoheal-retry", {
            detail: {
              path,
              attempt: attempt + 1,
              service: "ollama",
              status: "retrying",
              message: `Re-attempting connection to local Ollama (Attempt ${attempt + 1}/${retries})...`
            }
          });
          window.dispatchEvent(statusEvt);
        }
      }

      if (attempt === retries) {
        throw new NeoraApiError(path, error instanceof Error ? error.message : "Request failed");
      }
    }

    // Exponential backoff: retryDelayMs * 2^attempt (e.g., 300ms, 600ms, 1200ms)
    const backoffDelay = retryDelayMs * Math.pow(2, attempt);
    await sleep(backoffDelay);
  }

  throw new NeoraApiError(path, lastError instanceof Error ? lastError.message : "Request failed");
}

export async function neoraGet<T>(path: string, options?: NeoraFetchOptions): Promise<T> {
  const token = typeof window !== 'undefined' ? (localStorage.getItem('neora_token') || 'NEORA-X7-AGENT') : 'NEORA-X7-AGENT';
  const response = await fetchWithRetry(path, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "x-neora-token": token,
    },
  }, options);
  return parseResponse<T>(response);
}

export async function neoraPost<T>(path: string, body?: JsonObject, options?: NeoraFetchOptions): Promise<T> {
  const token = typeof window !== 'undefined' ? (localStorage.getItem('neora_token') || 'NEORA-X7-AGENT') : 'NEORA-X7-AGENT';
  const response = await fetchWithRetry(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "x-neora-token": token,
    },
    body: body ? JSON.stringify(body) : undefined,
  }, options);
  return parseResponse<T>(response);
}

export async function neoraDelete<T>(path: string, options?: NeoraFetchOptions): Promise<T> {
  const token = typeof window !== 'undefined' ? (localStorage.getItem('neora_token') || 'NEORA-X7-AGENT') : 'NEORA-X7-AGENT';
  const response = await fetchWithRetry(path, {
    method: "DELETE",
    headers: {
      "Accept": "application/json",
      "x-neora-token": token,
    },
  }, options);
  return parseResponse<T>(response);
}

export async function neoraUpload<T>(path: string, formData: FormData, options?: NeoraFetchOptions): Promise<T> {
  const response = await fetchWithRetry(path, {
    method: "POST",
    body: formData,
  }, options);
  return parseResponse<T>(response);
}

export async function neoraChatWithFallback(
  primaryModel: 'gemini' | 'groq' | 'ollama',
  payload: {
    messages: any[];
    lang?: string;
    geminiKey?: string;
    groqKey?: string;
    key?: string; // matching server's param for Groq
    model?: string;
    ollamaBaseUrl?: string;
  }
): Promise<{ modelUsed: 'gemini' | 'groq' | 'ollama'; response: any }> {
  const modelsInOrder: Array<'gemini' | 'groq' | 'ollama'> = [primaryModel];
  
  if (primaryModel === 'gemini') {
    modelsInOrder.push('groq', 'ollama');
  } else if (primaryModel === 'groq') {
    modelsInOrder.push('gemini', 'ollama');
  } else {
    modelsInOrder.push('gemini', 'groq');
  }

  let lastError: any = null;

  for (const model of modelsInOrder) {
    let endpoint = '/api/chat-gemini';
    if (model === 'groq') endpoint = '/api/chat-groq';
    if (model === 'ollama') endpoint = '/api/chat-ollama';

    try {
      console.log(`[neoraApi] Attempting LLM call to ${model} via ${endpoint}...`);
      
      // Setup payload matching the endpoint expectations
      const requestPayload: any = {
        messages: payload.messages,
        lang: payload.lang,
      };

      if (model === 'gemini') {
        requestPayload.geminiKey = payload.geminiKey || payload.key;
      } else if (model === 'groq') {
        requestPayload.key = payload.key || payload.groqKey;
        if (payload.model && payload.model !== 'llama3') {
          requestPayload.model = payload.model;
        }
      } else if (model === 'ollama') {
        requestPayload.ollamaBaseUrl = payload.ollamaBaseUrl;
        requestPayload.model = payload.model === 'llama-3.3-70b-versatile' ? 'llama3' : payload.model;
      }

      const res = await neoraPost<any>(endpoint, requestPayload, { retries: 0 });
      
      if (res && (res.status === 'api_key_missing' || res.error || res.status === 'error')) {
        throw new Error(res.message || res.error || `${model} returned error status.`);
      }
      
      return {
        modelUsed: model,
        response: res,
      };
    } catch (err: any) {
      console.warn(`[neoraApi] Model ${model} call failed. Falling back to alternative... Error:`, err);
      lastError = err;
    }
  }

  throw new Error(`All LLM models in fallback chain failed. Last error: ${lastError?.message || lastError}`);
}

export interface UnifiedLlmResponse {
  text: string;
  provider: 'gemini' | 'groq' | 'ollama';
  modelUsed: string;
  voiceText: string;
}

export interface UnifiedLlmOptions {
  messages: any[];
  lang?: string;
  geminiKey?: string;
  groqKey?: string;
  ollamaBaseUrl?: string;
  model?: string;
  signal?: AbortSignal;
}

export function sanitizeTextForVoice(text: string): string {
  if (!text) return "";
  let clean = text;
  // Strip code blocks
  clean = clean.replace(/```[\s\S]*?```/g, "");
  // Strip inline code
  clean = clean.replace(/`([^`]+)`/g, "$1");
  // Strip bold/italic asterisks
  clean = clean.replace(/\*\*([^*]+)\*\*/g, "$1");
  clean = clean.replace(/\*([^*]+)\*/g, "$1");
  // Strip emojis
  clean = clean.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "");
  // Strip hash tags / system markers
  clean = clean.replace(/#+/g, "");
  return clean.trim();
}

export interface LLMProviderResponse {
  text: string;
  provider: 'gemini' | 'groq' | 'ollama';
  modelUsed: string;
  audioMetadata?: {
    speakText: string;
    shouldSpeak: boolean;
    voiceRate?: number;
    voicePitch?: number;
    lang?: 'en' | 'bn';
  };
  success: boolean;
  error?: string;
}

export interface LLMProviderAdapter {
  chat(provider: 'gemini' | 'groq' | 'ollama', options: UnifiedLlmOptions): Promise<LLMProviderResponse>;
}

export const LLMRequestAdapter: LLMProviderAdapter = {
  async chat(provider: 'gemini' | 'groq' | 'ollama', options: UnifiedLlmOptions): Promise<LLMProviderResponse> {
    const maxRetries = 3;
    const initialDelay = 500;
    let lastError: any = null;

    const modelsToTry: Array<'gemini' | 'groq' | 'ollama'> = [provider];
    if (provider === 'gemini') {
      modelsToTry.push('groq', 'ollama');
    } else if (provider === 'groq') {
      modelsToTry.push('gemini', 'ollama');
    } else {
      modelsToTry.push('gemini', 'groq');
    }

    for (const activeProvider of modelsToTry) {
      let endpoint = '/api/chat-gemini';
      if (activeProvider === 'groq') endpoint = '/api/chat-groq';
      if (activeProvider === 'ollama') endpoint = '/api/chat-ollama';

      // Robust direct client-side fetch for local Ollama
      if (activeProvider === 'ollama') {
        const localUrl = (options.ollamaBaseUrl || "http://127.0.0.1:11434").replace(/\/+$/, '');
        const ollamaModel = options.model === 'llama-3.3-70b-versatile' ? 'llama3' : (options.model || 'llama3');
        try {
          console.log(`[LLMRequestAdapter] Attempting DIRECT CLIENT-SIDE fetch to local Ollama at ${localUrl}...`);
          const systemInstruction = `You are Neora X7, a helpful AI assistant. Answer in ${options.lang === 'bn' ? 'Bengali (বাংলা)' : 'English'}.`;
          const formattedMessages = [
            { role: "system", content: systemInstruction },
            ...options.messages.map(m => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: m.content
            }))
          ];
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout for local model response

          const clientRes = await fetch(`${localUrl}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: ollamaModel,
              messages: formattedMessages,
              stream: false
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          if (clientRes.ok) {
            const result = await clientRes.json();
            const rawText = result?.message?.content || "";
            const containsBangla = /[\u0980-\u09FF]/.test(rawText);
            
            console.log("[LLMRequestAdapter] Direct Ollama fetch successful!");
            return {
              text: rawText,
              provider: 'ollama',
              modelUsed: ollamaModel,
              audioMetadata: {
                speakText: sanitizeTextForVoice(rawText),
                shouldSpeak: true,
                lang: containsBangla ? 'bn' : (options.lang as 'en' | 'bn' || 'en')
              },
              success: true
            };
          } else {
            console.warn(`[LLMRequestAdapter] Direct Ollama response status: ${clientRes.status}`);
          }
        } catch (directErr: any) {
          console.warn(`[LLMRequestAdapter] Direct local Ollama fetch failed: ${directErr.message || directErr}. Falling back to proxy/cloud...`);
        }
      }

      const requestPayload: any = {
        messages: options.messages,
        lang: options.lang || 'en',
      };

      if (activeProvider === 'gemini') {
        requestPayload.geminiKey = options.geminiKey;
      } else if (activeProvider === 'groq') {
        requestPayload.key = options.groqKey;
        if (options.model && options.model !== 'llama3') {
          requestPayload.model = options.model;
        }
      } else if (activeProvider === 'ollama') {
        requestPayload.ollamaBaseUrl = options.ollamaBaseUrl;
        requestPayload.model = options.model === 'llama-3.3-70b-versatile' ? 'llama3' : options.model;
      }

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[LLMRequestAdapter] Attempting ${activeProvider} on ${endpoint}, attempt ${attempt + 1}...`);
          
          const res = await neoraPost<any>(endpoint, requestPayload, { retries: 0 });

          // Detect if response is 503/504 or other overloaded statuses
          const errorCode = res?.error?.code || res?.status_code || res?.statusCode;
          const errorMessage = res?.error?.message || res?.message || res?.error || "";
          
          const isUnavailable = errorCode === 503 || errorCode === 504 || 
                                errorMessage.includes("503") || errorMessage.includes("504") || 
                                errorMessage.includes("Service Unavailable") || errorMessage.includes("Gateway Timeout") || 
                                errorMessage.includes("overloaded") || errorMessage.includes("temporary");

          if (isUnavailable) {
            throw new Error(`Service Unavailable (503/504): ${errorMessage}`);
          }

          if (res && (res.status === 'api_key_missing' || res.error || res.status === 'error')) {
            throw new Error(res.message || res.error || `${activeProvider} returned error status.`);
          }

          const rawText = res?.text || res?.content || res?.choices?.[0]?.message?.content || "";
          const containsBangla = /[\u0980-\u09FF]/.test(rawText);

          return {
            text: rawText,
            provider: activeProvider,
            modelUsed: options.model || (activeProvider === 'gemini' ? 'gemini-3.5-flash' : activeProvider === 'groq' ? 'llama3' : 'ollama-default'),
            audioMetadata: {
              speakText: sanitizeTextForVoice(rawText),
              shouldSpeak: true,
              lang: containsBangla ? 'bn' : (options.lang as 'en' | 'bn' || 'en')
            },
            success: true
          };

        } catch (err: any) {
          console.warn(`[LLMRequestAdapter] Attempt ${attempt + 1} failed for ${activeProvider}. Error:`, err);
          lastError = err;

          const errString = err.message || String(err);
          const is503_504 = errString.includes("503") || errString.includes("504") || 
                            errString.includes("Service Unavailable") || errString.includes("Gateway Timeout") || 
                            errString.includes("overloaded") || errString.includes("temporary");
          
          if (is503_504 && attempt < maxRetries) {
            const delay = initialDelay * Math.pow(2, attempt);
            console.log(`[LLMRequestAdapter] Detected 503/504 error. Retrying in ${delay}ms...`);
            
            if (typeof window !== "undefined") {
              const customEvt = new CustomEvent("neora-system-event", {
                detail: {
                  id: "heal-503-" + Math.floor(Math.random() * 100000),
                  timestamp: new Date().toTimeString().split(" ")[0],
                  category: "system_heal",
                  level: "WARNING",
                  message: `503/504 Transient Error on ${activeProvider} - Retrying`,
                  details: JSON.stringify({
                    provider: activeProvider,
                    endpoint,
                    attempt: attempt + 1,
                    delay_ms: delay,
                    error: errString
                  }, null, 2),
                  latency: `${delay}ms`
                }
              });
              window.dispatchEvent(customEvt);
            }

            await sleep(delay);
            continue;
          }
          
          // Try next fallback provider if it's a non-retriable error or we exhausted attempts
          break;
        }
      }
    }

    throw new Error(`LLMRequestAdapter failed after trying fallbacks. Last error: ${lastError?.message || lastError}`);
  }
};

export const UnifiedLlmService = {
  async chat(provider: 'gemini' | 'groq' | 'ollama', options: UnifiedLlmOptions): Promise<UnifiedLlmResponse> {
    const res = await LLMRequestAdapter.chat(provider, options);
    return {
      text: res.text,
      provider: res.provider,
      modelUsed: res.modelUsed,
      voiceText: res.audioMetadata?.speakText || sanitizeTextForVoice(res.text)
    };
  }
};
