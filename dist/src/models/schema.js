"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.banners = exports.members = exports.userNotifications = exports.notifications = exports.sliderImages = exports.sliders = exports.popUpsPages = exports.popUpsImages = exports.appPages = exports.userCompetition = exports.competitionsImages = exports.competitions = exports.complaints = exports.complaintsCategory = exports.reacts = exports.postsImages = exports.posts = exports.postsCategory = exports.userVotesItems = exports.userVotes = exports.votesItems = exports.votes = exports.emailVerifications = exports.users = exports.admins = exports.popUpsStatus = exports.userRoles = exports.userStatusEnum = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
// ENUMS
exports.userStatusEnum = ["pending", "approved", "rejected"];
exports.userRoles = ["member", "guest"];
exports.popUpsStatus = ["active", "disabled"];
// ADMINS
exports.admins = (0, mysql_core_1.mysqlTable)("admins", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    phoneNumber: (0, mysql_core_1.varchar)("phone_number", { length: 255 }).notNull(),
    email: (0, mysql_core_1.varchar)("email", { length: 255 }).notNull(),
    hashedPassword: (0, mysql_core_1.varchar)("hashed_password", { length: 255 }).notNull(),
    imagePath: (0, mysql_core_1.varchar)("imagePath", { length: 255 }),
});
// USERS
exports.users = (0, mysql_core_1.mysqlTable)("users", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    phoneNumber: (0, mysql_core_1.varchar)("phone_number", { length: 255 }),
    role: (0, mysql_core_1.mysqlEnum)(exports.userRoles).notNull(),
    email: (0, mysql_core_1.varchar)("email", { length: 255 }).unique().notNull(),
    hashedPassword: (0, mysql_core_1.varchar)("hashed_password", { length: 255 }).notNull(),
    purpose: (0, mysql_core_1.text)("purpose"),
    cardId: (0, mysql_core_1.varchar)("cardId", { length: 36 }),
    imagePath: (0, mysql_core_1.text)("image_path"),
    dateOfBirth: (0, mysql_core_1.date)("date_of_birth").notNull(),
    status: (0, mysql_core_1.mysqlEnum)(exports.userStatusEnum).default("pending").notNull(),
    fcmtoken: (0, mysql_core_1.varchar)("fcmtoken", { length: 255 }),
    isVerified: (0, mysql_core_1.boolean)("is_verified").default(false),
    rejectionReason: (0, mysql_core_1.text)("rejection_reason"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow(),
});
exports.emailVerifications = (0, mysql_core_1.mysqlTable)("email_verifications", {
    userId: (0, mysql_core_1.varchar)("user_id", { length: 36 }).primaryKey(),
    code: (0, mysql_core_1.varchar)("code", { length: 6 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
});
// VOTES
exports.votes = (0, mysql_core_1.mysqlTable)("votes", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    maxSelections: (0, mysql_core_1.int)("max_selections").notNull(),
    startDate: (0, mysql_core_1.date)("start_date").notNull(),
    endDate: (0, mysql_core_1.date)("end_date").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
});
exports.votesItems = (0, mysql_core_1.mysqlTable)("votes_items", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    voteId: (0, mysql_core_1.varchar)("vote_id", { length: 36 }).references(() => exports.votes.id),
    item: (0, mysql_core_1.varchar)("item", { length: 255 }).notNull(),
});
exports.userVotes = (0, mysql_core_1.mysqlTable)("user_votes", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    userId: (0, mysql_core_1.varchar)("user_id", { length: 36 })
        .notNull()
        .references(() => exports.users.id),
    voteId: (0, mysql_core_1.varchar)("vote_id", { length: 36 })
        .notNull()
        .references(() => exports.votes.id),
});
exports.userVotesItems = (0, mysql_core_1.mysqlTable)("user_votes_items", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    userVoteId: (0, mysql_core_1.varchar)("user_vote_id", { length: 36 })
        .notNull()
        .references(() => exports.userVotes.id),
    item: (0, mysql_core_1.varchar)("item", { length: 255 }).notNull(),
});
// POSTS
exports.postsCategory = (0, mysql_core_1.mysqlTable)("posts_category", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
});
exports.posts = (0, mysql_core_1.mysqlTable)("posts", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    categoryId: (0, mysql_core_1.varchar)("category_id", { length: 36 })
        .notNull()
        .references(() => exports.postsCategory.id),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
});
exports.postsImages = (0, mysql_core_1.mysqlTable)("posts_images", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    imagePath: (0, mysql_core_1.text)("image_path").notNull(),
    postId: (0, mysql_core_1.varchar)("post_id", { length: 36 })
        .notNull()
        .references(() => exports.posts.id),
});
// REACTS
exports.reacts = (0, mysql_core_1.mysqlTable)("reacts", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    userId: (0, mysql_core_1.varchar)("user_id", { length: 36 })
        .notNull()
        .references(() => exports.users.id),
    postId: (0, mysql_core_1.varchar)("post_id", { length: 36 })
        .notNull()
        .references(() => exports.posts.id),
}, (table) => [(0, mysql_core_1.unique)("unique_user_post_react").on(table.userId, table.postId)]);
// COMPLAINTS
exports.complaintsCategory = (0, mysql_core_1.mysqlTable)("complaints_category", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    description: (0, mysql_core_1.text)("description").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
});
exports.complaints = (0, mysql_core_1.mysqlTable)("complaints", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    content: (0, mysql_core_1.varchar)("explain", { length: 255 }).notNull(),
    seen: (0, mysql_core_1.boolean)("seen").default(false),
    categoryId: (0, mysql_core_1.varchar)("category_id", { length: 36 })
        .notNull()
        .references(() => exports.complaintsCategory.id),
    userId: (0, mysql_core_1.varchar)("user_id", { length: 36 })
        .notNull()
        .references(() => exports.users.id),
    date: (0, mysql_core_1.date)("date").notNull(),
    status: (0, mysql_core_1.boolean)("status").default(false).notNull(),
});
// COMPETITIONS
exports.competitions = (0, mysql_core_1.mysqlTable)("competitions", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    description: (0, mysql_core_1.text)("description").notNull(),
    mainImagepath: (0, mysql_core_1.text)("main_image_path").notNull(),
    startDate: (0, mysql_core_1.date)("start_date").notNull(),
    endDate: (0, mysql_core_1.date)("end_date").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
});
exports.competitionsImages = (0, mysql_core_1.mysqlTable)("competitions_images", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    imagePath: (0, mysql_core_1.text)("image_path").notNull(),
    competitionId: (0, mysql_core_1.varchar)("competition_id", { length: 36 })
        .notNull()
        .references(() => exports.competitions.id),
});
exports.userCompetition = (0, mysql_core_1.mysqlTable)("user_competition", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    userId: (0, mysql_core_1.varchar)("user_id", { length: 36 })
        .notNull()
        .references(() => exports.users.id),
    competitionId: (0, mysql_core_1.varchar)("competition_id", { length: 36 })
        .notNull()
        .references(() => exports.competitions.id),
    dateOfBirth: (0, mysql_core_1.date)("date_of_birth").notNull(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    gender: (0, mysql_core_1.mysqlEnum)(["male", "female"]).notNull(),
}, (table) => [
    (0, mysql_core_1.unique)("unique_user_competition").on(table.userId, table.competitionId),
]);
// APP PAGES & POPUPS
exports.appPages = (0, mysql_core_1.mysqlTable)("app_pages", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
});
exports.popUpsImages = (0, mysql_core_1.mysqlTable)("popups_images", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    imagePath: (0, mysql_core_1.varchar)("image_path", { length: 255 }).notNull(),
    startDate: (0, mysql_core_1.date)("start_date").notNull(),
    endDate: (0, mysql_core_1.date)("end_date").notNull(),
    status: (0, mysql_core_1.mysqlEnum)(exports.popUpsStatus).default("active").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
});
exports.popUpsPages = (0, mysql_core_1.mysqlTable)("popups_pages", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    imageId: (0, mysql_core_1.varchar)("image_id", { length: 36 })
        .notNull()
        .references(() => exports.popUpsImages.id),
    pageId: (0, mysql_core_1.varchar)("page_id", { length: 36 })
        .notNull()
        .references(() => exports.appPages.id),
});
exports.sliders = (0, mysql_core_1.mysqlTable)("sliders", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }),
    status: (0, mysql_core_1.boolean)("status").default(true),
    order: (0, mysql_core_1.int)("arrange").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
});
exports.sliderImages = (0, mysql_core_1.mysqlTable)("slider_images", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    slider_id: (0, mysql_core_1.varchar)("slider_id", { length: 36 })
        .notNull()
        .references(() => exports.sliders.id),
    image_path: (0, mysql_core_1.text)("image_path").notNull(),
});
exports.notifications = (0, mysql_core_1.mysqlTable)("notifications", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    body: (0, mysql_core_1.text)("body").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
});
exports.userNotifications = (0, mysql_core_1.mysqlTable)("user_notifications", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    userId: (0, mysql_core_1.varchar)("user_id", { length: 36 })
        .notNull()
        .references(() => exports.users.id),
    notificationId: (0, mysql_core_1.varchar)("notification_id", { length: 36 })
        .notNull()
        .references(() => exports.notifications.id),
    status: (0, mysql_core_1.mysqlEnum)(["unseen", "seen"]).default("unseen").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
});
exports.members = (0, mysql_core_1.mysqlTable)("members", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    photo: (0, mysql_core_1.text)("photo").notNull(),
    number: (0, mysql_core_1.int)("number").notNull(),
    description: (0, mysql_core_1.text)("description").notNull(),
    layer: (0, mysql_core_1.int)("layer").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
});
exports.banners = (0, mysql_core_1.mysqlTable)("banners", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey(),
    imagePath: (0, mysql_core_1.text)("image_path").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
});
