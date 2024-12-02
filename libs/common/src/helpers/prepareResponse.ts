export const PrepareResponse = <T>(
  data: T[],
  totalQuantity: number,
  totalPages: number,
  page: number,
) => {
  return {
    totalPages: totalPages,
    totalQuantity: totalQuantity,
    page: page,
    data: data,
  };
};
