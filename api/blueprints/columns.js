/**
 * Module dependencies
 */
var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
var DatatableService = require('../services/DatatableService');

module.exports = function datatable(req, res) {
    var model = actionUtil.parseModel(req);
    DatatableService.getColumns(model).then(function (data) {
        return res.ok({columns: data})
    }).catch(function (error) {
        return res.send(error)
    })
};
