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
