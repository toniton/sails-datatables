/**
 * Returns a promise of the data when found
 */
var _ = require('lodash');
module.exports.getData = function (model, options) {
    if (!model) {
        return new Promise(function (resolve, reject) {
            reject({ error: 'Model doesn\'t exist' });
        });
    }

    //possible column options as default
    var _columns = [{ data: '', name: '', searchable: false, orderable: false, search: { value: '' } }]

    //possible options data as default
    var _options = {
        draw: 0,
        columns: _columns,
        start: 0,
        length: 10,
        search: { value: '', regex: false },
        order: [{ column: 0, dir: 'asc' }]
    };

    //merge both Object, options and _options into _options
    _.assign(_options, options);

    //response format
    var _response = {
        draw: _options.draw,
        recordsTotal: 0,
        recordsFiltered: 0,
        iTotalRecords: 0,//legacy
        iTotalDisplayRecords: 0,//legacy
        data: []
    };

    //build where criteria
    var where = [], whereQuery = {}, select = [];

    if (_options.columns.length) {
        if (_options.columns[0].data != 0) {
            _options.columns.forEach(function (column, index) {
                if (column.searchable) {
                    if (!(column.search.value == "")) {
                        if (_.isPlainObject(column.search.value)) {
                            if ((column.search.value.from != "") && (column.search.value.to != "")) {
                                whereQuery[column.data] = {
                                    '>=': column.search.value.from,
                                    '<': column.search.value.to
                                };
                            }
                        } else {
                            whereQuery[column.data] = column.search.value;
                        }
                    }
                    if (_.includes(column.data, '.')) {//accesing object attribute for value
                        var col = column.data.substr(0, column.data.indexOf('.'));
                        var filter = {};
                        filter[col] = {
                            'contains': _options.search.value
                        };
                        //filter[column.data] = {
                        //    'contains': _options.search.value
                        //};
                        select.push(col);
                        where.push(filter);
                    } else {
                        var filter = {};
                        filter[column.data] = {
                            'contains': _options.search.value
                        };
                        select.push(column.data);
                        where.push(filter);
                    }
                }
            });
        }
        whereQuery["or"] = where;
    } else {
        whereQuery = {}
    }
    
    var sortColumn = {};
    _.forEach(_options.order, function (value, key) {
        console.log(value, key);
        var sortBy = _options.columns[value.column].data;
        if (_.includes(sortBy, '.')) {
            sortBy = sortBy.substr(0, sortBy.indexOf('.'));
        }
        var sortDir = value.dir == 'asc' ? 1 : 0;
        sortColumn[sortBy] = sortDir;
    });
    
    //find the database on the query and total items in the database data[0] and data[1] repectively
    return Promise.all([model.find({
        where: whereQuery,
        skip: +_options.start,
        limit: +_options.length,
        sort: sortColumn
    }).populateAll(), model.count(), model.count({
        where: whereQuery
    })]).then(function (data) {
        _response.recordsTotal = data[1];
        _response.recordsFiltered = data[2];
        _response.iTotalRecords = data[1];
        _response.iTotalDisplayRecords = data[2];
        _response.data = data[0];
        return _response
    }).catch(function (error) {
        return error
    });
};

module.exports.getColumns = function (model) {
    if (!model) {
        return new Promise(function (resolve, reject) {
            reject({ error: 'Model doesn\'t exist' });
        });
    }
    var attributes = _.keys(model._attributes);
    return new Promise(function (resolve, reject) {
        if (attributes) {
            resolve(attributes);
        } else {
            reject({ error: 'Error fetching attribute for this model' });
        }
    })
};