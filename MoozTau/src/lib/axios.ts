import axios from "axios";
import { AUTH_API_URL, ORDERS_API_URL, FINANCE_API_URL, AUDIT_API_URL } from "@/constants";
import { useAuthStore } from "@/stores/auth-store";
import { getLang } from "@/i18n";

function createClient(baseURL: string) {
  const instance = axios.create({
    baseURL,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
  });

  instance.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["Accept-Language"] = getLang();
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config;
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;
        const { refreshToken, setTokens, logout } = useAuthStore.getState();
        if (refreshToken) {
          try {
            const res = await axios.post(`${AUTH_API_URL}/api/auth/refresh`, {
              refresh_token: refreshToken,
            });
            const { access_token, refresh_token } = res.data;
            setTokens(access_token, refresh_token);
            original.headers.Authorization = `Bearer ${access_token}`;
            return instance(original);
          } catch {
            logout();
          }
        } else {
          logout();
        }
      }
      return Promise.reject(error);
    },
  );

  return instance;
}

export const authApi = createClient(AUTH_API_URL);
export const ordersApi = createClient(ORDERS_API_URL);
export const financeApi = createClient(FINANCE_API_URL);
export const auditApi = createClient(AUDIT_API_URL);

// Enable mock mode with VITE_MOCK=true or when no backend is available
if (import.meta.env.VITE_MOCK === "true") {
  import("./mock-api").then(({ installMockInterceptor }) => {
    installMockInterceptor(authApi);
    installMockInterceptor(ordersApi);
    installMockInterceptor(financeApi);
    installMockInterceptor(auditApi);
  });
}
