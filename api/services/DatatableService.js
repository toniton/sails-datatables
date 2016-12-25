/**
 * Returns a promise of the data when found
 */
var _ = require('lodash');
module.exports.getData = function (model, options) {
    //access the waterline instance of this model
    var MODEL = model;

    //if model dosen't exist
    if (!MODEL) {
        return new Promise((resolve, reject) => {
            reject({error: `Model: ${model} dosen't exist.`})
        })
    }

    var ATTR = Object.keys(MODEL._attributes);

    //possible column options as default
    var _columns = [{data: '', name: '', searchable: false, orderable: false, search: {value: ''}}]

    //possible options data as default
    var _options = {
        draw: 0,
        columns: _columns,
        start: 0,
        length: 10,
        search: {value: '', regex: false},
        order: [{column: 0, dir: 'asc'}]
    };

    //merge both Object, options and _options into _options
    Object.assign(_options, options);

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
        if (_options.columns[0].data == 0) {//type array
            /**
             * sails never responds with an array of literals or primitives like [["boy","foo"], ["girl","bar"]]
             * do set your column.data attribute from your datatable config
             */
        } else {//type Object
            _options.columns.forEach((column, index) => {
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
            })
        }
        whereQuery["or"] = where;
    } else {
        whereQuery = {}
    }

    var sortColumnData = _options.columns[+_options.order[0].column];
    var sortColumn = _options.columns[+_options.order[0].column].data;
    if (_.includes(sortColumn, '.')) {
        sortColumn = sortColumnData.data.substr(0, sortColumnData.data.indexOf('.'));
    }

    //find the database on the query and total items in the database data[0] and data[1] repectively
    return Promise.all([MODEL.find({
        where: whereQuery,
        skip: +_options.start,
        limit: +_options.length,
        sort: sortColumn + ' ' + _options.order[0].dir.toUpperCase() //_options.columns[+_options.order[0].column].data + ' ' + _options.order[0].dir.toUpperCase()
    }).populateAll(), MODEL.count()]).then(data => {
        _response.recordsTotal = data[1]//no of data stored
        _response.recordsFiltered = data[0].length//no of data after applying filter
        _response.iTotalRecords = data[1]//no of data stored (legacy)
        _response.iTotalDisplayRecords = data[0].length//no of data after applying filter (legacy)
        _response.data = data[0]//data

        return _response
    }).catch(error => {
        return error
    });
};

module.exports.getColumns = function (model) {
    //access the waterline instance of this model
    var MODEL = model;

    //if model dosen't exist
    if (!MODEL) {
        return new Promise((resolve, reject) => {
            reject({error: `Model: ${model} dosen't exist.`})
        })
    }

    var ATTR = Object.keys(MODEL._attributes);

    return new Promise((resolve, reject) => {
        if (ATTR) resolve(ATTR);
        else reject({error: `Error fetching attribute for this model`})
    })
};