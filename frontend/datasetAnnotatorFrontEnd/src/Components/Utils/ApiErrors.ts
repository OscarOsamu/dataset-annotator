export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    const data = response?.data;
    if (typeof data === "string") return data;
    if (typeof data === "object" && data !== null) {
      const messages = Object.values(data)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .filter((value): value is string => typeof value === "string");
      if (messages.length > 0) return messages.join(" ");
    }
  }

  return error instanceof Error ? error.message : fallback;
};

export const isFormValidationError = (error: unknown) =>
  typeof error === "object" && error !== null && "errorFields" in error;