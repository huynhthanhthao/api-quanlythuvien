const { fDate, customerURL } = require("../../utils/server");

module.exports.mapResponseRegistrationList = function (registrationList) {
    return registrationList.map((registration) => {
        return {
            id: registration.id,
            feeId: registration.feeId,
            fullName: registration.fullName,
            cardId: registration.cardId,
            email: registration.email,
            phone: registration.phone,
            photo3x4: customerURL(registration.photo3x4),
            cardFrontPhoto: customerURL(registration.cardFrontPhoto),
            cardBackPhoto: customerURL(registration.cardBackPhoto),
            isConfirmed: registration.isConfirmed,
            fee: registration?.cardOpeningFee?.fee || 0,
            effect: registration?.cardOpeningFee?.effect || 0,
            feeDes: registration?.cardOpeningFee?.feeDes || 0,
        };
    });
};

module.exports.mapResponseRegistrationItem = function (registration) {
    return {
        id: registration.id,
        feeId: registration.feeId,
        fullName: registration.fullName,
        cardId: registration.cardId,
        email: registration.email,
        phone: registration.phone,
        photo3x4: customerURL(registration.photo3x4),
        cardFrontPhoto: customerURL(registration.cardFrontPhoto),
        cardBackPhoto: customerURL(registration.cardBackPhoto),
        isConfirmed: registration.isConfirmed,
        fee: registration?.cardOpeningFee?.fee || 0,
        effect: registration?.cardOpeningFee?.effect || 0,
        feeDes: registration?.cardOpeningFee?.feeDes || 0,
    };
};
