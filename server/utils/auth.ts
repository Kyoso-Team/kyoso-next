import crypto from "node:crypto";

import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import type { H3Event } from "h3";
import { db } from "~~/server/database/client";
import type { DiscordUserSelect } from "~~/server/database/schema";
import { sessions, type SessionSelect, type UserSelect } from "~~/server/database/schema";
import { COOKIE_NAME } from "~~/shared/constants";

export type SessionWithToken = SessionSelect & { token: string };

export function generateSessionToken(): string {
  // Human readable alphabet (a-z, 0-9 without l, o, 0, 1 to avoid confusion)
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";

  // Generate 24 bytes = 192 bits of entropy.
  // We're only going to use 5 bits per byte so the total entropy will be 192 * 5 / 8 = 120 bits
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);

  let id = "";
  for (let i = 0; i < bytes.length; i++) {
    // >> 3 "removes" the right-most 3 bits of the byte
    id += alphabet[bytes[i]! >> 3];
  }
  return id;
}

export async function createSession(user: Pick<UserSelect, "id">): Promise<SessionWithToken> {
  const now = new Date();

  const id = generateSessionToken();
  const secret = generateSessionToken();
  const secretHash = await hashSecret(secret);
  const session: SessionSelect = {
    id,
    userId: user.id,
    secretHash: Buffer.from(secretHash).toString("hex"),
    lastVerifiedAt: now,
    createdAt: now,
  };

  await db.insert(sessions).values(session);

  return {
    ...session,
    token: `${id}.${secret}`,
  };
}

export async function validateSessionToken(
  token: string | undefined,
): Promise<SessionValidationResult> {
  if (!token) return null;

  const [sessionId, sessionSecret] = token.split(".");
  if (!sessionId || !sessionSecret) return null;

  const databaseSessionA = await db.query.sessions.findFirst({
    where: {
      id: sessionId,
    },
    columns: {
      id: true,
      secretHash: true,
      lastVerifiedAt: true,
      createdAt: true,
    },
    with: {
      user: {
        columns: {
          id: true,
          username: true,
          osuId: true,
          isAdmin: true,
        },
        with: {
          country: true,
          discord: {
            columns: {
              username: true,
              discordId: true,
            },
          },
        },
      },
    },
  });

  if (!databaseSessionA) {
    return null;
  }

  const { user, ...session } = databaseSessionA;

  const secretHash = new TextEncoder().encode(sessionSecret);
  const secretHashBuffer = await crypto.subtle.digest("SHA-256", secretHash);
  const dbHash = new Uint8Array(Buffer.from(session.secretHash, "hex"));

  if (!constantTimeEqual(new Uint8Array(secretHashBuffer), dbHash)) {
    return null;
  }

  const now = dayjs();
  const lastVerifiedAt = dayjs(session.lastVerifiedAt);

  // Inactivity timeout: 30 days
  if (now.diff(lastVerifiedAt, "day") >= 30) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return null;
  }

  // Activity check interval: 1 day
  if (now.diff(lastVerifiedAt, "day") >= 1) {
    session.lastVerifiedAt = now.toDate();
    await db
      .update(sessions)
      .set({ lastVerifiedAt: session.lastVerifiedAt })
      .where(eq(sessions.id, sessionId));
  }

  return {
    session: { id: session.id },
    user: {
      id: user.id,
      isAdmin: user.isAdmin,
      osu: {
        osuId: user.osuId,
        username: user.username,
        countryCode: user.country.code,
        country: user.country.name,
      },
      discord:
        user.discord !== null
          ? { discordId: user.discord.discordId, username: user.discord.username }
          : null,
    },
  };
}

export async function invalidateSession(token: string): Promise<void> {
  const [sessionId] = token.split(".");
  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }
}

async function hashSecret(secret: string): Promise<Uint8Array> {
  const secretBytes = new TextEncoder().encode(secret);
  const secretHashBuffer = await crypto.subtle.digest("SHA-256", secretBytes);
  return new Uint8Array(secretHashBuffer);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  let c = 0;
  for (let i = 0; i < a.byteLength; i++) {
    const aVal = a.at(i);
    const bVal = b.at(i);

    if (aVal && bVal) {
      c |= aVal ^ bVal;
    }
  }
  return c === 0;
}

export const getCookieSession = async (event: H3Event): Promise<SessionValidationResult> => {
  const token = getCookie(event, COOKIE_NAME);

  if (!token) {
    return null;
  }

  const session = await validateSessionToken(token);

  if (!session) {
    return null;
  }

  return session;
};

export type SessionPayload = {
  session: Pick<SessionSelect, "id">;
  user: Pick<UserSelect, "id" | "isAdmin"> & {
    osu: Pick<UserSelect, "osuId" | "username" | "countryCode"> & {
      country: string;
    };
    discord: Pick<DiscordUserSelect, "discordId" | "username"> | null;
  };
};

export type SessionValidationResult = SessionPayload | null;
