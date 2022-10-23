const router = require('express').Router();

const constants = require('../utils/constants');
const userMiddleware = require('../middlewares/user');
const resourceService = require('../service/resources');
const ExpressRouteHandler = require('./routeHandler');
const resourceTypeHandler = require('../resource_types');

router.use(userMiddleware.verifyUser);

router.get('/type', ExpressRouteHandler(async () => {
    const supportedResourceTypes = Object.keys(constants.resourceTypesEnum);
    return [{
        data: { types: supportedResourceTypes },
    }];
}));

router.get('/', ExpressRouteHandler(async (req) => {
    const userDetails = req.userData;

    const userGroupIds = userDetails.userResourceGroupsArray;
    if (!userGroupIds || !Array.isArray(userGroupIds) || userGroupIds.length === 0) {
        return [{
            status: 403,
            message: 'No User Groups found'
        }];
    }

    const allResources = await resourceService.getResourcesByResourceGroupIds(userGroupIds);
    return [{ data: { resources: allResources } }];
}));

router.delete('/relinquish', ExpressRouteHandler(async (req) => {
    const { resourceId } = req.body;
    if (!resourceId) {
        return [{ status: 400, message: 'Resource Id not present' }];
    }
    const userDetails = req.userData;

    const resourceDetailsArray = await resourceService.getResourceById(resourceId);
    if (!resourceDetailsArray || resourceDetailsArray.length === 0) {
        return [{ status: 404, message: 'Resource Not found' }];
    }
    const resourceDetails = resourceDetailsArray[0];

    const hasAdminAccess = resourceService.hasUserResourceAccess(req.userData, resourceDetails);
    if (!hasAdminAccess) {
        return [{ status: 401, message: 'You don\'t have access to resource' }];
    }

    await resourceTypeHandler.removeAccess(resourceDetails.type, userDetails.login, resourceDetails.path);
    await resourceService.createUserResourceMapping({
        resourceId,
        status: constants.accessStatusesEnum.RELINQUISHED,
        userId: userDetails._id.toString(),
        lastUpdatedByAdmin: userDetails._id.toString(),
    });
    return;
}));

module.exports = router;