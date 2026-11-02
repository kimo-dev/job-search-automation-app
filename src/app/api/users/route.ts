import { UniqueConstraintException } from "@/exceptions/uniqueConstraintException";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    // const body = await request.json();
    // // validations
    // const parsedData = userValidationSchema.safeParse(body);
    // if (!parsedData.success) {
    //     return NextResponse.json({
    //         success: false,
    //         error: parsedData.error.issues.map(i => ({ path: i.path, message: i.message }))
    //     }, { status: 400 })
    // }
    // // hash password
    // try {
    //     const user = await UserService.createUser(parsedData.data);
    //     return NextResponse.json({ user: user }, { status: 201 })
    // } catch (error: any) {
    //     if(error instanceof UniqueConstraintException){
    //         return NextResponse.json({ error: error.message }, { status: 400 })
    //     }
    //     console.log(error);
    //     return NextResponse.json({ error: error }, { status: 500 });
    // }
        return NextResponse.json({ message: "Hello world!" }, { status: 201 })


}
