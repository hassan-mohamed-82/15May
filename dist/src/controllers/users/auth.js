"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendVerificationCode = exports.resetPassword = exports.verifyCode = exports.sendResetCode = exports.getFcmToken = exports.login = exports.verifyEmail = exports.signup = void 0;
const handleImages_1 = require("../../utils/handleImages");
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const uuid_1 = require("uuid");
const bcrypt_1 = __importDefault(require("bcrypt"));
const response_1 = require("../../utils/response");
const crypto_1 = require("crypto");
const Errors_1 = require("../../Errors");
const auth_1 = require("../../utils/auth");
const sendEmails_1 = require("../../utils/sendEmails");
const BadRequest_1 = require("../../Errors/BadRequest");
const signup = async (req, res) => {
    const data = req.body;
    const email = (data.email || "").trim().toLowerCase();
    if (!email) {
        throw new BadRequest_1.BadRequest("البريد الإلكتروني مطلوب");
    }
    data.email = email;
    // بناء شرط البحث ديناميكياً
    const conditions = [(0, drizzle_orm_1.eq)(schema_1.users.email, email)];
    if (data.phoneNumber) {
        conditions.push((0, drizzle_orm_1.eq)(schema_1.users.phoneNumber, data.phoneNumber));
    }
    const [existing] = await db_1.db
        .select()
        .from(schema_1.users)
        .where((0, drizzle_orm_1.or)(...conditions));
    // 👇 حالة إن اليوزر موجود
    if (existing) {
        const isVerified = existing.isVerified === true || existing.status === "approved";
        if (isVerified) {
            if (existing.email === email)
                throw new Errors_1.UniqueConstrainError("Email", "البريد الإلكتروني مستخدم بالفعل");
            if (data.phoneNumber && existing.phoneNumber === data.phoneNumber)
                throw new Errors_1.UniqueConstrainError("Phone Number", "رقم الجوال مستخدم بالفعل");
        }
        const code = (0, crypto_1.randomInt)(100000, 999999).toString();
        await db_1.db
            .delete(schema_1.emailVerifications)
            .where((0, drizzle_orm_1.eq)(schema_1.emailVerifications.userId, existing.id));
        await db_1.db.insert(schema_1.emailVerifications).values({
            userId: existing.id,
            code,
        });
        console.log("Signup: sending OTP to EXISTING user:", existing.email);
        await (0, sendEmails_1.sendEmail)(existing.email.trim().toLowerCase(), "Email Verification", `Your verification code is ${code}`);
        return (0, response_1.SuccessResponse)(res, {
            message: "هذا الحساب موجود لكنه غير مفعّل. تم إرسال كود تحقق جديد إلى بريدك الإلكتروني.",
            userId: existing.id,
        }, 200);
    }
    // 👇 لو مفيش يوزر قديم → إنشاء يوزر جديد
    const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
    const userId = (0, uuid_1.v4)();
    let imagePath = null;
    if (data.role === "member") {
        imagePath = await (0, handleImages_1.saveBase64Image)(data.imageBase64, userId, req, "users");
    }
    const code = (0, crypto_1.randomInt)(100000, 999999).toString();
    const newUser = {
        id: userId,
        name: data.name,
        phoneNumber: data.phoneNumber || null,
        role: data.role,
        cardId: data.cardId || null,
        email,
        hashedPassword,
        purpose: data.role === "guest" ? data.purpose : null,
        imagePath,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        status: "pending",
        createdAt: new Date(new Date().getTime() + 3 * 60 * 60 * 1000),
        updatedAt: new Date(new Date().getTime() + 3 * 60 * 60 * 1000),
    };
    if (!req.user) {
        await db_1.db.insert(schema_1.emailVerifications).values({
            userId,
            code,
        });
        console.log("Signup: sending OTP to NEW user:", email);
        await (0, sendEmails_1.sendEmail)(email, "Email Verification", `Your verification code is ${code}`);
    }
    else {
        newUser.status = "approved";
        newUser.isVerified = true;
    }
    await db_1.db.insert(schema_1.users).values(newUser);
    return (0, response_1.SuccessResponse)(res, {
        message: "تم التسجيل بنجاح من فضلك قم بتحقق من البريد الالكتروني",
        userId,
    }, 201);
};
exports.signup = signup;
const verifyEmail = async (req, res) => {
    const { userId, code } = req.body;
    const user = await db_1.db.query.users.findFirst({
        where: (u, { eq }) => eq(u.id, userId),
    });
    if (!user)
        throw new Errors_1.NotFound("User not found");
    const record = await db_1.db.query.emailVerifications.findFirst({
        where: (ev, { eq }) => eq(ev.userId, user.id),
    });
    if (!record || record.code !== code)
        throw new BadRequest_1.BadRequest("Invalid verification code");
    await db_1.db.update(schema_1.users).set({ isVerified: true }).where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
    await db_1.db
        .delete(schema_1.emailVerifications)
        .where((0, drizzle_orm_1.eq)(schema_1.emailVerifications.userId, user.id));
    res.json({ message: "تم التحقق من البريد الالكتروني" });
};
exports.verifyEmail = verifyEmail;
const login = async (req, res) => {
    const data = req.body;
    const { emailOrCardId, password } = data;
    // البحث إما بالإيميل أو الـ cardId
    const user = await db_1.db.query.users.findFirst({
        where: (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.users.email, emailOrCardId), (0, drizzle_orm_1.eq)(schema_1.users.cardId, emailOrCardId)),
    });
    if (!user) {
        throw new Errors_1.UnauthorizedError("الحساب غير موجود");
    }
    const isMatch = await bcrypt_1.default.compare(password, user.hashedPassword);
    if (!isMatch) {
        throw new Errors_1.UnauthorizedError("Invalid email/card ID or password");
    }
    if (user.status !== "approved") {
        throw new Errors_1.ForbiddenError("الحساب غير موافق على التسجيل. يرجى الانتظار حتى يتم الموافقة عليه");
    }
    if (!user.isVerified) {
        throw new Errors_1.ForbiddenError("قم بتحقق من البريد الالكتروني");
    }
    const token = (0, auth_1.generateToken)({
        id: user.id,
        name: user.name,
        role: user.role === "member" ? "approved_member_user" : "approved_guest_user",
    });
    (0, response_1.SuccessResponse)(res, { message: "تم تسجيل الدخول بنجاح ", token }, 200);
};
exports.login = login;
const getFcmToken = async (req, res) => {
    const { token } = req.body;
    const userId = req.user.id;
    await db_1.db.update(schema_1.users).set({ fcmtoken: token }).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
    res.json({ success: true });
};
exports.getFcmToken = getFcmToken;
const sendResetCode = async (req, res) => {
    const { email } = req.body;
    const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
    if (!user)
        throw new Errors_1.NotFound("User not found");
    if (!user.isVerified || user.status !== "approved")
        throw new BadRequest_1.BadRequest("الحساب غير مفعل او لم يتم التحقق من البريد الالكتروني");
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await db_1.db
        .delete(schema_1.emailVerifications)
        .where((0, drizzle_orm_1.eq)(schema_1.emailVerifications.userId, user.id));
    await db_1.db
        .insert(schema_1.emailVerifications)
        .values({ code: code, createdAt: new Date(), userId: user.id });
    await (0, sendEmails_1.sendEmail)(email, "Password Reset Code", `Your reset code is: ${code}\nIt will expire in 2 hours.`);
    (0, response_1.SuccessResponse)(res, { message: "الكود المرسل للبريد الالكتروني" }, 200);
};
exports.sendResetCode = sendResetCode;
const verifyCode = async (req, res) => {
    const { email, code } = req.body;
    const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
    const [rowcode] = await db_1.db
        .select()
        .from(schema_1.emailVerifications)
        .where((0, drizzle_orm_1.eq)(schema_1.emailVerifications.userId, user.id));
    if (!user || rowcode.code !== code) {
        throw new BadRequest_1.BadRequest("الكود غير صحيح");
    }
    (0, response_1.SuccessResponse)(res, { message: "تم التحقق من البريد الالكتروني" }, 200);
};
exports.verifyCode = verifyCode;
const resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;
    const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
    if (!user)
        throw new Errors_1.NotFound("User not found");
    const [rowcode] = await db_1.db
        .select()
        .from(schema_1.emailVerifications)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.emailVerifications.userId, user.id), (0, drizzle_orm_1.eq)(schema_1.emailVerifications.code, code)));
    if (!rowcode)
        throw new BadRequest_1.BadRequest("Invalid reset code");
    const hashed = await bcrypt_1.default.hash(newPassword, 10);
    await db_1.db
        .update(schema_1.users)
        .set({ hashedPassword: hashed })
        .where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
    await db_1.db
        .delete(schema_1.emailVerifications)
        .where((0, drizzle_orm_1.eq)(schema_1.emailVerifications.userId, user.id));
    (0, response_1.SuccessResponse)(res, { message: "تم تغيير كلمة السر بنجاح" }, 200);
};
exports.resetPassword = resetPassword;
const resendVerificationCode = async (req, res) => {
    const { email } = req.body;
    // 1) البحث عن المستخدم عبر الإيميل
    const user = await db_1.db.query.users.findFirst({
        where: (u, { eq }) => eq(u.email, email),
    });
    if (!user) {
        throw new Errors_1.NotFound("الحساب غير موجود");
    }
    // 2) التأكد إنه لسه مش Verified
    if (user.isVerified) {
        throw new BadRequest_1.BadRequest("تم التحقق من البريد الإلكتروني بالفعل");
    }
    // 3) احذف كود قديم لو موجود
    await db_1.db.delete(schema_1.emailVerifications).where((0, drizzle_orm_1.eq)(schema_1.emailVerifications.userId, user.id));
    // 4) إنشاء كود جديد
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // 5) حفظ الكود الجديد
    await db_1.db.insert(schema_1.emailVerifications).values({
        userId: user.id,
        code,
        createdAt: new Date(),
    });
    // 6) إرسال الكود عبر البريد
    await (0, sendEmails_1.sendEmail)(user.email, "Email Verification", `Your new verification code is ${code}`);
    (0, response_1.SuccessResponse)(res, { message: "تم إرسال كود جديد للبريد الالكتروني" }, 200);
};
exports.resendVerificationCode = resendVerificationCode;
