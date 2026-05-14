// জেনেরিক রেসপন্স ফাংশন (যা আপনি লিখেছিলেন)
export const sendResponse = (res, responseData) => {
    const { statusCode, success, message, data, meta } = responseData;
    res.status(statusCode).json({
        success,
        message,
        data,
        meta,
    });
};
// ✅ কন্ট্রোলারের জন্য sendSuccess ফাংশন যোগ করা হলো
export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    sendResponse(res, {
        statusCode,
        success: true,
        message,
        data,
    });
};
// ✅ কন্ট্রোলারের জন্য sendPaginated ফাংশন যোগ করা হলো
export const sendPaginated = (res, data, meta, message = 'Success') => {
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message,
        data,
        meta,
    });
};
// ✅ কন্ট্রোলারের জন্য sendError ফাংশন যোগ করা হলো
export const sendError = (res, message = 'Error', statusCode = 400) => {
    sendResponse(res, {
        statusCode,
        success: false,
        message,
    });
};
