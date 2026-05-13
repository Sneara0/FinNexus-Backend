import { Response } from "express";

interface IResponseData<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// জেনেরিক রেসপন্স ফাংশন (যা আপনি লিখেছিলেন)
export const sendResponse = <T>(res: Response, responseData: IResponseData<T>) => {
  const { statusCode, success, message, data, meta } = responseData;
  res.status(statusCode).json({
    success,
    message,
    data,
    meta,
  });
};

// ✅ কন্ট্রোলারের জন্য sendSuccess ফাংশন যোগ করা হলো
export const sendSuccess = <T>(res: Response, data: T, message = 'Success', statusCode = 200) => {
  sendResponse(res, {
    statusCode,
    success: true,
    message,
    data,
  });
};

// ✅ কন্ট্রোলারের জন্য sendPaginated ফাংশন যোগ করা হলো
export const sendPaginated = <T>(res: Response, data: T, meta: any, message = 'Success') => {
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message,
    data,
    meta,
  });
};

// ✅ কন্ট্রোলারের জন্য sendError ফাংশন যোগ করা হলো
export const sendError = (res: Response, message = 'Error', statusCode = 400) => {
  sendResponse(res, {
    statusCode,
    success: false,
    message,
  });
};