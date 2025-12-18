"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatedisappered = void 0;
const db_1 = require("../../models/db");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../models/schema");
const response_1 = require("../../utils/response");
const updatedisappered = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    // أضف validation
    if (!id) {
        return res.status(400).json({ error: "ID is required" });
    }
    if (typeof status !== "boolean") {
        return res.status(400).json({ error: "Status must be a boolean" });
    }
    const update = await db_1.db
        .update(schema_1.disappered)
        .set({ status })
        .where((0, drizzle_orm_1.eq)(schema_1.disappered.id, id));
    (0, response_1.SuccessResponse)(res, { message: "Disappered Updated Successfully" }, 200);
};
exports.updatedisappered = updatedisappered;
