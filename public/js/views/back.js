window.WarehouseView = Backbone.View.extend({
    tagName: "div",

    className: "row",
  
    initialize: function () {
        this.render();
    },

    render: function () {
        var shelfs = this.model.models;
        var len = shelfs.length;
        for (var i = 0; i < len; i++) {
             $(this.el).append(new ShelfView({model: shelfs[i]}).render().el);
        }
        return this;
    }
});

window.ShelfView = Backbone.View.extend({	
    tagName: "div",

    className: "span3",

    render: function () {
	var boxes = this.model.get("boxes");
	var len = boxes.length;
	$(this.el).html('<table class="table table-bordered"><thead><th>' + this.model.get("name") + '</th></thead><tbody class = "boxes" ></tbody></table>');
        for (var i = 0; i < len; i++) {
	    var newBox = new Box(boxes[i]);
            $(".boxes", this.el).append(new BoxView({model: newBox}).render().el);
	}
        return this;
    }
});

window.BoxView = Backbone.View.extend({
    tagName: "tr",
    className: "success",
    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }
});
