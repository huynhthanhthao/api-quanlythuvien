const { fDate, customerURL } = require("../../utils/server");

module.exports.mapResponseSchool = function (school) {
    return {
        id: school.id,
        schoolName: school.schoolName,
        schoolDomain: school.schoolDomain,
        logo: customerURL(school.logo),
        address: school.address,
        phone: school.phone,
        email: school.email,
        representative: school.representative,
        schoolEmailSMTPId: school.schoolEmailSMTPId,
        emailSMTP: school?.schoolEmailSMTP?.email || null,
        passwordSMTP: school?.schoolEmailSMTP?.password || null,
    };
};
