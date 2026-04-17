import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  error: string,
  statusCode = 500,
  message = 'Error'
): Response => {
  const response: ApiResponse = {
    success: false,
    error,
    message
  };
  return res.status(statusCode).json(response);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  message = 'Success'
): Response => {
  return res.status(200).json({
    success: true,
    data,
    pagination,
    message
  });
};
