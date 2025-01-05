"use server";

import { RegisterSchema } from "@/schemas";
import * as z from "zod"
import { getUserByEmail } from "../store/user";
import bcrypt from "bcrypt"
import { db } from "@/lib/prisma";

export const registerUser = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedField = RegisterSchema.safeParse(values)

    if (!validatedField.success) {
        return {error: "不正な値です"}
    }

    const { name, email, password } = validatedField.data

    try {
        const existingUser = await getUserByEmail(email)
        if (!existingUser) {
            return {error: "不正な値です"}
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await db.user.create({
            date: {
                name,
                email,
                password: hashedPassword
            },
        })

        return { success: "ユーザー作成に成功しました" }
    } catch (error: any) {
        console.error("[REGISTER_USER]", error)
        return { error: "サーバーエラー"}
    }
}