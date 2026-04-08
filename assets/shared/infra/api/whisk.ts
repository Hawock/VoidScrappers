const defaultHeaders = {
    'Content-type': 'application/json',
    'Accept': 'application/json'
};

export class Whisk {
    private baseURL: string = '';
    private headers: Record<string, string> = { ...defaultHeaders };

    interceptors = {
        request: {
            use: (handler: (config: any) => void) => {
                this.requestInterceptor = handler;
            }
        },
        response: {
            handler: null as any,
            use(fulfilled?: Function, rejected?: Function) {
                this.handler = { fulfilled, rejected };
            }
        }
    };

    private requestInterceptor: ((config: any) => void) | null = null;

    constructor(options?: { baseURL?: string; headers?: Record<string, string> }) {
        if (options?.baseURL) this.baseURL = options.baseURL;
        if (options?.headers) Object.assign(this.headers, options.headers);
    }

    sendRequest(method: 'GET' | 'PUT' | 'DELETE' | 'POST' | 'PATCH', url: string, data?: any, options?: any) {
        let xhr = new XMLHttpRequest();
        let requestUrl = url;

        if (['GET', 'DELETE'].includes(method) && data) {
            requestUrl = `${url}?${this._getUrlWithQueryParams(data)}`;
        }

        // Вызываем перехватчик запроса (например, для добавления токена)
        if (this.requestInterceptor) {
            this.requestInterceptor(this); 
        }

        return new Promise<{ status: number, data: any, response?: any }>((resolve, reject) => {
            xhr.open(method, `${this.baseURL}${requestUrl}`, true);
            this._setHeaders(xhr);

            xhr.onload = () => {
                let parsedData = null;
                try {
                    parsedData = JSON.parse(xhr.responseText);
                } catch {
                    parsedData = xhr.responseText;
                }

                if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                    let response = { status: xhr.status, data: parsedData };
                    
                    if (this.interceptors.response.handler?.fulfilled) {
                        resolve(this.interceptors.response.handler.fulfilled(response));
                    } else {
                        resolve(response);
                    }
                } else {
                    let response = {
                        status: xhr.status,
                        data: parsedData,
                        response: { data: parsedData, status: xhr.status } // Делаем совместимым со старым Api
                    };
                    
                    if (this.interceptors.response.handler?.rejected) {
                        resolve(this.interceptors.response.handler.rejected(response));
                    } else {
                        reject(response);
                    }
                }
            };
            
            xhr.onerror = () => reject({ status: 0, data: 'Network Error' });

            if (data && !['GET', 'DELETE'].includes(method)) {
                xhr.send(JSON.stringify(data));
            } else {
                xhr.send();
            }
        });
    }

    get(url: string, data?: any, options?: any) { return this.sendRequest('GET', url, data, options); }
    post(url: string, data?: any, options?: any) { return this.sendRequest('POST', url, data, options); }
    put(url: string, data?: any, options?: any) { return this.sendRequest('PUT', url, data, options); }
    delete(url: string, data?: any, options?: any) { return this.sendRequest('DELETE', url, data, options); }
    patch(url: string, data?: any, options?: any) { return this.sendRequest('PATCH', url, data, options); }

    addHeader(key: string, value: string) {
        this.headers[key] = value;
    }

    private _setHeaders(xhr: XMLHttpRequest) {
        for (let header in this.headers) {
            xhr.setRequestHeader(header, this.headers[header]);
        }
    }

    private _getUrlWithQueryParams(data: any) {
        return Object.keys(data).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`).join('&');
    }
}