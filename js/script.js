// question alert
function Info() {
	alert("You can search literally, any. kind. of. food! Restaurants, Grocery Items, Ingridients, you name it! just type it in and hit search!");
}


// for easy accessing
var App = App || {};

(function () {
	
	window.App = {
		Models: {},
		Collections: {},
		Views: {},
		Helper: {}
	};
	
	App.Helper.template = function(id) {
		return _.template($('#' + id).html());
	}
	
	/*   */
	
	//New Food Item Model
	App.Models.Food = Backbone.Model.extend({
		
		defaults: {
			title: '',
			calories: 0
		},
		
		validate: function(attrs) {
			if(! $.trim(attrs.title)) {
				return 'Name Required';
			}
			if(! $.trim(attrs.calories)) {
				return 'Calories Required';
			}
		}
		
	});
	
	// Create Foods Collection
	App.Collections.Foods = Backbone.Collection.extend({
		model: App.Models.Food,
		// Implement localstorage
		localStorage: new Backbone.LocalStorage('FoodsLocal')
	});
	
	// New Food View
	App.Views.Food = Backbone.View.extend({
		
		tagName: 'li',
		className: 'selected-item',
		
		template: App.Helper.template('foodsListTemplate'),
		
		initialize: function() {
			this.model.on('destroy', this.remove, this);
		},
		
		events: {
			'click .delete': 'destroy'
		},
		
		destroy: function() {
			this.model.destroy();
		},
		
		remove: function() {
			if(this.$el.siblings().length === 0) {
				$('').shoe();
			}
			this.$el.remove();
		},
		
		render: function() {
			var template = this.template(this.model.toJSON());
			this.$el.html(template);
			return this;
		}
		
	});
	
	// Food Collection View
	App.Views.Foods = Backbone.View.extend({
		
		tagName: 'ul',
		className: 'user-list',
		
		initialize: function() {
			this.collection.on('add', this.addItem, this);
		},
		
		render: function() {
			this.collection.each(this.addItem, this);
			return this;
		},
		
		addItem: function(food) {
			var foodView = new App.Views.Food ({model: food});
			this.$el.append(foodView.render().el);
		}
		
	});
	
	// Add food View
	App.Views.AddFood = Backbone.View.extend({
		el: '#addFood',
		
		events: {
			'click #foodSubmit' : 'submit'
		},
		
		submit: function(e) {
			e.preventDefault();
			
			var newFoodName = $('#foodName').text().toString();
			var newFoodCal = parseInt($('#foodCal').text());
			
			if(isNaN(newFoodCal)) {
				return;
			}
			
			var food = new App.Models.Food({title: newFoodName, calories: newFoodCalorie});
			this.collection.add(food);
			
			food.save();
			
		}
		
	});
	
	App.Views.Total = Backbone.View.extend({
		el: '#total',
		
		initialize: function() {
			this.render();
			this.collection.on('update', this.render, this);
		},
		
		render: function() {
			var total = 0;
			
			this.collection.each(function(elem) {
				total += parseInt(elem.get('calories'));
				
			}, this);
			
			this.$el.text(total);
			
			return this;

		} 
		
	});
	
	App.Views.searchResults = Backbone.View.extend({
		element: {
			searchBtn: $('#searchBtn'),
			searchKey: $('#searchField'),
			searchFormAlert: $('#searchAlert')
		},
		
		initialize: function() {
			var self = this;
			this.element.searchBtn.on('click', function(e){
				e.preventDefault();
				
				var keyword = $.trim(self.element.searchKey.val()).toLowerCase();
				
				if(!keyword) {
					self.element.searchFormAlert.text('Not a Valid Keyword');
					return;
				}
				
				self.element.searchFormAlert.text('');
				
				self.getAjax(keyword);
				
			});
		},
		
		getAjax: function(keyword) {
			var self = this;
			var searchUL = $('.results-list');
			
			searchUL.html('');
			
			$.ajax({
				type: 'GET',
				dataType: 'json',
				cache: true,
				url: 'https://api.nutritionix.com/v1_1/search/' + keyword + '?results=0:5&fields=item_name,brand_name,item_id,nf_calories&appId=138d97a2&appKey=16dcfdb8ad18dd1af6382f5d2d0ea49d'
				
			}).done(function(data) {
				console.log(data);
				var food;
				var addBtn = $('#foodSubmit');
				var searchItemHTML = '';
				var results = data.hits;
				
				for(var i = 0; i < results.length; i++) {
					var result = data.hits[i];
					searchItemHTML += '<li class="searchItem">' + '<span class="searchName">' + result.fields.item_name + ', ' + result.fields.brand_name + '</span>' + '<span class="searchCal">' + result.fields.nf_calories + '</span>' + '<li>';
				}
				
				searchUL.html(searchItemHTML);
				var searchItem = $('.searchItem');
				
				searchItem.on('click', function() {
					addBtn.prop('disabled', false)
					var name = $(this).find('.searchName').text();
					var cal = $(this).find('.searchCal').text();
					$('#FoodName').text(name);
					$('#FoodCal').text(cal);
				});
				
			})
		}
		
	});
	
	var foodList = new App.Collections.Foods([]);
	foodList.fetch();
	new App.Views.AddFood({collection: foodList});
	var foodListView = new App.Views.Foods({collection: foodList});
	new App.Views.Total({collection: foodList});
	new App.Views.searchResults();
	
	$(".foodsList").html(foodListView.render().el);
	
})();

