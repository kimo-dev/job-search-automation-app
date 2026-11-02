// import { db } from "@/prisma/db";
// import { NextRequest, NextResponse } from "next/server";

import { NextRequest, NextResponse } from "next/server";

// export async function POST(request: NextRequest) {
//   const body = await request.json();
//   // validations
//   const { firstName, lastName, email, password } = body;
//   if (!firstName || !lastName || !email || !password) {
//     return NextResponse.json({
//       success: false,
//       error: "Missing required fields",
//       missingFields: {
//         isFirstNameMissing: !firstName,
//         isLastNameMissing: !lastName,
//         isEmailMissing: !email,
//         isPasswordMissing: !password
//       }
//     }, { status: 400 })
//   }
//   // verify email format
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(email)) {
//     return NextResponse.json({ error: "Bad email format" }, { status: 400 });
//   }
//   // check if this user exist
//   // hash password
//   try {
//     const user = await db.orm.public.User.create({
//       firstName: firstName,
//       lastName: lastName,
//       email: email,
//       password: password,
//     });
//     const reponseData = {
//       id: user.id,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//       role: user.role
//     }
//     return NextResponse.json({ user: reponseData }, { status: 201 })
//   } catch (error) {
//     console.log(error);
//     return NextResponse.json({ error: "Failed to created the user" }, { status: 500 });
//   }


// }
export async function POST(request: NextRequest) {
    return NextResponse.json({ message: " Hello world!" })
}