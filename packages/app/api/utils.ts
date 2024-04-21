export const makeRequest = async (path: string, requestInit?: RequestInit) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`,
    {
      ...requestInit,
    },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json();
};
