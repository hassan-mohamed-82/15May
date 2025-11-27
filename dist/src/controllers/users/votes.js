"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voteResult = exports.submitVote = exports.getVote = exports.getAllVotes = void 0;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const response_1 = require("../../utils/response");
const Errors_1 = require("../../Errors");
const BadRequest_1 = require("../../Errors/BadRequest");
const uuid_1 = require("uuid");
const getAllVotes = async (req, res) => {
    const votesList = await db_1.db
        .select()
        .from(schema_1.votes)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.votes.endDate, new Date()), (0, drizzle_orm_1.lte)(schema_1.votes.startDate, new Date())));
    (0, response_1.SuccessResponse)(res, { votes: votesList }, 200);
};
exports.getAllVotes = getAllVotes;
const getVote = async (req, res) => {
    const voteId = req.params.id;
    const userId = req.user.id;
    const [vote] = await db_1.db
        .select()
        .from(schema_1.votes)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.votes.id, voteId), (0, drizzle_orm_1.gte)(schema_1.votes.endDate, new Date())));
    if (!vote)
        throw new Errors_1.NotFound("vote not found");
    const [prevVote] = await db_1.db
        .select()
        .from(schema_1.userVotes)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userVotes.userId, userId), (0, drizzle_orm_1.eq)(schema_1.userVotes.voteId, voteId)));
    if (prevVote)
        throw new Errors_1.ConflictError("you voted before");
    const votesItemsList = await db_1.db
        .select()
        .from(schema_1.votesItems)
        .where((0, drizzle_orm_1.eq)(schema_1.votesItems.voteId, voteId));
    if (!votesItemsList)
        throw new BadRequest_1.BadRequest("Something Wrong...");
    (0, response_1.SuccessResponse)(res, { votename: vote.name, selectedList: votesItemsList }, 200);
};
exports.getVote = getVote;
const submitVote = async (req, res) => {
    const voteId = req.params.id;
    const userId = req.user.id;
    const { items } = req.body;
    const [vote] = await db_1.db.select().from(schema_1.votes).where((0, drizzle_orm_1.eq)(schema_1.votes.id, voteId));
    if (!vote)
        throw new Errors_1.NotFound("Vote not found");
    if (new Date() > new Date(vote.endDate))
        throw new Errors_1.ConflictError("Voting period has ended");
    const [existingVote] = await db_1.db
        .select()
        .from(schema_1.userVotes)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userVotes.userId, userId), (0, drizzle_orm_1.eq)(schema_1.userVotes.voteId, voteId)));
    if (existingVote)
        throw new Errors_1.ConflictError("You already voted for this vote");
    const voteItemsInDb = await db_1.db
        .select()
        .from(schema_1.votesItems)
        .where((0, drizzle_orm_1.eq)(schema_1.votesItems.voteId, voteId));
    const validItemIds = voteItemsInDb.map((item) => item.item);
    const invalid = items.some((item) => !validItemIds.includes(item));
    if (invalid)
        throw new BadRequest_1.BadRequest("One or more selected items are invalid");
    const userVoteId = (0, uuid_1.v4)();
    await db_1.db.insert(schema_1.userVotes).values({
        id: userVoteId,
        userId,
        voteId,
    });
    const voteItemsInsert = items.map((item) => ({
        id: (0, uuid_1.v4)(),
        userVoteId,
        item: item,
    }));
    await db_1.db.insert(schema_1.userVotesItems).values(voteItemsInsert);
    (0, response_1.SuccessResponse)(res, { message: "Vote submitted successfully" }, 200);
};
exports.submitVote = submitVote;
const voteResult = async (req, res) => {
    const voteId = req.params.id;
    const userId = req.user.id;
    // نتائج التصويت
    const [results] = await db_1.pool.query("CALL GetVoteResults2(?)", [voteId]);
    const finalResult = results[0];
    if (!finalResult || finalResult.length === 0) {
        throw new Errors_1.NotFound("No vote results found");
    }
    // 1) هات user_vote.id للمستخدم
    const [userVote] = await db_1.pool.query("SELECT id FROM user_votes WHERE vote_id = ? AND user_id = ? LIMIT 1", [voteId, userId]);
    let votedItemIds = [];
    if (userVote.length) {
        const userVoteId = userVote[0].id;
        // 2) هات كل النصوص اللي المستخدم اختارها
        const [userVoteItems] = await db_1.pool.query("SELECT item FROM user_votes_items WHERE user_vote_id = ?", [userVoteId]);
        if (userVoteItems.length) {
            const selectedTexts = userVoteItems.map((row) => row.item);
            // 3) هات كل الـ item_ids اللي مطابقة للنصوص
            const [voteItemRows] = await db_1.pool.query(`SELECT id FROM votes_items WHERE vote_id = ? AND item IN (?)`, [voteId, selectedTexts]);
            votedItemIds = voteItemRows.map((row) => row.id);
        }
    }
    // 4) أضف isUserVoted لكل item
    const resultsWithFlag = finalResult.map((item) => ({
        ...item,
        isUserVoted: votedItemIds.includes(item.item_id),
    }));
    (0, response_1.SuccessResponse)(res, { results: resultsWithFlag }, 200);
};
exports.voteResult = voteResult;
