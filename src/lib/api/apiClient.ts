// import { API_BASE_URL } from '$env/static/private'

const BASE_URL = "http://localhost:8000";

async function http<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    const headers = new Headers({
        'Content-Type': 'application/json',
        ...(options?.headers ?? {}),
    });

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`${response.status}`);
    }

    return response.json() as Promise<T>;
};

export async function get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return http<T>(endpoint, { method: 'GET', ...options });
};

export async function post<T>(endpoint: string, body: unknown, options?: RequestInit): Promise<T> {
    return http<T>(endpoint, { method: 'POST', body: JSON.stringify(body), ...options });
};

export async function put<T>(endpoint: string, body: unknown, options?: RequestInit): Promise<T> {
    return http<T>(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options });
};

export async function patch<T>(endpoint: string, body: unknown, options?: RequestInit): Promise<T> {
    return http<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options });
};

export async function del<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return http<T>(endpoint, { method: 'DELETE', ...options });
};