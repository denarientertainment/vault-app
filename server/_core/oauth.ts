import axios from "axios";
import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function decodeStateRedirectUri(state: string): string {
  try {
    return Buffer.from(state, "base64").toString("utf-8");
  } catch {
    throw new Error("Invalid OAuth state");
  }
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const oauthServerUrl = process.env.OAUTH_SERVER_URL;
      const auth0ClientId = process.env.AUTH0_CLIENT_ID;
      const auth0ClientSecret = process.env.AUTH0_CLIENT_SECRET;

      if (!oauthServerUrl || !auth0ClientId || !auth0ClientSecret) {
        res.status(500).json({
          error: "Missing AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, or OAUTH_SERVER_URL"
        });
        return;
      }

      // Must exactly match the redirect_uri used in the original /authorize request
      const redirectUri = decodeStateRedirectUri(state);

      const tokenResponse = await axios.post(
        `${oauthServerUrl}/oauth/token`,
        {
          grant_type: "authorization_code",
          client_id: auth0ClientId,
          client_secret: auth0ClientSecret,
          code,
          redirect_uri: redirectUri
        },
        {
          headers: {
            "Content-Type": "application/json"
          },
          timeout: 30000
        }
      );

      const { access_token } = tokenResponse.data ?? {};

      if (!access_token) {
        res.status(500).json({ error: "Missing access token from Auth0" });
        return;
      }

      const userResponse = await axios.get(`${oauthServerUrl}/userinfo`, {
        headers: {
          Authorization: `Bearer ${access_token}`
        },
        timeout: 30000
      });

      const auth0User = userResponse.data ?? {};

      if (!auth0User.sub) {
        res.status(400).json({ error: "User ID missing from Auth0 userinfo" });
        return;
      }

      await db.upsertUser({
        openId: auth0User.sub,
        name: auth0User.name || auth0User.nickname || null,
        email: auth0User.email ?? null,
        loginMethod: "auth0",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(auth0User.sub, {
        name: auth0User.name || auth0User.nickname || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS
      });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
