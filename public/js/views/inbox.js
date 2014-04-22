window.InboxView = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    events: {
        "click .receive"   : "receiveBox",
        "click .save"      : "saveBox",
    },

    receiveBox: function(event) {
	var self = this;
	var items = Math.floor((Math.random()*100)+1) % 30;
	newitems = items + parseInt($('#itemcount').val());
	$("#itemcount").val(newitems);
        this.model.set({items: newitems});	
	this.model.save(null, {
            success: function (model) {
                self.render();
                app.navigate('inbox', false);
                utils.showAlert('Success!', 'Inbox updated successfully', 'alert-success');
            },
            error: function () {
                utils.showAlert('Error', 'An error occurred while trying to update inbox', 'alert-error');
            }
    	});
	socket.emit('dbupdate',{model:'inbox'});
   },
   
   saveBox: function(event) {
	event.preventDefault();
	var self = this;
	var newBox = new Box();
	
	var itemsRemaining = parseInt($('#itemcount').val());
	var itemsMoved = parseInt($('#storecount').val());
	var boxesMoved = parseInt(this.model.get('boxesMoved'));
	var newBoxId   = boxesMoved + 1;
        
	if (itemsRemaining == 0 || itemsMoved == 0) {
            utils.showAlert('No items to move', 'alert-error');
            return false;
        }
        if (itemsRemaining < itemsMoved) {
            utils.showAlert('Not enough items to move', 'alert-error');
            return false;
        }
	
	newBox.set({toShelf:$('#movetoshelf option:selected').val()});
        newBox.set({items: itemsMoved});	
        newBox.set({id: newBoxId});	
	
	newBox.save(null, {
            success: function (res) {
		if(res.get("error")) { 
                    utils.showAlert('Error', 'An error occurred while trying to move this box (maxLimit reached)', 'alert-error');
		    return false; 
		}
		self.model.set({items : itemsRemaining - itemsMoved, boxesMoved : newBoxId});
		self.model.save();
                self.render();
                app.navigate('inbox', false);
                utils.showAlert('Success!', 'Box moved successfully', 'alert-success');
		socket.emit('dbupdate',{'model':'warehouse'});
		socket.emit('dbupdate',{'model':'inbox'});
            },
            error: function () {
                utils.showAlert('Error', 'An error occurred while trying to move this box', 'alert-error');
            }
    	});
	

    }
});
