
import axios from "axios"
import { useLoadingStore } from "../store/loading.store";





let refreshPromise: Promise<void> | null = null;
let sessionExpiredEmitted = false;

const refreshClient = axios.create({
  baseURL: import.meta.env["VITE_API_BASE_URL"],
  timeout: 10000,
  withCredentials: true,
  xsrfCookieName: import.meta.env["VITE_XSRF_COOKIE_NAME"],
  xsrfHeaderName: import.meta.env["VITE_XSRF_HEADER_NAME"],
});

const apiClient=axios.create({
    baseURL:import.meta.env['VITE_API_BASE_URL'],
    timeout:10000,
    withCredentials:true,
    xsrfCookieName:import.meta.env["VITE_XSRF_COOKIE_NAME"],
    xsrfHeaderName:import.meta.env["VITE_XSRF_HEADER_NAME"]
})

function captureCsrfFromHeaders(headers: unknown) {
  if (!headers || typeof headers !== 'object') return;
  const h = headers as Record<string, unknown>;
  const token = h['x-csrf-token'] ?? h['X-CSRF-Token'];
  if (typeof token === 'string' && token.trim()) {
    localStorage.setItem(import.meta.env["VITE_XSRF_HEADER_NAME"], token.trim());
    // خط storedCsrfToken رو حذف کن، فقط localStorage کافیه
  }
}

// ذخیرهٔ توکن CSRF از هدر پاسخ (لاگین/رفرش/me)
apiClient.interceptors.response.use(
  (response) => {
    captureCsrfFromHeaders(response.headers);
  useLoadingStore.getState().hide()
    return response;
  },
  (error) =>{

    useLoadingStore.getState().hide()
    return Promise.reject(error)} 
);



apiClient.interceptors.request.use(async(config) => {
    if (refreshPromise) {
    await refreshPromise;
  }
  useLoadingStore.getState().show();

  const method = (config.method ?? 'get').toLowerCase();
  const isSafe = method === 'get' || method === 'head' || method === 'options';
  if (isSafe) return config;


  const existing = config.headers?.[import.meta.env["VITE_XSRF_HEADER_NAME"]!];

if (typeof existing === 'string') {
  captureCsrfFromHeaders(config.headers)
  
  return config;
}
  const token =
      localStorage.getItem(import.meta.env["VITE_XSRF_HEADER_NAME"])


  if (token) {

    
    config.headers = config.headers ?? {};
    config.headers[import.meta.env['VITE_XSRF_HEADER_NAME']!] = token;
  }
  
  return config;
});

// const refreshClient = axios.create({
//   baseURL: import.meta.env["VITE_API_BASE_URL"],
//   timeout: 10000,
//   withCredentials: true,
// });


function isSkippableAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  // Skip refresh/loop on auth endpoints except `me`
  return /\/auth\/(super)\/(login|register|logout|refresh)\b/.test(url);
}

function isAuthFailure(err: unknown): boolean {
  if (!axios.isAxiosError(err)) return false;
  const status = err.response?.status;
  return status === 401 || status === 403;
}

async function refreshAs(): Promise<void> {
  const res = await refreshClient.post(`/super/refresh`);

captureCsrfFromHeaders(res.headers);

  
 

}


async function refreshSessionSingleFlight(): Promise<void> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      await refreshAs();
    } catch (err) {
      if (isAuthFailure(err)) {
        
        throw err;
      }
      throw err;
    }
  })();

  try {
    await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}


function emitSessionExpiredOnce() {
  if (sessionExpiredEmitted) return;
  sessionExpiredEmitted = true;
  try {
    window.dispatchEvent(new CustomEvent('auth:session-expired'));
  } catch {
    // ignore
  
  }}

apiClient.interceptors.response.use(
  (response) => {
    useLoadingStore.getState().hide();
    return response;
  },
  async (error) => {
    useLoadingStore.getState().hide();
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const status = error.response?.status;
    const config = error.config as (typeof error.config & { __isRetry?: boolean }) | undefined;
    if (status !== 401 || !config) return Promise.reject(error);
    if (isSkippableAuthEndpoint(config.url)) return Promise.reject(error);
    if (config.__isRetry) return Promise.reject(error);

    config.__isRetry = true;

    try {
      await refreshSessionSingleFlight();
    } catch {
      emitSessionExpiredOnce();
      
      return Promise.reject(error);
    }

    // پاک کردن هدر CSRF قدیمی تا توکن جدید از localStorage خونده بشه
    if (config.headers) {
      delete config.headers[import.meta.env['VITE_XSRF_HEADER_NAME']!];
    }

    return apiClient.request(config);
  }
);

export default apiClient