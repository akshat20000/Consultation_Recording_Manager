const API_BASE_URL =import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  statusCode: number;
  errors?: any[];

  constructor(statusCode: number, message: string, errors?: any[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('astro_token');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Do not set Content-Type if uploading FormData (let browser set it with boundary)
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle files downloads (exports)
  const contentDisposition = response.headers.get('Content-Disposition');
  if (contentDisposition && contentDisposition.includes('attachment')) {
    if (!response.ok) {
      throw new ApiError(response.status, 'File download failed');
    }
    return (await response.text()) as any;
  }

  let json: any = {};
  try {
    json = await response.json();
  } catch {
    // response doesn't have JSON body
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      json.message || 'An error occurred',
      json.errors
    );
  }

  return json.data;
}
