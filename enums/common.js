const DEFAULT_LIMIT = 10;

const DEFAULT_IMAGE_MAX_SIZE = 25;

const ACCOUNT_STATUS = {
    ACTIVE: 1,
    BLOCKED: 2,
};

const GENDER = {
    MALE: 1,
    FEMALE: 2,
    OTHER: 3,
};

const AVATAR_URL_DEFAULT = "/images/users/default_avatar.png";

const BOOK_URL_DEFAULT = "/images/books/default_book.png";

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

const FULL_ROLE_IDS = [];

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
};
