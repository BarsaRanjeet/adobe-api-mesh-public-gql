"use strict";

const IMS_TOKEN_URL = "https://ims-na1.adobelogin.com/ims/token/v3";
const IMS_SCOPE =
  "openid,AdobeID,additional_info.roles,profile,commerce.accs.org.read,additional_info.projectedProductContext,email";
const ACCESS_TOKEN_STATE_KEY = "ims:accessToken";

async function cacheToken(state, token, ttlSeconds) {
  if (!state || !token) return;
  const ttl = Number(ttlSeconds);
  await state.put(ACCESS_TOKEN_STATE_KEY, token, { ttl });
}

async function getCachedToken(state) {
  if (!state) return null;
  try {
    return await state.get(ACCESS_TOKEN_STATE_KEY);
  } catch {
    return null;
  }
}

async function requestImsToken(context, logger) {
  const secrets = context?.secrets || {};
  const clientId = secrets.IMS_CLIENT_ID;
  const clientSecret = secrets.IMS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("IMS client credentials are missing");
  }

  const form = new URLSearchParams();
  form.set("client_secret", clientSecret);
  form.set("grant_type", "client_credentials");
  form.set("scope", IMS_SCOPE);

  const url = `${IMS_TOKEN_URL}?client_id=${encodeURIComponent(clientId)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("IMS token endpoint returned invalid JSON");
  }

  if (!response.ok) {
    throw new Error(
      payload?.error_description ||
        payload?.error ||
        response.statusText ||
        "IMS token request failed",
    );
  }

  return {
    accessToken: payload.access_token,
    expiresIn: payload.expires_in,
  };
}

async function ensureImsToken(context, logger) {
  const { state } = context || {};

  const cached = await getCachedToken(state);
  if (cached) return cached;

  const { accessToken, expiresIn } = await requestImsToken(context, logger);

  await cacheToken(state, accessToken, expiresIn);
  return accessToken;
}

module.exports.injectImsAuth = async ({ context, sourceName }) => {
  if (!context) {
    return {
      status: "ERROR",
      message: "Hook context is unavailable",
    };
  }

  const { logger } = context;

  try {
    const token = await ensureImsToken(context, logger);
    logger?.info?.(`Token is ${token}`);
    return {
      status: "SUCCESS",
      message: "Authorized",
      data: {
        request: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    };
  } catch (error) {
    logger?.error?.(`IMS auth hook failed: ${error.message}`);
    return {
      status: "ERROR",
      message: `Unable to obtain IMS token: ${error.message}`,
    };
  }
};
