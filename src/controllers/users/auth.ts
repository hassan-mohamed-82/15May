import { Request, Response } from "express";
import { saveBase64Image } from "../../utils/handleImages";
import { db } from "../../models/db";
import { emailVerifications, users } from "../../models/schema";
import { eq, and, or } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { SuccessResponse } from "../../utils/response";
import { randomInt } from "crypto";
import {
  ForbiddenError,
  NotFound,
  UnauthorizedError,
  UniqueConstrainError,
} from "../../Errors";
import { generateToken } from "../../utils/auth";
import { sendEmail } from "../../utils/sendEmails";
import { BadRequest } from "../../Errors/BadRequest";

export const signup = async (req: Request, res: Response) => {
  const data = req.body;

  // بناء شرط البحث ديناميكياً
  const conditions = [eq(users.email, data.email)];
  if (data.phoneNumber) {
    conditions.push(eq(users.phoneNumber, data.phoneNumber));
  }

  const [existing] = await db
    .select()
    .from(users)
    .where(or(...conditions));

  if (existing) {
    if (existing.email === data.email)
      throw new UniqueConstrainError(
        "Email",
        "البريد الإلكتروني مستخدم بالفعل"
      );
    if (data.phoneNumber && existing.phoneNumber === data.phoneNumber)
      throw new UniqueConstrainError(
        "Phone Number",
        "رقم الجوال مستخدم بالفعل"
      );
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const userId = uuidv4();

  let imagePath: string | null = null;

  if (data.role === "member") {
    imagePath = await saveBase64Image(data.imageBase64!, userId, req, "users");
  }

  const code = randomInt(100000, 999999).toString();

  const newUser: any = {
    id: userId,
    name: data.name,
    phoneNumber: data.phoneNumber || null, // ← يقبل null
    role: data.role,
    cardId: data.cardId || null,
    email: data.email,
    hashedPassword,
    purpose: data.role === "guest" ? data.purpose : null,
    imagePath,
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null, // ← يقبل null
    status: "pending",
    createdAt: new Date(new Date().getTime() + 3 * 60 * 60 * 1000),
    updatedAt: new Date(new Date().getTime() + 3 * 60 * 60 * 1000),
  };

  if (!req.user) {
    await db.insert(emailVerifications).values({
      userId: userId,
      code,
    });
    await sendEmail(
      data.email,
      "Email Verification",
      `Your verification code is ${code}`
    );
  } else {
    newUser.status = "approved";
    newUser.isVerified = true;
  }

  await db.insert(users).values(newUser);

  SuccessResponse(
    res,
    {
      message: "تم التسجيل بنجاح من فضلك قم بتحقق من البريد الالكتروني",
      userId: userId,
    },
    201
  );
};


export const verifyEmail = async (req: Request, res: Response) => {
  const { userId, code } = req.body;

  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
  });

  if (!user) throw new NotFound("User not found");

  const record = await db.query.emailVerifications.findFirst({
    where: (ev, { eq }) => eq(ev.userId, user.id),
  });

  if (!record || record.code !== code)
    throw new BadRequest("Invalid verification code");

  await db.update(users).set({ isVerified: true }).where(eq(users.id, user.id));
  await db
    .delete(emailVerifications)
    .where(eq(emailVerifications.userId, user.id));

  res.json({ message: "تم التحقق من البريد الالكتروني" });
};

export const login = async (req: Request, res: Response) => {
  const data = req.body;
  const { emailOrCardId, password } = data;

  // البحث إما بالإيميل أو الـ cardId
  const user = await db.query.users.findFirst({
    where: or(eq(users.email, emailOrCardId), eq(users.cardId, emailOrCardId)),
  });

  if (!user) {
    throw new UnauthorizedError("الحساب غير موجود");
  }

  const isMatch = await bcrypt.compare(password, user.hashedPassword);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid email/card ID or password");
  }

  if (user.status !== "approved") {
    throw new ForbiddenError(
      "الحساب غير موافق على التسجيل. يرجى الانتظار حتى يتم الموافقة عليه"
    );
  }

  if (!user.isVerified) {
    throw new ForbiddenError("قم بتحقق من البريد الالكتروني");
  }

  const token = generateToken({
    id: user.id,
    name: user.name,
    role:
      user.role === "member" ? "approved_member_user" : "approved_guest_user",
  });

  SuccessResponse(res, { message: "تم تسجيل الدخول بنجاح ", token }, 200);
};
export const getFcmToken = async (req: Request, res: Response) => {
  const { token } = req.body;
  const userId = req.user!.id;

  await db.update(users).set({ fcmtoken: token }).where(eq(users.id, userId));
  res.json({ success: true });
};

export const sendResetCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user) throw new NotFound("User not found");
  if (!user.isVerified || user.status !== "approved")
    throw new BadRequest("الحساب غير مفعل او لم يتم التحقق من البريد الالكتروني");
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await db
    .delete(emailVerifications)
    .where(eq(emailVerifications.userId, user.id));

  await db
    .insert(emailVerifications)
    .values({ code: code, createdAt: new Date(), userId: user.id });
  await sendEmail(
    email,
    "Password Reset Code",
    `Your reset code is: ${code}\nIt will expire in 2 hours.`
  );

  SuccessResponse(res, { message: "الكود المرسل للبريد الالكتروني" }, 200);
};

export const verifyCode = async (req: Request, res: Response) => {
  const { email, code } = req.body;
  const [user] = await db.select().from(users).where(eq(users.email, email));
  const [rowcode] = await db
    .select()
    .from(emailVerifications)
    .where(eq(emailVerifications.userId, user.id));
  if (!user || rowcode.code !== code) {
    throw new BadRequest("الكود غير صحيح");
  }
  SuccessResponse(res, { message: "تم التحقق من البريد الالكتروني" }, 200);
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) throw new NotFound("User not found");
  const [rowcode] = await db
    .select()
    .from(emailVerifications)
    .where(
      and(
        eq(emailVerifications.userId, user.id),
        eq(emailVerifications.code, code)
      )
    );
  if (!rowcode) throw new BadRequest("Invalid reset code");

  const hashed = await bcrypt.hash(newPassword, 10);

  await db
    .update(users)
    .set({ hashedPassword: hashed })
    .where(eq(users.id, user.id));

  await db
    .delete(emailVerifications)
    .where(eq(emailVerifications.userId, user.id));

  SuccessResponse(res, { message: "تم تغيير كلمة السر بنجاح" }, 200);
};


export const resendVerificationCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  // 1) البحث عن المستخدم عبر الإيميل
  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, email),
  });

  if (!user) {
    throw new NotFound("الحساب غير موجود");
  }

  // 2) التأكد إنه لسه مش Verified
  if (user.isVerified) {
    throw new BadRequest("تم التحقق من البريد الإلكتروني بالفعل");
  }

  // 3) احذف كود قديم لو موجود
  await db.delete(emailVerifications).where(
    eq(emailVerifications.userId, user.id)
  );

  // 4) إنشاء كود جديد
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // 5) حفظ الكود الجديد
  await db.insert(emailVerifications).values({
    userId: user.id,
    code,
    createdAt: new Date(),
  });

  // 6) إرسال الكود عبر البريد
  await sendEmail(
    user.email,
    "Email Verification",
    `Your new verification code is ${code}`
  );

  SuccessResponse(res, { message: "تم إرسال كود جديد للبريد الالكتروني" }, 200);
};
