export const DEFAULT_PAGE_SIZE = 25;

export function parsePage(value: string | undefined) {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

export function pageRange(page: number, pageSize = DEFAULT_PAGE_SIZE) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return { from, to };
}
