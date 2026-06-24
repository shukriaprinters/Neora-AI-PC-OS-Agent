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
  const retries = options?.retries ?? 2;
  const retryDelayMs = options?.retryDelayMs ?? 400;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(path, init);
      if (response.ok || attempt === retries || response.status < 500) {
        return response;
      }
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        throw new NeoraApiError(path, error instanceof Error ? error.message : "Request failed");
      }
    }

    await sleep(retryDelayMs * (attempt + 1));
  }

  throw new NeoraApiError(path, lastError instanceof Error ? lastError.message : "Request failed");
}

export async function neoraGet<T>(path: string, options?: NeoraFetchOptions): Promise<T> {
  const response = await fetchWithRetry(path, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  }, options);
  return parseResponse<T>(response);
}

export async function neoraPost<T>(path: string, body?: JsonObject, options?: NeoraFetchOptions): Promise<T> {
  const response = await fetchWithRetry(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  }, options);
  return parseResponse<T>(response);
}

export async function neoraDelete<T>(path: string, options?: NeoraFetchOptions): Promise<T> {
  const response = await fetchWithRetry(path, {
    method: "DELETE",
    headers: {
      "Accept": "application/json",
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
