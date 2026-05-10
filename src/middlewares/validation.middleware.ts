import { NextFunction, Request, Response } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateRequest = (schema: ZodSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // এটি বডি, কুয়েরি এবং প্যারামস সব চেক করবে
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      return next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error',
          errorDetails: error.issues.map((issue) => ({
            path: issue.path[issue.path.length - 1], // ফিল্ডের নাম (যেমন: email)
            message: issue.message,
          })),
        });
      }
      
      // অন্য কোনো এরর হলে গ্লোবাল এরর হ্যান্ডলারে পাঠিয়ে দিন
      return next(error);
    }
  };
};