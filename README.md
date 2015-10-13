# Ada Framework Documentation

[![Build Status](https://travis-ci.org/brainspills/ada-framework.svg?branch=master)](https://travis-ci.org/brainspills/ada-framework)

**Ada is an API development framework written in NodeJS and Restify aimed to help developers build a standard REST API.**

Ada framework aims to minimize coding by providing flexible functionality through configuration and definition. A REST API is basically a provider of resources (abstracted as models) through client requests (determined through routes). The framework heavily depends on model and route definitions to complete a client request.


For any request, the API returns any of the 3 basic types of responses: `collection`, `document`, and `controller`. `GET` requests are routed to either a collection or a document. `POST` and `PUT` requests which may require some additional logic are routed to controllers. The logic maybe defined within these controllers.


_The API has an auto generated reference through its base URL (`/`) and can be interacted with from an API browser at `/browser`._

**Requirements**
* NodeJS
* MongoDB

**Installation**

**`npm update`** to install framework dependencies. To start serving, issue a `node index.js` or `nodejs index.js` command. On startup, the application will prompt you to configure the server.

## 1. Models

Model definitions are located inside the `models` directory and each model should extend the core model class (`./core/model.js`).

### 1.1 Defining Models

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
      self.embed = {
        "<Embed Name>": {
          "model": "<String, Required. Model name of the embeddable collection>",
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

### 1.2 Loading Models

The `loadModel(model)` helper will return an instance of the model. The model  could be either of the following forms:

* A string `<model_name>` which will be loaded from `./http/models`
* An array `['<package_name>', '<model_name>']` which will be loaded from `./packages/<package_name>/models`

### 1.3 Model Methods

* **`all(page, callback)`** - List all documents in a page from a collection
* **`create(document, callback)`** - Create a single document in the collection
* **`delete(id, callback)`** - Remove a single document from the collection
* **`find(page, query, callback)`** - Query a collection in a page based on a query
* **`findOne(query, callback)`** - Query a collection based on a query, expect one document
* **`id(id, callback)`** - Retrieve a document from the collection by its id
* **`update(document, callback)`** - Update a single document by its id

***

## 2. Routing

Route definitions are located inside the `http/routes` directory.

### 2.1 Defining Routes

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

### 2.2 Collection Routing

To enable collection routing, set the following values in the route definition (along with the other properties). The route will automatically retrieve documents (a collection) within the bound model.

    {
      'method': 'get',
      'response': {
        'type': 'collection'
      },      
      'binding': {
        'model': '<model name>'
      }
    }

#### 2.2.1. Pagination

Setting a route's response type to `collection` will automatically enable it to be paged. To browse through pages within a collection, pass in a `page` query parameter in the request.

    /<route_name>?page=<page_number>


#### 2.2.2. Filters

Filters are automatically enabled for a route with the `collection` response type. To filter results from a collection, pass in a key-value pair of the keys you want to filter through the query parameter of the request.

    /<route_name>?<key1_in_collection>=<value>&<key2_in_collection>=<value>

The route can also be combined with the pager to browse through filtered collections.

    /<route_name>?page=<page_number>&<key1_in_collection>=<value>&<key2_in_collection>=<value>

### 2.3 Document Routing

To enable document routing, set the following values in the route definition (along with the other properties). The route will automatically retrieve a document based on the provided ID (`:id`). The `:id` is a required segment of the route.

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

#### 2.3.1. Embedding Related Collections

To retrieve a document with an embedded related collection (one to many relation), set the following values in the route definition (along with the other properties). The value passed to the `binding.embed` key should match one of the embed keys defined in the parent model - defined in this route through `binding.model`.

    {    
      'binding': {
        'model': '<model name>',
        'embed': '<embed name>
      }
    }

Since a collection is also returned through the route, pagination and filters are automatically enabled as well.

    /<route_name>/<document_id>/<embed_name>?page=<page_number>&<key1_in_collection>=<value>&<key2_in_collection>=<value>

### 2.4 Controller Routing

To route a request to a controller, set the following values in the route definition (along with the other properties). The value in the `binding.controller` property will have `./http/controllers` as its base path.

    {
      'response': {
        'type': 'controller',
      },
      'binding': {
         'controller': '<path/to/controller>',
         'action': '<action name>'
      }
    }

#### Defining Controllers

Controller definitions are located inside the `http/controllers` directory and each controller should extend the core controller class (`./core/controller.js`).

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

#### 2.4.1 Create Action

For routes that insert a document in a collection, a reserved action name of `create` is available for the controller routing. This will create a document in the bound model after it has been validated using the model's schema constraints. Set the following values in the route definition (along with the other properties) to enable the controller/create action.

    {
      'method': 'post',
        'binding': {
          'action': 'create',
          'model': '<model name>' 
        }
      }
    }

#### 2.4.2 Update Action

For routes that edit a document in a collection, a reserved action name of `update` is available for the controller routing. This will update a document from the bound model after it has been validated using the model's schema constraints based on the provided ID (`:id`). Set the following values in the route definition (along with the other properties) to enable the controller/update action.The `:id` is a required segment of the route.

    {
      'route': '/<route_name>/:id', 
      'method': 'put',
      'binding': {
        'action': 'update',
        'model': '<model name>' 
      }
    }

#### 2.4.3 Delete Action

For routes that remove a document from a collection, a reserved action name of `delete` is available for the controller routing. This will delete a document from the bound model based on the provided ID (`:id`) and will cascade to related collections as well. Set the following values in the route definition (along with the other properties) to enable the controller/delete action.The `:id` is a required segment of the route.

    {
      'route': '/<route_name>/:id', 
      'method': 'delete',
      'binding': {
        'action': 'delete',
        'model': '<model name>' 
      }
    }

***

## 3. Authentication

***

## 4. Hooks

***

## 5. Packaging

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

* **`GET /<resources>`** - to retrieve the collection
* **`GET /<resource>/:id`** - to retrieve a document
* **`POST /<resource>`** - to create a document
* **`PUT /<resource>/:id`** - to update a document
* **`DELETE /<resource>/:id`** - to delete a document

### 6.3 Auto Generating Controllers

    npm run-script generate:controller -- <controller name> <comma separated list of actions> <optional: package name>
    OR
    node tools/generate controller <controller name> <comma separated list of actions> <optional: package name>

This tool will automatically generate a controller definition based from the provided name and list of actions.

***

## 7. Helpers

* **`getConfig(namespace, key)`** - Returns a configuration value
* **`hash(string)`** - Returns a hashed form of a string. A key for hashing is set from `.env` using the `SERVER_KEY` key
* **`isEmpty(object)`** - Tests the "emptiness" of a value. Returns `true` if the value is any of the following: `undefined`, `null`, `false`, `0`, zero length string or array, objects with no properties 
* **`loadModel(model)`** - Returns a new instance of a model

*** 

## 8. Under Development / Known Issues

* Standardization of error responses for unique validation fails
* Ensure data types for document create/update based on schema definition
* Validation for presence of related collection on document create/update
* Validation for document update
* Cascade of delete
* Implement scopes

A list of things to do can be collected using the `todo` tool.

    npm run-script todo
    OR 
    node tools/todo

Annotate the file line with a `//TODO: <description>` for it to display in the results.

*** 

## 9. Improvements

A list of stuff that may be needed to improve the framework

* Database abstraction
* Package "namespacing"
* Model, route, and controller modifier tool
