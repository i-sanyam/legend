'use strict';

const Mongo = require('../../mongo');
const { requestStatusesEnum } = require('../../utils/constants');

const addUserRequest = async (userId, resourceId) => {
    return await Mongo.Requests.insertOne({
        requestRaisedBy: new Mongo.__ObjectId(userId),
        resourceId: new Mongo.__ObjectId(resourceId),
        status: requestStatusesEnum.OPEN,
    });
}

const getUserRequests = async (userId, status, resourceId) => {
    const findParams = {
        requestRaisedBy: new Mongo.__ObjectId(userId),
    };
    if (resourceId) {
        findParams.resourceId = new Mongo.__ObjectId(resourceId);
    }
    if (status) {
        findParams.status = status;
    }
    return await Mongo.Requests.find(findParams);
};

const getUserRequestById = async (params) => {
    const { userId, requestId, status, resourceId } = params;
    const findParams = {
        _id: new Mongo.__ObjectId(requestId),
        requestRaisedBy: new Mongo.__ObjectId(userId),
    };
    if (status) {
        findParams.status = status;
    }
    if (resourceId) {
        findParams.resourceId = new Mongo.__ObjectId(resourceId);
    }
    return await Mongo.Requests.find(findParams);
};

const deleteRequestById = async (params) => {
    const { userId, requestId } = params;
    return await Mongo.Requests.updateOne({
        _id: new Mongo.__ObjectId(requestId),
        requestRaisedBy: new Mongo.__ObjectId(userId),
    }, {
        $set: { status: requestStatusesEnum.DELETED },
    });
};

module.exports = {
    addUserRequest,
    deleteRequestById,
    getUserRequests,
    getUserRequestById,
};