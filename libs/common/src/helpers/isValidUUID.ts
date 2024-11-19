import { HttpException, HttpStatus } from '@nestjs/common';

export function isValidUUID(id: string) {
  const newId = id.trim();
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

  // Перевірка чи id відповідає формату UUID
  if (!uuidRegex.test(newId)) {
    throw new HttpException(
      'The provided ID is not a valid UUID',
      HttpStatus.BAD_REQUEST,
    );
  }
}
