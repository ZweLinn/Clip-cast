import aj from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { ArcjetDecision, slidingWindow, validateEmail } from "@arcjet/next";
import { toNextJsHandler } from "better-auth/next-js";
import ip from "@arcjet/ip"
import { NextRequest } from "next/server";


const emailValidateWithArcjet = aj.withRule(validateEmail({ mode: "LIVE", deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"] }))

const rateLimitWithArcjet = aj.withRule(slidingWindow(
    {
        mode: "LIVE",
        interval: '2m',
        max: 3,
        characteristics: ['fingerprint']
    }
))

const protectAuth = async (req: NextRequest): Promise<ArcjetDecision> => {
    const session = await auth.api.getSession({ headers: req.headers });

    let userId: string;

    if (session?.user.id) {
        userId = session.user.id;
    } else {
        userId = ip(req) || '127.0.0.1';
    }

    if (req.nextUrl.pathname.startsWith("/api/auth/sign-up")) {
        const body = await req.clone().json();
        if (typeof body.email === "string") {
            return emailValidateWithArcjet.protect(req, {
                email: body.email,
            });

        }

    }
    return rateLimitWithArcjet.protect(req , {fingerprint : userId})
}

const authHandler = toNextJsHandler(auth.handler);

export const {GET} = authHandler;
export const POST = async (req: NextRequest) => {
  const decision = await protectAuth(req);
  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      throw new Error("Email validation failed");
    }
    if (decision.reason.isRateLimit()) {
      throw new Error("Rate limit exceeded");
    }
    if (decision.reason.isShield()) {
      throw new Error("Shield validation failed");
    }
  }

  return authHandler.POST(req);
};