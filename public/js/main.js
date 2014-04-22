var AppRouter = Backbone.Router.extend({

    routes: {
        ""                  : "home",
        "inbox"             : "inbox",
	"warehouse"	    : "warehouse",
	"statistics"	    : "statistics",
        "about"             : "about"
    },

    initialize: function () {
        this.headerView = new HeaderView();
        $('.header').html(this.headerView.el);
    },

    home: function (id) {
        if (!this.homeView) {
            this.homeView = new HomeView();
        }
        $('#content').html(this.homeView.el);
        this.headerView.selectMenuItem('home-menu');
    },

    inbox: function (id) {
        var box = new Box();
	box.fetch({success: function(){
	    var view = new InboxView({model:box});
            $("#content").html(view.el);
        }});
        this.headerView.selectMenuItem();
	socket.on('updates', function (data) {
	    if(data.model == 'inbox') { 
	        box.fetch({success: function(){
		    bootbox.alert("Inbox has been updated since last use!")
		    setTimeout(function() { bootbox.hideAll();}, 3000);
	            var view = new InboxView({model:box});
                    $("#content").html(view.el);
                }});

	    }
        });
    },
    
    warehouse: function (id) {
        var warehouse = new Warehouse();
	warehouse.fetch({success: function(){
            $("#content").html(new WarehouseView({model: warehouse}).el);
        }});
        this.headerView.selectMenuItem();
	socket.on('updates', function (data) {
	    if(data.model == 'warehouse') { 
	        warehouse.fetch({success: function(){
		    bootbox.alert("Warehouse has been updated since last use!");
		    setTimeout(function() { bootbox.hideAll();}, 3000);
	            var view = new WarehouseView({model:warehouse});
                    $("#content").html(view.el);
                }});
	    }
        });
    },

    about: function () {
        if (!this.aboutView) {
            this.aboutView = new AboutView();
        }
        $('#content').html(this.aboutView.el);
        this.headerView.selectMenuItem('about-menu');
    }

});

utils.loadTemplate(['HomeView', 'HeaderView', 'InboxView', 'BoxView','ShelfStatisticsView','AboutView'], function() {
    app = new AppRouter();
    Backbone.history.start();
});
