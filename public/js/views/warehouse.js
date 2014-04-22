window.WarehouseView = Backbone.View.extend({
    tagName: "div",

    className: "row text-align:center",
  
    initialize: function () {
	this.render();
	var self = this;
        _.bindAll(this, "render");
        this.model.bind('change', self.render);
    },

    render: function () {
        var shelfs = this.model.models;
        var len = shelfs.length;
	$(this.el).html("");
        for (var i = 0; i < len; i++) {
	     shelfs[i].set({"count" : i});
             $(this.el).append(new ShelfView({model: shelfs[i]}).render().el);
        }
	$(this.el).append('<div class = "recyclebin span2 ui-droppable" id="recycle"> <h2> Delete </h2></div>');

        $(this.el).append('<div class="row" id = "stats"> </div>');
        $('#stats',this.el).append(new StatisticsView({model:this.model}).render().el);
	$('.shelf',this.el).droppable({
            drop: function( event, ui ) {

		var from = parseInt(ui.draggable.attr("shelf").toString()[6]) - 1;
		var to = parseInt($(this).attr("shelf").toString()[6]) - 1;
        	
		var check1 = shelfs[from].validatePop();
	        var check2 = shelfs[to].validatePush();
	        if (check1.isValidPop === false) {
       	    	    utils.displayValidationErrors(check1.messages);
            	    return false;
        	}
        	if (check2.isValidPush === false) {
            	    utils.displayValidationErrors(check2.messages);
            	    return false;
        	}
		var len2 = shelfs[from].get("totalboxes");
		var newBox = shelfs[from].get("boxes")[len2 - 1];
		shelfs[from].get("boxes").pop();
		shelfs[from].set({"totalboxes" : len2 - 1});
		shelfs[from].save();

		len3 = shelfs[to].get("totalboxes");
		shelfs[to].get("boxes").push(newBox);
		shelfs[to].set({"totalboxes" : len3 + 1});
		shelfs[to].save();	
     	        app.navigate('warehouse', false);
		socket.emit('dbupdate',{'model':'warehouse'});
            }
        });
        $('.recyclebin',this.el).droppable({
            drop: function( event, ui ) {
		var from = parseInt(ui.draggable.attr("shelf").toString()[6]) - 1;
		var len4 = shelfs[from].get("totalboxes");
		shelfs[from].get("boxes").pop();
		shelfs[from].set({"totalboxes" : len4 - 1});
		shelfs[from].save();
     	        app.navigate('warehouse', false);
		socket.emit('dbupdate',{'model':'warehouse'});
                return false;
	    }
	});
    },
});

window.ShelfView = Backbone.View.extend({	
    tagName: "div",

    className: "span2 shelf",

    render: function () {
	$(this.el).attr("shelf",this.model.get("name"));
	var boxes = this.model.get("boxes");
        $(this.el).html('<h2>'+this.model.get("name")+'</h2>');
	var len = boxes.length;
        for (var i = len-1; i >= 0; i--) {
	    var newBox = new Box(boxes[i]);
	    newBox.set({"shelf" : this.model.get("name")})
            $(this.el).append(new BoxView({model:newBox}).render().el);
	    if( i == len - 1) {
	        $('.box',this.el).draggable({	
		    revert: 'invalid',
	        });
	    }
	}
        return this;
    }
});

window.BoxView = Backbone.View.extend({
    tagName: "div",
    className: "box",
    render: function () {
	$(this.el).attr("shelf",this.model.get("shelf"));
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }
});

window.StatisticsView = Backbone.View.extend({
    tagName: "table",

    className: "table",

    initialize: function () {

    },

    render: function () {
        var shelfs = this.model.models;
        var len = shelfs.length;
        $(this.el).html('<thead><th> Warehouse Statistics</th></thead><tbody><tr class="shelf"></tr></tbody>');
        for (var i = 0; i < len; i++) {
             $(".shelf",this.el).append(new ShelfStatisticsView({model: shelfs[i]}).render().el);
        }
        return this;
    }
});


window.ShelfStatisticsView = Backbone.View.extend({

    tagName: "td",

    render: function () {
	var len = this.model.get("boxes").length;
	var maxItems = 0;
	var totalItems = 0;
	
        for (var i = 0; i < len; i++) {
	    if(this.model.get("boxes")[i].items > maxItems)
		maxItems = this.model.get("boxes")[i].items;
	    totalItems = totalItems + this.model.get("boxes")[i].items;
	}

        $(this.el).html(this.template(this.model.toJSON()));
        $(".stats",this.el).append('<tr><td> Maximum items in a box </td><td>' + maxItems  + '</td></tr>');
        $(".stats",this.el).append('<tr><td> Total items in a box </td><td>' + totalItems + '</td></tr>');
        $(".stats",this.el).append('<tr><td> Avegage items in a box </td><td>' + totalItems/ parseInt(this.model.get('totalboxes')) + '</td></tr>'	   );
        return this;
    }
});
