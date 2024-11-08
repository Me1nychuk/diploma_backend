import { HttpException, HttpStatus } from '@nestjs/common';

export function handleError(error: unknown, message: string = 'Error'): void {
  if (error instanceof HttpException) {
    // Якщо помилка вже є HttpException, просто кидаємо її
    throw error;
  } else if (error instanceof Error) {
    // Якщо помилка є стандартною Error, кидаємо кастомну HttpException
    throw new HttpException(
      `${message}: ${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  } else {
    // Якщо помилка невідомого типу, кидаємо загальну помилку
    throw new HttpException(
      `${message}: An unknown error occurred`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
