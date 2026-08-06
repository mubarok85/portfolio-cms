type RequestRecord = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS =
  10 * 60 * 1000;

const RATE_LIMIT_REQUESTS =
  30;

const requestLog =
  new Map<
    string,
    RequestRecord
  >();

export function getClientIdentifier(
  request: Request,
) {
  const forwardedFor =
    request.headers.get(
      "x-forwarded-for",
    );

  const firstForwardedAddress =
    forwardedFor
      ?.split(",")[0]
      ?.trim();

  return (
    firstForwardedAddress ||
    request.headers.get(
      "x-real-ip",
    ) ||
    "anonymous"
  );
}

export function isRateLimited(
  identifier: string,
) {
  const now = Date.now();

  const current =
    requestLog.get(
      identifier,
    );

  if (
    !current ||
    current.resetAt <= now
  ) {
    requestLog.set(
      identifier,
      {
        count: 1,

        resetAt:
          now +
          RATE_LIMIT_WINDOW_MS,
      },
    );

    return false;
  }

  if (
    current.count >=
    RATE_LIMIT_REQUESTS
  ) {
    return true;
  }

  requestLog.set(
    identifier,
    {
      ...current,
      count:
        current.count + 1,
    },
  );

  return false;
}