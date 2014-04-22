window.Box = Backbone.Model.extend({

    idAttribute: "_id",
    url: "/inbox",

    defaults: {
        items: 0,
        maxItems: 100
    }
});

window.BoxCollection = Backbone.Collection.extend({
    model: Box,
});


window.Shelf = Backbone.Model.extend({

    idAttribute: "_id",
   
    url: "/warehouse",
    
    initialize: function(){
	this.validators = {};

        this.validators.totalboxes = function (value) {
	    var ret = {};
	    if(value > 0)
		ret.isValidPop = true;
	    else {
                ret.isValidPop = false
		message: "Shelf empty";
	    }
	    if(value < 20)
		ret.isValidPush = true;
	    else {
                ret.isValidPush = false
		message: "Shelf max limit";
	    }
	    return ret;
        };
    },
  
    // TODO: Implement Backbone's standard validate() method instead.
    validatePush: function () {

        var messages = {};

        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValidPush === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ? {isValidPush: false, messages: messages} : {isValidPush: true};
    },
    
    validatePop: function () {

        var messages = {};

        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValidPop === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ? {isValidPop: false, messages: messages} : {isValidPop: true};
    },
    
    defaults: 
	function() {
            return {
		totalboxes: 0,
		maxBox: 20,
		boxes : function() {return new BoxCollection}, 
            };
        }
});


window.Warehouse = Backbone.Collection.extend({
    model: Shelf,
    url: "/warehouse"
});
