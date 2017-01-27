/**
 * Module dependencies
 */
var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
var DatatableService = require('../services/DatatableService');
module.exports = function datatable(req, res) {
    var model = actionUtil.parseModel(req);
    var options = req.allParams();
    DatatableService.getData(model, options).then(function (data) {
        return res.ok(data)
    }).catch(function (error) {
        return res.send(error)
    });
};
