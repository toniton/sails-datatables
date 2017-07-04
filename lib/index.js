/**
 * Adds support for count blueprint and binds :model/count route for each RESTful model.
 */

var _ = require('lodash');
var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
var policies = require('sails/lib/hooks/policies');
var util = require('sails-util');
var pluralize = require('pluralize');

module.exports = function (sails) {
    return {
        initialize: function (cb) {
            var policy = policies(sails);
            var config = sails.config.blueprints;
            var datatableCallback = _.get(sails.middleware, 'blueprints.datatable') || require('../api/blueprints/datatable');
            var columnsCallback = _.get(sails.middleware, 'blueprints.columns') || require('../api/blueprints/columns');
            policy.configure();
            policy.loadMiddleware(cb);
            var policyMap = policy.buildPolicyMap();

            sails.on('router:before', function () {
                _.forEach(sails.models, function (model) {
                    var controller = sails.middleware.controllers[model.identity];
                    if (!controller) return;
                    var baseRoute = [config.prefix, model.identity].join('/');
                    if (config.pluralize && _.get(controller, '_config.pluralize', true)) {
                        baseRoute = pluralize(baseRoute);
                    }

                    var actionPolicy = policyMap[model.identity];
                    if(!(_.isUndefined(actionPolicy))){
                        actionPolicy = policyMap[model.identity]['datatable'];
                        if (_.isUndefined(actionPolicy) ) {
                            actionPolicy = policyMap[model.identity]['*'];
                        }
                    }
                    if (_.isUndefined(actionPolicy)) {
                        actionPolicy = policyMap['*'];
                    }

                    var datatableRoute = baseRoute + '/datatable';
                    var datatableAction = actionPolicy.concat([datatableCallback]);

                    sails.router.bind(datatableRoute, datatableAction, 'GET', {controller: model.identity});
                    sails.router.bind(datatableRoute, datatableAction, 'POST', {controller: model.identity});

                    var columnsRoute = baseRoute + '/columns';
                    var columnsAction = actionPolicy.concat([columnsCallback]);
                    sails.router.bind(columnsRoute, columnsAction, 'GET', {controller: model.identity});
                });
            });
        }
    }
};
