module.exports.mapResponseClassList = function (classList) {
    return classList.map((classItem) => {
        return {
            id: classItem.id,
            schoolYearId: classItem.schoolYearId,
            classCode: classItem.classCode,
            className: classItem.className,
            classDes: classItem.classDes,
            year: classItem?.schoolYear?.year,
            schoolYearDes: classItem?.schoolYear?.schoolYearDes,
        };
    });
};

module.exports.mapResponseClassItem = function (classItem) {
    return {
        id: classItem.id,
        schoolYearId: classItem.schoolYearId,
        classCode: classItem.classCode,
        className: classItem.className,
        classDes: classItem.classDes,
        year: classItem?.schoolYear?.year,
        schoolYearDes: classItem?.schoolYear?.schoolYearDes,
    };
};
