const DEFAULT_LIMIT = 10;

const DEFAULT_IMAGE_MAX_SIZE = 25;

const DEFAULT_FILE_MAX_SIZE = 25;

const ACCOUNT_STATUS = {
    ACTIVE: 1,
    BLOCKED: 2,
};

const GENDER = {
    MALE: 1,
    FEMALE: 2,
    OTHER: 3,
};

const AVATAR_URL_DEFAULT = "public/documents/images/users/default_avatar.png";

const BOOK_URL_DEFAULT = "public/documents/books/default_book.png";

const DEFAULT_YEAR_PUBLICATION = 1;

const DEFAULT_QUANTITY = 1;

const UNLIMITED = 1;

const BOOK_STATUS = {
    NEW: 1,
    LIKE_NEW: 2,
    GOOD: 3,
    USED: 4,
    WELL_USED: 5,
    DAMAGED: 6,
    UNUSABLE: 7,
};

const BOOK_CONDITION = {
    USING: 1,
    LOST: 2,
};

const LOAN_STATUS = {
    BORROWING: 1,
    PAID: 2,
    LOST: 3,
};

const PENALTY_TICKET_STATUS = {
    UNPAID: 1,
    PAID: 2,
};

const SETTING_STATUS = {
    ACTIVE: 1,
    NOT_ACTIVE: 2,
};

const DEFAULT_REGULAR_BORROW_COUNT = 4;

const ACTIVITY_TYPE = {
    CREATED: 1,
    UPDATED: 2,
    DELETED: 3,
    GIVE_BOOK_BACK: 4,
};

const USER_TYPE = {
    SYSTEM_USER: 1,
    READER: 2,
};

const QUERY_ONE_TYPE = {
    ID: 1,
    CODE: 2,
    DOMAIN: 3,
    SLUG: 4,
};

const FULL_ROLE_IDS = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
    32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
    61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76,
];

const TYPE_LOAN_FEES = {
    FIXED_PRICE: 1,
    BOOK_COVER_PERCENTAGE: 2,
};

const ACTION_TYPE = {
    AUTOMATIC: 1,
    MANUAL: 2,
};

module.exports = {
    ACCOUNT_STATUS,
    GENDER,
    DEFAULT_LIMIT,
    DEFAULT_IMAGE_MAX_SIZE,
    AVATAR_URL_DEFAULT,
    DEFAULT_YEAR_PUBLICATION,
    BOOK_URL_DEFAULT,
    BOOK_STATUS,
    DEFAULT_QUANTITY,
    UNLIMITED,
    LOAN_STATUS,
    BOOK_CONDITION,
    PENALTY_TICKET_STATUS,
    SETTING_STATUS,
    DEFAULT_REGULAR_BORROW_COUNT,
    ACTIVITY_TYPE,
    USER_TYPE,
    QUERY_ONE_TYPE,
    FULL_ROLE_IDS,
    TYPE_LOAN_FEES,
    ACTION_TYPE,
    DEFAULT_FILE_MAX_SIZE,
};
