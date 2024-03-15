module.exports.mapResponsePermissionList = function (permissionList) {
    return permissionList.map((permission) => {
        return {
            id: permission.id,
            perDes: permission.perDes || null,
            perName: permission.perName || null,
            createdAt: permission.createdAt || null,
            roleList: permission?.permissionHasRole?.map((item) => ({
                id: item?.role?.id || null,
                roleName: item?.role?.roleName || null,
                roleCode: item?.role?.roleCode || null,
            })),
        };
    });
};

module.exports.mapResponsePermissionItem = function (permission) {
    return {
        id: permission.id,
        perDes: permission.perDes || null,
        perName: permission.perName || null,
        createdAt: permission.createdAt || null,
        roleList: permission?.permissionHasRole?.map((item) => ({
            id: item?.role?.id || null,
            roleName: item?.role?.roleName || null,
            roleCode: item?.role?.roleCode || null,
        })),
    };
};
