import { headers } from "next/headers";
import { auth } from "./auth";

export const getSessionUserId = async (): Promise<string> => {
    const session = await auth.api.getSession({
        headers: await headers(), // ← pass request headers
    });
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }
    return session.user.id;
}