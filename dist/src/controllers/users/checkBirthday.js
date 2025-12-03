"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBirthdayToday = void 0;
const schema_1 = require("../../models/schema");
const db_1 = require("../../models/db");
const Errors_1 = require("../../Errors");
const drizzle_orm_1 = require("drizzle-orm");
const isBirthdayToday = async (req, res) => {
    if (!req.user?.id) {
        throw new Errors_1.UnauthorizedError("User not authenticated");
    }
    const id = req.user.id;
    const user = await db_1.db
        .select()
        .from(schema_1.users)
        .where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
    if (!user.length) {
        throw new Errors_1.NotFound("User not found");
    }
    if (!user[0].dateOfBirth) {
        throw new Errors_1.NotFound("User birthdate not found");
    }
    const birthdate = new Date(user[0].dateOfBirth);
    const today = new Date();
    const isBirthday = birthdate.getDate() === today.getDate() && birthdate.getMonth() === today.getMonth();
    res.json({
        success: true,
        isBirthday,
        message: isBirthday ? "Happy Birthday!" : "Not birthday today",
    });
};
exports.isBirthdayToday = isBirthdayToday;
