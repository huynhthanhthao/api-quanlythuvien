const { fDate } = require("../../utils/server");

module.exports.mapResponseAccountList = function (accountList) {
    return accountList.map((account) => {
        return {
            id: account.id,
            username: account.username,
            status: account.status,
            createdAt: fDate(account.createdAt),
            updatedAt: fDate(account.updatedAt),
            userId: account?.user?.id || null,
            fullName: account?.user?.fullName || null,
            photoURL: account?.user?.photoURL || null,
            phone: account?.user?.phone || null,
            birthday: fDate(account?.user?.birthday) || null,
            email: account?.user?.email || null,
            perName: account?.permission?.perName || null,
            role:
                account?.accountHasRole?.map((item) => ({ roleId: item?.role?.id, roleName: item?.role?.roleName })) ||
                [],
        };
    });
};

module.exports.mapResponseAccountItem = function (account) {
    return {
        id: account.id,
        username: account.username,
        status: account.status,
        createdAt: fDate(account.createdAt),
        updatedAt: fDate(account.updatedAt),
        password: account.password,
        fullName: account?.user?.fullName || null,
        userId: account?.user?.id || null,
        photoURL: account?.user?.photoURL || null,
        phone: account?.user?.phone || null,
        birthday: fDate(account?.user?.birthday) || null,
        email: account?.user?.email || null,
        perName: account?.permission?.perName || null,
        perId: account?.permission?.id || null,
        role:
            [
                ...account?.accountHasRole?.map((item) => ({
                    roleId: item?.role?.id,
                    roleName: item?.role?.roleName,
                    roleCode: item?.role?.roleCode,
                })),
                ...(account?.permission?.permissionHasRole?.map((item) => ({
                    roleId: item?.role?.id,
                    roleCode: item?.role?.roleCode,
                })) || []),
            ] || [],
    };
};
