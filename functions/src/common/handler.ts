import { AxiosError } from "axios";
import {ErrorRequestHandler, RequestHandler, Response} from "express";
import {ApiErrorResponse, ApiResponse} from "./form/api";

export const errorHandler: ErrorRequestHandler = (
    error,
    req,
    res: Response<ApiErrorResponse>,
    next
) => {
    if (error instanceof AxiosError) {
        console.error("Axios Error >> ", error);

        return res.status(500).json({
            meta: { ok: false, type: "axios", message: "API Error" },
            data: {},
        });
    } else {
        console.error("Unknown Error >> ", error);

        return res.status(500).json({
            meta: { ok: false, type: "unknown", message: "Server Error" },
            data: {},
        });
    }
};

export const validateFormHandler: RequestHandler = (req, res, next) => {
    const requiredFields: { [key: string]: string[] } = {
        /**
         * TODO. 추후 API form 넣을 것.
         */
        // '/users': ['projectId'],
        // '/exhibition': ['exhibitionId', 'action'],
    };

    const currentPath = req.path;
    const requiredFieldsForPath = requiredFields[currentPath];

    if (requiredFieldsForPath) {
        for (const field of requiredFieldsForPath) {
            if (!req.body[field] || !req.query[field]) {
                return res.status(400).json(new ApiResponse().failed(`${field} is required`));
            }
        }
    }
    return next();
};