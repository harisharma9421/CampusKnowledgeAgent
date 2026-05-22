export const paginate = (items, page = 1, limit = 20) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const total = items.length;
  const start = (safePage - 1) * safeLimit;
  const data = items.slice(start, start + safeLimit);

  return {
    data,
    meta: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
      hasNextPage: safePage * safeLimit < total,
      hasPrevPage: safePage > 1,
    },
  };
};

export default paginate;
