![dozerQ icon](http://new.malus.ca/wp-content/uploads/2013/01/qDozer.png)
========

dozerQ is a jQuery-UI plugin that defines an interface to build queries. It can be used to 
build MySQL queries, JSON queries – all up to you. It does not use the queries in any way; 
it is simply about letting your users build their queries, and then your application takes 
that query and executes it.

See it in action on our demo page: http://www.malus.ca/dozerq/.

Usage
=====

You can start the tracking on any area of a page with something like:

```javascript
jQuery(function($) {
	var demo = $("#demo-zone");
	demo.dozerQ({
		fields:[ // define data fields
			{id: "id", type: "int"},
			{id: "name", name: "Full Name", type: "string"},
			{id: "role", type: "int", values: [
				{value: 0, text: "User"},
				{value: 1, text: "Administrator"},
				{value: null, text: "Other:"}
			]},
			{id: "food", name: "Food", type: "string", values: [
				{group: "Fruits", values:[
					{value: "apple", text: "Apple"},
					{value: "orange", text: "Orange"}
				]},
				{group: "Vegetables", values:[
					{value: "carrot", text: "Carrot"}
				]}
			]}
		],
		change: function(){ // on change handler
			$("#results-zone").hide();
		},
		search: function(event, data){ // search handler
			var results = $("#results-zone");
			results.children("div").html($.toJSON(data.query));
			results.show();
		}
	});
});
```

Styling
=======

See the included css file for classes you can override in your own css and get complete control over thw widget's look.
