const { fDate } = require("../../utils/server");

module.exports.mapResponseUserList = function (userList) {
    return userList.map((user) => {
        return {
            id: user.id,
            groupId: user.groupId,
            fullName: user.fullName,
            readerCode: user.readerCode,
            photoURL: user.photoURL,
            phone: user.phone,
            birthday: fDate(user.birthday),
            gender: user.gender,
            address: user.address,
            email: user.email,
            readerDes: user.readerDes,
            cardId: user.cardId,
            cardDate: fDate(user.cardDate),
            cardAddress: user.cardAddress,
            cardAddress: user.cardAddress,
            groupName: user.readerGroup?.groupName || null,
            className: user.classHasUser[0]?.class?.className || null,
            year: user.classHasUser[0]?.class?.schoolYear?.year || null,
        };
    });
};

module.exports.mapResponseUserItem = function (user) {
    return {
        id: user.id,
        groupId: user.groupId,
        fullName: user.fullName,
        readerCode: user.readerCode,
        photoURL: user.photoURL,
        phone: user.phone,
        birthday: fDate(user.birthday),
        gender: user.gender,
        address: user.address,
        email: user.email,
        readerDes: user.readerDes,
        cardId: user.cardId,
        cardDate: fDate(user.cardDate),
        cardAddress: user.cardAddress,
        cardAddress: user.cardAddress,
        groupName: user.readerGroup?.groupName || null,
        groupId: user.readerGroup?.id,
        className: user.classHasUser[0]?.class?.className || null,
        classId: user.classHasUser[0]?.class?.id || null,
        year: user.classHasUser[0]?.class?.schoolYear?.year || null,
    };
};
