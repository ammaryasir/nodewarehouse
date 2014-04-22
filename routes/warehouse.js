var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

//provide a sensible default for local development
mongodb_connection_string = 'mongodb://127.0.0.1:27017/' + 'nodewareouse';
//take advantage of openshift env vars when available:
if(process.env.OPENSHIFT_MONGODB_DB_URL){
	  mongodb_connection_string = process.env.OPENSHIFT_MONGODB_DB_URL + 'nodewareouse';
}

var server = new Server(mongodb_connection_string, 27017, {auto_reconnect: true});
db = new Db('nodewareouse', server, {safe: true});
db.authenticate('admin', 'MqwzSt7PM2Kr', function(err, res) {
		if(err)
			console.log("Connection");
		db.open(function(err, db) {
			if(!err) {
			console.log("Connected to 'warehousedb' database");
			db.collection('warehouse', {safe:true}, function(err, collection) {
				if (err) {
				console.log("The 'warehouse' collection doesn't exist. Creating it with sample data...");
				populateDB();
				}
				});
			}
			});
		});

exports.findInboxItems = function(req, res) {
    console.log('Retrieving inbox items.');
    db.collection('boxes', function(err, collection) {
        collection.findOne({'name': "inbox"}, function(err, inbox) {
    	    console.log('items = ' + inbox.items);
            res.send(inbox);
        });
    });
};

exports.updateInbox = function(req, res) {
    var inbox = req.body;
    var id = inbox._id;
    delete inbox._id;
    console.log(JSON.stringify(inbox));
    console.log("Updating Box: " + id);
    db.collection('boxes', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, inbox, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating Inbox: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(true);
            }
        });
    });
}

exports.getWarehouse = function(req, res) {
    console.log('Retrieving warehouse');
     db.collection('warehouse', function(err, collection) {
        collection.find().sort({'name':1}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.moveBox = function(req, res) {
    var shelf = req.body;
    db.collection('warehouse', function(err, collection) {
        collection.update({'name': shelf.name}, shelf, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error saving shelf: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' shelf(s) updated');
                res.send(true);
            }
        });
    });
};

exports.addBoxToShelf = function(req, res) {
    var box = req.body;
    var shelf = box.toShelf;
    var items = box.items;
    shelf = "Shelf " + shelf;

    delete box.toShelf;
    console.log(JSON.stringify(box));
    console.log("Saving Box to " + shelf);
    db.collection('warehouse', function(err, collection) {
        collection.update({'name': shelf, 'totalboxes' :{$lt : 20}}, {'$push' : {'boxes' : box}}, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error moving box: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
		if(!result) {
       		    res.send({'error':true});
		    return false;
		}
	
   		db.collection('warehouse', function(err, collection) {
		        collection.update({'name': shelf},{$inc : {"totalboxes" : 1} }, {new: true}, function(err, updated) {
		            if (err) {
  		              console.log('Error updating ' + shelf + err);
		                res.send({'error':'An error has occurred in updating totalboxes'});
		            } else {
				console.log(shelf + ' statistics updated' );
				res.send(true);
		            }
		        });
		});
            }
        });
    });
};


/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {

    var boxes = [
    {
	name: "inbox",
	items: 0, 
	boxesMoved: 0 
    }];
    var warehouse = [
    {
	name: "Shelf 1",
	totalboxes: 0,
	boxes : [],
    },
    {
	name: "Shelf 2",
	totalboxes: 0,
	boxes : [],
    },
    {
	name: "Shelf 3",
	totalboxes: 0,
	boxes : [],
    },
    {
	name: "Shelf 4",
	totalboxes: 0,
	boxes : [],
    },
    {
	name: "Shelf 5",
	totalboxes: 0,
	boxes : [],
    }
    ];
	

    db.collection('warehouse', function(err, collection) {
        collection.insert(warehouse, {safe:true}, function(err, result) {});
    });
    db.collection('boxes', function(err, collection) {
        collection.insert(boxes, {safe:true}, function(err, result) {});
    });


};
