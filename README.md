# Ada Framework Documentation

[![GitHub version](https://badge.fury.io/gh/brainspills%2Fada-framework.svg)](https://badge.fury.io/gh/brainspills%2Fada-framework)
[![Build Status](https://travis-ci.org/brainspills/ada-framework.svg?branch=master)](https://travis-ci.org/brainspills/ada-framework)

#### **Ada is an open source API development framework written in NodeJS and Restify aimed to help developers build a standard REST API.**

Ada framework aims to minimize coding by providing flexible functionality through configuration and definition. A REST API is basically a provider of resources (abstracted as models) through client requests (determined through routes). The framework heavily depends on model and route definitions to complete a client request.


For any request, the API returns any of the 3 basic types of responses: `collection`, `document`, and `controller`. `GET` requests are routed to either a collection or a document. `POST` and `PUT` requests which may require some additional logic are routed to controllers. The logic maybe defined within these controllers.


> _The API has an auto generated reference through its base URL (`/`) and can be interacted with from an API browser at `/browser`._

**Requirements**
* [NodeJS](https://nodejs.org/)
* [MongoDB](https://www.mongodb.org/)

**Installation**

**`npm update`** to install framework dependencies. To start serving, issue a `node index.js` or `nodejs index.js` command. On startup, the application will prompt you to configure the server.

## 1. Models

Model definitions are located inside the `models` directory and each model should extend the core model class (`./core/model.js`).

### 1.1 Defining Models

```javascript
var Model = extend('model');

function <Model Name>() {

  var self = this;
  Model.call(this);

  self.collectionName = "<String, Required. Collection name in MongoDB>";

  self.collectionURI = "<String, Required. URL segment to attach in HAL links for collections>";
  self.documentURI = "<String, Required. URL segment to attach in HAL links for documents>";

  self.schema = [
    {
      "key": "<String, Required. Field name in the collection>",
      "reference": "<String, Optional. If the field is a reference to another collection, define the referenced collection here using its model name.>",
      "constraints": {
        <Object, Optional. Data validation definition. Refer to validate.js documentation.>
      },
      "meta": {
        "label": "<String, Optional. Label of the field>",
        "desc": "<String, Optional. Description of the field>"
      }
    }
    ...
  ];

  /* Optional */
  self.identifier = "<String, Optional. Key name to be used as identifier if the model is using an identifier other than 'id'. A unique index will be automatically created for this key>";

  /* Optional */
  self.embed = {
    "<Embed Name>": {
      "model": "<String or Array, Required. Model name of the embeddable collection>",
      "key": "<String, Required. Local key referencing foreign collection ID>"
    }
    ...
  };

  /* Optional */
  self.indeces = {
    <Object, Optional. Indexing information of the collection. Refer to MongoDB documentation.>
  };

}

<Model Name>.prototype = Object.create(Model.prototype);
<Model Name>prototype.constructor = Model;

module.exports = <Model Name>;
```

### 1.2 Loading Models

The `loadModel(model)` helper will return an instance of the model. The model could be either of the following forms:

* A string `<model_name>` which will load `./http/models/<model_name>.js`
* An array `['<package_name>', '<model_name>']` which will load `./packages/<package_name>/models/<model_name>.js`

### 1.3 Model Methods

Method Name   | Description
--- | ---
**`all(page, callback)`** | List all documents in a page from a collection
**`create(document, callback)`** | Create a single document in the collection
**`delete(id, callback)`** | Remove a single document from the collection by its identifier
**`find(page, query, callback)`** | Query a collection in a page based on a query
**`findOne(query, callback)`** | Query a collection based on a query, expect one document
**`id(id, callback)`** | Retrieve a document from the collection by its identifier
**`update(id, document, callback)`** | Update a single document by its identifier

***

## 2. Routing

Route definitions are located inside the `http/routes` directory.

### 2.1 Defining Routes

```javascript
module.exports = [
  {
    "route": "<String, Required. Route URL. Refer to Restify documentation>",
    "method": "<String, Required. HTTP method to use: "get", "post", "put", "delete">",

    "response": {
      "type": "<String, Required. Type of response expected: "collection", "document", "controller">"
    },

    /* Optional */
    "request": {
      "insert": {
         "<Request parameter name>": "<String, Required. Type of value to be assigned: "auth.user.id">"
         ...
     } 
    },

    "binding": {
      "model": "<String or Array, Optional. Model name of which this route is attached. Required when response type is "collection" or "document". Also required when "binding.keys" is present>",
      "controller": "<String or Array, Optional. Controller name of where the request is to be routed. Required when response type is "controller">",
      "action": "<String, Optional. Action name of where the request is to be routed. Required when response type is controller. No need to define action if this is set to "create" or "update">",
      "embed": "<String, Optional. Embed a related collection to the model retrieved. The reference is defined by the "embed" property of the model definition>"
      "keys": [
        <Array of Strings, Optional. List of keys that the route is expecting>
      ]
    },

    "meta": {
      "desc": "<String, Optional. Description of the route. Will not be included in reference and browser if not set>",
      "live": <Boolean, Required. Activate or deactivate a route>,
      "noauth": <Boolean, Required. When set to false, the route will not require the Authorization credentials. Defaults to true>,
      "scope": [
        <Array of Strings, Optional. List of scope names that can access this route. Scope will be determined from the authorization credential>
      ]
    }
  }
  ...
];
```

### 2.2 Collection Routing

To enable collection routing, set the following values in the route definition (along with the other properties). The route will automatically retrieve documents (a collection) within the bound model.

```javascript
{
  'method': 'get',
  'response': {
    'type': 'collection'
  },      
  'binding': {
    'model': '<model name>'
  }
}
```

#### 2.2.1. Pagination

Setting a route's response type to `collection` will automatically enable it to be paged. To browse through pages within a collection, pass in a `page` query parameter in the request.

    /<route_name>?page=<page_number>


#### 2.2.2. Filters

Filters are automatically enabled for a route with the `collection` response type. To filter results from a collection, pass in a key-value pair of the keys you want to filter through the query parameter of the request.

    /<route_name>?<key1_in_collection>=<value>&<key2_in_collection>=<value>

The route can also be combined with the pager to browse through filtered collections.

    /<route_name>?page=<page_number>&<key1_in_collection>=<value>&<key2_in_collection>=<value>

### 2.3 Document Routing

To enable document routing, set the following values in the route definition (along with the other properties). The route will automatically retrieve a document based on the provided ID (`:id`). The `:id` is a required segment of the route - it will resolve to the key set as `identifier` in the model if it is set.

```javascript
{
  'route': '/<route_name>/:id',
  'method': 'get',
  'response': {
    'type': 'document'
  },      
  'binding': {
    'model': '<model name>'
  }
}
```

#### 2.3.1. Embedding Related Collections

To retrieve a document with an embedded related collection (one to many relation), set the following values in the route definition (along with the other properties). The value passed to the `binding.embed` key should match one of the embed keys defined in the parent model - defined in this route through `binding.model`.

```javascript
{    
  'binding': {
    'model': '<model name>',
    'embed': '<embed name>'
  }
}
```

Since a collection is also returned through the route, pagination and filters are automatically enabled as well.

    /<route_name>/<document_id>/<embed_name>?page=<page_number>&<key1_in_collection>=<value>&<key2_in_collection>=<value>

### 2.4 Controller Routing

To route a request to a controller, set the following values in the route definition (along with the other properties). The value in the `binding.controller` property will have `./http/controllers` as its base path.

```javascript
{
  'response': {
    'type': 'controller',
  },
  'binding': {
     'controller': '<path/to/controller>',
     'action': '<action name>'
  }
}
```

#### Defining Controllers

Controller definitions are located inside the `http/controllers` directory and each controller should extend the core controller class (`./core/controller.js`).

```javascript
var Controller = extend('controller');

function <Controller Name>(request, response) {

    var self = this;

    Controller.call(this, request, response); 

    self.<action name> = function() {
      /** Action definition **/
    };

    ...

}

<Controller Name>.prototype = Object.create(Controller.prototype);
<Controller Name>.prototype.constructor = Controller;

module.exports = <Controller Name>;
```

#### 2.4.1 Create Action

For routes that insert a document in a collection, a reserved action name of `create` is available for the controller routing. This will create a document in the bound model after it has been validated using the model's schema constraints. Set the following values in the route definition (along with the other properties) to enable the controller/create action.

```javascript
{
  'method': 'post',
    'binding': {
      'action': 'create',
      'model': '<model name>' 
    }
  }
}
```

#### 2.4.2 Update Action

For routes that edit a document in a collection, a reserved action name of `update` is available for the controller routing. This will update a document from the bound model after it has been validated using the model's schema constraints based on the provided ID (`:id`). Set the following values in the route definition (along with the other properties) to enable the controller/update action. The `:id` is a required segment of the route - it will resolve to the key set as `identifier` in the model if it is set.

```javascript
{
  'route': '/<route_name>/:id', 
  'method': 'put',
  'binding': {
    'action': 'update',
    'model': '<model name>' 
  }
}
```

#### 2.4.3 Delete Action

For routes that remove a document from a collection, a reserved action name of `delete` is available for the controller routing. This will delete a document from the bound model based on the provided ID (`:id`) and will cascade to related collections as well. Set the following values in the route definition (along with the other properties) to enable the controller/delete action.The `:id` is a required segment of the route - it will resolve to the key set as `identifier` in the model if it is set.

```javascript
{
  'route': '/<route_name>/:id', 
  'method': 'delete',
  'binding': {
    'action': 'delete',
    'model': '<model name>' 
  }
}
```

***

## 3. Authentication

An authentication package is enabled by default. The source files are located in `./packages/auth`. 

### 3.1. Configuring the Auth Package

In the `.env` file, set the following keys:

Key   | Description
--- | ---
**`AUTH_LOGIN_PATH`** | URL to login API users (default: `auth/login`)
**`AUTH_REGISTER_PATH`** | URL to register API users (default: `auth/register`)
**`AUTH_MODEL`** | Model name to use for user lookup (default: `user` - located in `./packages/auth/models/user.js`)
**`AUTH_IDENTITY_KEY`** | Key to use to identify a user such as a username or an email (default: `email`)
**`AUTH_CREDENTIAL_KEY`** | Key to use as a credential for user trying to obtain an access token (default: `password`)

### 3.2. Excluding Routes from Authentication

By default, all routes will need authentication. To exclude a route from authentication, add the following values in it's definition.

```javascript
{
  'meta': {
    'noauth': true
  }
}
```

### 3.3. Obtaining and Using Access Tokens (for API consumers)

After a user has successfully logged into the API through the set login path, the API will issue an access token (in JWT format) in its response. The token can now be used to authorize access to subsequent requests. The access token should be placed in the `Authorization` header of the request using the `bearer` authorization scheme.

    Authorization: bearer <access_token>

***

## 4. Hooks

Execution hooks are pieces of logic that are executed in predefined areas of the application. 

### 4.1. Defining Hooks

Hooks are defined in `http/hooks.js`.

```javascript
module.exports = [
  {
    'type' : '<hook type>',
    'callback': function(<callback arguments>) {
      /** Hook definition **/ 
    }
  }
  ...
];
```

### 4.2. Hook Types

Hook Type   | Callback Arguments   | Description
--- | --- | ---
**`preroute`** | `route, request, response` | Happens just before the request is routed. Return `false` from the callback to cancel the routing.

***

## 5. Packaging

The framework can be modularized by grouping related routes, controllers, models, hooks, services, and configs together in a package. Follow the following directory structure to create a package:

```
./
 |
 +-- packages/
      |
      +-- <package_name>
           |
           |-- config/
           |    |
           |    |-- <config_file>.js
           |    +-- ...
           |
           |-- http/
           |    |
           |    |-- controllers/
           |    |    | 
           |    |    |-- <controller_file>.js
           |    |    +-- ...
           |    | 
           |    |-- routes/
           |    |    |
           |    |    |-- <route_file>.js
           |    |    +-- ...
           |    |
           |    +-- hooks.js
           |
           |-- models/
           |    |
           |    |-- <model_file>.js
           |    +-- ...
           |
           +-- services/
                |
                |-- <service_file>.js
                +-- ...
```

To enable the package, include it the `packages` array in `./config/app.js`

```javascript
var packages = [
  '<package_name>',
  ...
]; 
```

***

## 6. Generators

### 6.1 Auto Generating Models

    npm run-script generate:model -- <model name> <comma separated list of keys> <optional: package name>
    OR
    node tools/generate model <model name> <comma separated list of keys> <optional: package name>

This tool will automatically generate a basic model definition based from the provided name and list of keys.

### 6.2 Auto Generating Resources

    npm run-script generate:resource -- <resource name> <comma separated list of keys> <optional: package name>
    OR
    node tools/generate resource <resource name> <comma separated list of keys> <optional: package name>

This tool will automatically generate a basic model definition based from the provided name and list of keys along with the following associated routes:

Route   | Description
--- | ---
**`GET /<resources>`** | to retrieve the collection
**`GET /<resource>/:id`** | to retrieve a document by its identifier
**`POST /<resource>`** | to create a document
**`PUT /<resource>/:id`** | to update a document by its identifier
**`DELETE /<resource>/:id`** | to delete a document by its identifier

### 6.3 Auto Generating Controllers

    npm run-script generate:controller -- <controller name> <comma separated list of actions> <optional: package name>
    OR
    node tools/generate controller <controller name> <comma separated list of actions> <optional: package name>

This tool will automatically generate a controller definition based from the provided name and list of actions.

***

## 7. Helpers

Helper   | Description
--- | ---
**`getConfig(namespace, key)`** | Returns a configuration value
**`getUTCStamp()`** | Returns the current timestamp in UTC
**`hash(string)`** | Returns a hashed form of a string. A key for hashing is set from `.env` using the `APP_KEY` key
**`isEmpty(object)`** | Tests the "emptiness" of a value. Returns `true` if the value is any of the following: `undefined`, `null`, `false`, `0`, zero length string or array, objects with no properties 
**`loadModel(model)`** | Returns a new instance of a model
**`toHttpDateTime(timestamp)`** | Returns a date and time string from a timestamp in RFC 2616 format

*** 

## 8. Under Development / Known Issues

A list of things to do can be collected using the `todo` tool.

    npm run-script todo
    OR 
    node tools/todo

Annotate the file line with a `//TODO: <description>` for it to display in the results.

*** 

## 9. Improvements

A list of stuff that may be needed to improve the framework

* Database abstraction
* Model, route, and controller modifier tool
