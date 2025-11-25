"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.checkResetCodeSchema = exports.sendResetCodeSchema = exports.verifyEmailSchema = exports.loginSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
exports.signupSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        name: zod_1.z.string().min(2, "name must be at least 2 characters long"),
        phoneNumber: zod_1.z.string(),
        role: zod_1.z.enum(["member", "guest"]),
        email: zod_1.z.string().email("البريد الإلكتروني غير صالح"),
        password: zod_1.z.string().min(8, "كلمة المرور يجب أن تكون على الأقل 8 حروف"),
        dateOfBirth: zod_1.z.string(),
        purpose: zod_1.z.string().optional(),
        cardId: zod_1.z.string().optional(),
        imageBase64: zod_1.z.string().optional(),
    })
        .superRefine((data, ctx) => {
        if (data.role === "guest") {
            if (!data.purpose || data.purpose.trim() === "") {
                ctx.addIssue({
                    path: ["purpose"],
                    code: zod_1.z.ZodIssueCode.custom,
                    message: "Purpose is required for guest users",
                });
            }
        }
        if (data.role === "member") {
            if (!data.imageBase64 || !data.imageBase64.startsWith("data:image/")) {
                ctx.addIssue({
                    path: ["imageBase64"],
                    code: zod_1.z.ZodIssueCode.custom,
                    message: "Valid base64 image is required for member users",
                });
            }
        }
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        emailOrCardId: zod_1.z.string(),
        password: zod_1.z.string().min(8),
    }),
});
exports.verifyEmailSchema = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.string(),
        code: zod_1.z.string().length(6, "الرمز المرسل يجب أن يكون 6 حروف"),
    }),
});
exports.sendResetCodeSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("البريد الإلكتروني غير صالح"),
    }),
});
exports.checkResetCodeSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("البريد الإلكتروني غير صالح"),
        code: zod_1.z.string().length(6, "الرمز المرسل يجب أن يكون 6 حروف "),
    }),
});
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("البريد الإلكتروني غير صالح"),
        code: zod_1.z.string().length(6, "الرمز المرسل يجب أن يكون 6 حروف"),
        newPassword: zod_1.z.string().min(8, "كلمة المرور يجب أن تكون على الأقل 8 حروف"),
    }),
});
