module.exports.mapResponseFinePolicyList = function (finePolicyList) {
    return finePolicyList.map((finePolicy) => {
        return {
            id: finePolicy.id,
            bookName: finePolicy.book?.bookGroup?.bookName || null,
            bookCode: finePolicy.book?.bookCode || null,
            policyCode: finePolicy.finePolicy?.policyCode || null,
            policyName: finePolicy.finePolicy?.policyName || null,
        };
    });
};

module.exports.mapResponseFinePolicyItem = function (finePolicy) {
    return {
        id: finePolicy.id,
        bookName: finePolicy.book?.bookGroup?.bookName || null,
        bookId: finePolicy.book?.id || null,
        bookCode: finePolicy.book?.bookCode || null,
        policyId: finePolicy.finePolicy?.id || null,
        policyCode: finePolicy.finePolicy?.policyCode || null,
        policyName: finePolicy.finePolicy?.policyName || null,
    };
};
