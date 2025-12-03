import { z } from "zod";

export const signupSchema = z.object({
  body: z
    .object({
      name: z.string().min(2, "name must be at least 2 characters long"),
      phoneNumber: z.string().optional(), // ← أصبح اختياري
      role: z.enum(["member", "guest"]),
      email: z.string().email("البريد الإلكتروني غير صالح"),
      password: z.string().min(8, "كلمة المرور يجب أن تكون على الأقل 8 حروف"),
      dateOfBirth: z.string().optional(), // ← أصبح اختياري
      purpose: z.string().optional(),
      cardId: z.string().optional(),
      imageBase64: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.role === "guest") {
        if (!data.purpose || data.purpose.trim() === "") {
          ctx.addIssue({
            path: ["purpose"],
            code: z.ZodIssueCode.custom,
            message: "Purpose is required for guest users",
          });
        }
      }

      if (data.role === "member") {
        if (!data.imageBase64 || !data.imageBase64.startsWith("data:image/")) {
          ctx.addIssue({
            path: ["imageBase64"],
            code: z.ZodIssueCode.custom,
            message: "Valid base64 image is required for member users",
          });
        }
      }
    }),
});

export const loginSchema = z.object({
  body: z.object({
    emailOrCardId: z.string(),
    password: z.string().min(8),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    userId: z.string(),
    code: z.string().length(6, "الرمز المرسل يجب أن يكون 6 حروف"),
  }),
});

export const sendResetCodeSchema = z.object({
  body: z.object({
    email: z.string().email("البريد الإلكتروني غير صالح"),
  }),
});

export const checkResetCodeSchema = z.object({
  body: z.object({
    email: z.string().email("البريد الإلكتروني غير صالح"),
    code: z.string().length(6, "الرمز المرسل يجب أن يكون 6 حروف "),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("البريد الإلكتروني غير صالح"),
    code: z.string().length(6, "الرمز المرسل يجب أن يكون 6 حروف"),
    newPassword: z.string().min(8, "كلمة المرور يجب أن تكون على الأقل 8 حروف"),
  }),
});
