import { AuthenticationFailedException } from "@/exceptions/http/AuthenticationException";
import { getAuthenticatedUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export function IsAuthenticated(fn: (req: NextRequest, user: NonNullable<Awaited<ReturnType<typeof getAuthenticatedUser>>>
) => Promise<NextResponse>) {
    return async (req: NextRequest) => {
        try {
            const user = await getAuthenticatedUser();
            if (!user) {
                return NextResponse.json({
                    success: false,
                    error: "Unauthorizde",
                    message: "Authentication is required"
                }, { status: 401 });

            }
            return await fn(req, user);
        } catch (error) {
            if (error instanceof AuthenticationFailedException) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Unauthorized",
                        message: "Authentication failed"
                    },
                    { status: 401 }
                );
            }

            return NextResponse.json(
                {
                    success: false,
                    error: "Internal server error"
                },
                { status: 500 }
            );
        }
    }
}