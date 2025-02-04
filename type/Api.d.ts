type ApiResponse<T = any> = {
    meta: {
        ok: boolean;
        type?: ApiType;
        message: string;
    };
    data: any;
};