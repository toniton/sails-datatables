<h1>
<a href="http://sailsjs.org"><img alt="Sails.js logo" src="http://balderdashy.github.io/sails/images/logo.png" title="Sails.js"/></a>
</h1>

# sails-datatables
This is a sailsjs library that helps you integrate datatables (Javascript datatables) with your sails app.

### Get Started
This library would help you easily query your sails endpoint for datasets that is easily understood by javascript datatables. It works like blueprint, so you can imagine how easy it must be to use. Try and testify!!!

### Installation
***With [node](http://nodejs.org) [installed](http://nodejs.org/en/download):***
```
npm install sails-datatables --save
```

### Endpoint
Just like blueprint actions a datatable action is automatically available on all models for you.
```Javascript
//assuming you have a model User
/user/datatable

//or if you have a prefix api
/api/user/datatable
```

### Policies
The datatable action automatically inherits its parent policies.
```Javascript
//in config/policies.js
module.exports.policies = {
    // all datatable route inherit this by default.
    '*': [
        'hasToken',
        'isAuthenticated',
        'ModelPolicy',
        'PermissionPolicy',
        'RolePolicy'
    ],
    
    // user/datatable route would not be bound by any policy
    UserController: [],
    
    // rabbit/datatable route would only inherit these two policies
    RabbitController: [
        'hasToken',
        'isAuthenticated'
    ],
    
    // payment/datatable route would only inherit this one policy
    PaymentController: {
        'datatable':[
          'isAuthenticated'
        ]
    }
}
```

### Usage
Send a `GET` or `POST` to `/model/datatable` or `/api/model/datatable` if you have the api prefix turned on in blueprint.
Please rely on [Datatable's Documentation](https://datatables.net/) for your implementation on the frontend.

```Javascript
        vm.dtOptions = {
            ...
            processing: true,
            serverSide: true,
            ajax: {
                //the url to the model/datatable
                url: 'http://#######/model/datatable',
                //You can use either a GET or POST verb
                type: 'GET',
                dataSrc: "aaData"
            },
            ...
        }
```

Nested data are automatically populated for you using the dot notations in your datatable options column definition
###### NB: Sails can only populate nested data two levels deep.

```Javascript
        vm.dtOptions = {
            ...
            aoColumns: [
                {
                    mData: "trackingNumber"
                },
                {
                    mData: "address.city"
                },
                {
                    mData: "status"
                },
                {
                    mData: "createdAt",
                    bSortable: true,
                    mRender: function (data, type, row, meta) {
                        return helper.getHumanReadableDate(row.createdAt);
                    }
                }
            ],
            ...
        }
```

### Advanced
You can add some extra data to your request to perform advanced functions like `filter` or `range` on a particular query. Cool rite `:-)`?
```Javascript
        {
            //filter only records that have a color of yellow
            data: "color",
            searchable:  true,
            search: {
                value: "yellow"
            }
        };
```
or
```Javascript
        {
            data: "createdAt",
            //Just make searchable true in your case, 
            //I only wanted to make sure the dates were good 
            //for the server before sending
            searchable: moment(vm.range.fromDate).isValid() && moment(vm.range.toDate).isValid(),
            search: {
                value: {
                    //Make sure you send dates in a format sails understand
                    //This method also works for integers and strings.
                    //Can be used to get data whose values fall within a range
                    from: helper.getISOServerReadableDate(vm.range.fromDate),
                    to: helper.getISOServerReadableDate(vm.range.toDate)
                }
            }
        }
```

### Feature Requests
If you have an idea for a new feature, please feel free to submit it as a pull request to this repository.

## Contributing
1. Fork it gently!
2. Create your feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Some commit message'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request :D
6. Your name shows up in credits

## Credits
* **Akinjiola Toni** *Toniton* [angular-paystack](https://github.com/toniton/angular-paystack)

## License
[MIT License](LICENSE.md) Copyright © 2016
