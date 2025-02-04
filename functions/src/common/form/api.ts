type ApiType = "axios" | "unknown";


export type Response<T> = {
    meta: { ok: boolean; type?: ApiType, message: string };
    data: T;
};
export type ApiErrorResponse = Response<{}>;

export class ApiResponse {
    success<T>(data: T): Response<T> {
        return {
            meta: {ok: true, message: "Success"},
            data: {...data}
        };
    }

    failed<T>(message: string): Response<T> {
        return {
            meta: {ok: false, message: message},
            data: {...<T>{}}
        };
    }

    pending<T>(data: T): Response<T> {
        return {
            meta: {ok: false, message: 'Pending'},
            data: {...data}
        };
    }

    denied<T>(message: string = 'Deny'): Response<T> {
        return {
            meta: {ok: false, message: message},
            data: {...<T>{}}
        };
    }
}
