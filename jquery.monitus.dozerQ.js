(function($) {
	$.widget("monitus.dozerQ", {
		_operators: {
			"bool": [{"value": "=", "text": "is"}, {"value": "!=", "text": "is not"}],
			"bool-strict": [{"value": "=", "text": "is"}, {"value": "!=", "text": "is not"}],
			"float": [{"value": "=", "text": "equals"}, {"value": "!=", "text": "is not equal to"}, {"value": ">", "text": "is greater than"}, {"value": ">=", "text": "is greater than or equal to"}, {"value": "<", "text": "is smaller than"}, {"value": "<=", "text": "is smaller than or equal to"}],
			"float-strict": [{"value": "=", "text": "equals"}, {"value": "!=", "text": "is not equal to"}, {"value": ">", "text": "is greater than"}, {"value": ">=", "text": "is greater than or equal to"}, {"value": "<", "text": "is smaller than"}, {"value": "<=", "text": "is smaller than or equal to"}],
			"int": [{"value": "=", "text": "equals"}, {"value": "!=", "text": "is not equal to"}, {"value": ">", "text": "is greater than"}, {"value": ">=", "text": "is greater than or equal to"}, {"value": "<", "text": "is smaller than"}, {"value": "<=", "text": "is smaller than or equal to"}],
			"int-strict": [{"value": "=", "text": "equals"}, {"value": "!=", "text": "is not equal to"}, {"value": ">", "text": "is greater than"}, {"value": ">=", "text": "is greater than or equal to"}, {"value": "<", "text": "is smaller than"}, {"value": "<=", "text": "is smaller than or equal to"}],
			"string": [{"value": "=", "text": "equals"}, {"value": "!=", "text": "is not equal to"}, {"value": "*=", "text": "contains"}, {"value": "!*=", "text": "does not contain"}, {"value": "|=", "text": "starts with"}, {"value": "!|=", "text": "does not start with"}, {"value": "$=", "text": "ends with"}, {"value": "!$=", "text": "does not end with"}],
			"string-strict": [{"value": "=", "text": "is"}, {"value": "!=", "text": "is not"}],
		},
		
		options: {
			buttons: {}, // {"My Button": {"dozerQ-position": {"position": "before|after", "placeholder": "ui-dozerQ-new|..."}, ... (button specs)}}
			colors: [
				{"dark": {"background-color": "#5c9ccc", "border-color": "#0074cc", "color": "white"}, "light": {"background-color": "#cfdfea", "border-color": "#5c9ccc", "color": "black"}},
				{"dark": {"background-color": "#fbec88", "border-color": "#f9cf14", "color": "black"}, "light": {"background-color": "#faf6dc", "border-color": "#fbec88", "color": "black"}},
				{"dark": {"background-color": "#8bcc7c", "border-color": "#4bcd2f", "color": "black"}, "light": {"background-color": "#e2f6de", "border-color": "#8bcc7c", "color": "black"}},
				{"dark": {"background-color": "#ffcc4d", "border-color": "#ffb600", "color": "black"}, "light": {"background-color": "#fff2d1", "border-color": "#ffcc4d", "color": "black"}},
				{"dark": {"background-color": "#a56be2", "border-color": "#6e00e3", "color": "white"}, "light": {"background-color": "#d4c5e3", "border-color": "#a56be2", "color": "black"}}
			],
			fields: [], // [{(name: "defaults to id", )id:"", type: "string"|"bool"|"float"|"int", values: [{"value": null|"...", "text": "..."}, {group:"...", values: [{"value": null|"...", "text": "..."}, ...]}, ...]}, ...] a "null" values' value means "ask user"
			queries: [], // loadable queries: [{id: "...", name: "...", query:[{field: "", operator: "", value: ""}, "&|", {...}]}, ...]
			query: null // current query: {name: "", query:[{field: "", operator: "", value: ""}, "&|", {...}]}
		},
		
		_create: function() { // called only once per root element -- create stuff here
			var self = this;
			var options = self.options;
			var element = self.element;
			
			if(!options.fields || (options.fields.length == 0)) return;
			
			var html = '<form class="ui-dozerQ ui-widget">';
			html += '<div class="ui-corner-all">';
			html += '<div class="ui-dozerQ-toolbar ui-widget-header ui-corner-all">';
			html += '<div class="ui-dozerQ-column ui-dozerQ-left">';
			html += '<button class="ui-dozerQ-button ui-dozerQ-new">New Query</button>';
			html += '<button class="ui-dozerQ-button ui-dozerQ-load">Load Query</button>';
			html += '<button class="ui-dozerQ-button ui-dozerQ-save">Save Query</button>';
			html += '</div>'; // ui-dozerQ-column ui-dozerQ-left
			html += '<div class="ui-dozerQ-column ui-dozerQ-right">';
			html += '<button class="ui-dozerQ-button ui-dozerQ-add">Add Criterion</button>';
			html += '<button class="ui-dozerQ-button ui-dozerQ-search">Search</button>';
			html += '</div>'; // ui-dozerQ-column ui-dozerQ-right
			html += '<br class="ui-dozerQ-clear" />';
			html += '</div>'; // ui-dozerQ-toolbar
			html += '<ul class="ui-dozerQ-content"></ul>';
			html += '</div>'; // ui-corner-all
			html += '</form>';
			
			element.append(html);
			
			self._toolbar = element.find(".ui-dozerQ-toolbar");
			self._toolbar.find("button.ui-dozerQ-new").button({
				text: false,
				icons: {primary: "ui-icon-document"}
			}).click(function() {
				self._load(self._content);
				return false;
			});
			self._toolbar.find("button.ui-dozerQ-load").button({
				text: false,
				icons: {primary: "ui-icon-folder-open"}
			}).click($.proxy(self._open, self));
			self._toolbar.find("button.ui-dozerQ-save").button({
				text: false,
				icons: {primary: "ui-icon-disk"},
			}).click($.proxy(self._save, self));
			self._toolbar.find("button.ui-dozerQ-add").button({
				text: false,
				icons: {primary: "ui-icon-plusthick"}
			}).click($.proxy(function() {
				this.options.query.query.push("&");
				this.options.query.query.push({field: this.options.fields[0].id, operator: this._operators[this.options.fields[0].type][0].value, value: ""});
				this._load(this._content, this.options.query);
				return false;
			}, self));
			self._toolbar.find("button.ui-dozerQ-search").button({
				text: false,
				icons: {primary: "ui-icon-search"}
			}).click(function(event) { self._trigger('search', event, self.options.query); return false; });
			for(var label in options.buttons) {
				var specs = options.buttons[caption];
				var placeholder = self._toolbar.find("." + specs["dozerQ-position"].placeholder);
				if(placeholder.length > 0) {
					var name = label.toLowerCase().replace(/\s+/g, '-');
					var html = '<button class="ui-dozerQ-button ui-dozerQ-' + name + '">' + caption + '</button>';
					if(specs["dozerQ-position"].position.match(/before/i)) placeholder.before(html);
					else placeholder.after(html);
					self._toolbar.find(".ui-dozerQ-" + name).button(specs);
				}
			}
			
			self._content = element.find(".ui-dozerQ-content");
			if(typeof(self._content.sortable) == "function") {
				self._content.sortable({
					connectWith: "ul.ui-dozerQ-criterion",
					update: function(event, ui) {
						self._content.find("ul").each(function() {
							var list = $(this);
							if(list.children("li").length == 0) list.parent("li").remove();
						});
						self._commit();
						self._refresh();
					},
					start: function(event, ui) {
						ui.item.children(".ui-dozerQ-andor").hide();
						ui.item.nextAll("li:not(.ui-sortable-placeholder):first").children(".ui-dozerQ-andor").hide();
					},
					stop: function(event, ui) {
						self._refresh();
					}
				});
			}
			
			self._load(self._content, options.query);
		},
		_init: function() { // called each time the widget is called without arguments - refresh stuff here
			this._refresh();
		},
		_refresh: function() {
			var self = this;
			self._toolbar.find("button.ui-dozerQ-load").toggle(self.options.queries.length > 0);
			
			var colorize = function(list, level) {
				var colors = self._color(level);
				var items = list.children("li").removeClass("first last");
				items.children(".ui-dozerQ-box").css(colors.dark);
				items.children(".ui-dozerQ-andor").css(colors.light).show();
				list.children("li:first").addClass("first").children(".ui-dozerQ-andor").hide();
				list.children("li:last").addClass("last");
				
				items.children("ul.ui-dozerQ-criterion").each(function() {
					colorize($(this), level + 1);
				});
			};
			
			self._content.each(function(index, value) {
				colorize($(this), 0);
			});
		},
		_setOptions: function() { // _setOptions is called with a hash of all options that are changing
			// _super and _superApply handle keeping the right this-context
			this._superApply(arguments);
			this._refresh();
		},
		_setOption: function(key, value) { // _setOption is called for each individual option that is changing
			switch(key) {
				case "query":
					if(!value || (typeof(value) != "Object") || !value.name || !$.isArray(value.query)) return;
					break;
			}
			
			this._super(key, value);
			
			switch(key) {
				case "query":
					this._load(this._content, this.options.query);
					break;
			}
		},
		_destroy: function() {
			this.element.children(".dozerQ").remove();
		},
		
		_dialog: function(title, prompt, callback, buttons, askValue, choices) {
			// askValue: undefined OR null, means no field visible, else it is the defautl value
			// choices: [{value: "...", text: "..."}, ...] OR ["...", ...]
			
			var self = this;
			if(!self._alert_dlg) {
				$("body").append('<div id="dozerQ-alert-dlg" title=""><p></p><form><input type="text" /><select></select></form></div>');
				self._alert_dlg = $("#dozerQ-alert-dlg");
				self._alert_dlg.dialog({
					autoOpen: false,
					resizable: false,
					height: "auto",
					width: "auto",
					modal: true,
					buttons: {},
					open: function() {
						var field = $(this).find("input:visible:first");
						if(field.length > 0) field.val("").focus();
					}
				});
				self._alert_dlg.find("form").submit(function(){ self.dialog("widget").find(".ui-dialog-buttonset button:last").click(); });
			}
			buttons = buttons || ["OK"];
			var button_specs = {};
			for(var loop = 0; loop < buttons.length; loop++) {
				button_specs[buttons[loop]] = function(event) {
					if(typeof(callback) == "function") callback($(event.target).html(), self._alert_dlg.find(":input:visible:first").val());
					self._alert_dlg.dialog("close");
				};
			}
			self._alert_dlg.dialog("option", "buttons", button_specs);
			self._alert_dlg.dialog("option", "title", title);
			self._alert_dlg.find("p:first").html(prompt);
			self._alert_dlg.find("input").val(askValue ? askValue : "").toggle(((choices == null) || (typeof(choices) == "undefined")) && (askValue != null) && (typeof(askValue) != "undefined"));
			
			var html = '';
			if(choices) {
				for(var loop = 0; loop < choices.length; loop++) {
					if(!$.isPlainObject(choices[loop])) choices[loop] = {value: choices[loop], text: choices[loop]};
					html += '<option value="' + choices[loop].value + '">' + choices[loop].text + '</option>';
				}
			}
			self._alert_dlg.find("select").empty().append(html).val(askValue ? askValue : "").toggle(((choices != null) && (typeof(choices) != "undefined")) && (askValue != null) && (typeof(askValue) != "undefined"));
			
			self._alert_dlg.dialog("open");
		},
		_alert: function(title, prompt, callback, buttons) {
			this._dialog(title, prompt, callback, buttons);
		},
		_prompt: function(title, prompt, callback, buttons, askValue) {
			this._dialog(title, prompt, callback, buttons || ["Cancel", "OK"], askValue || "");
		},
		_confirm: function(title, prompt, callback, buttons) {
			this._dialog(title, prompt, callback, buttons || ["Yes", "No"]);
		},
		_color: function(level) {
			return this.options.colors[level % this.options.colors.length];
		},
		_query_index: function(name) {
			for(var loop = 0; loop < this.options.queries.length; loop++) {
				if(this.options.queries[loop].name == name) return loop;
			}
			return -1;
		},
		_criterion: function(wrapper) {
			return {field: wrapper.find(".ui-dozerQ-fields").val(), operator: wrapper.find(".ui-dozerQ-operators").val(), value: wrapper.find(".ui-dozerQ-value").val()};
		},
		_commit: function() {
			var self = this;
			var commit = function(list) {
				var query = [];
				
				list.children("li").each(function() {
					var item = $(this);
					query.push(item.find(".ui-dozerQ-andor :input[type=radio]:checked").val());
					
					var wrapper = item.children(".ui-dozerQ-criterion");
					if(wrapper.is("ul")) query.push(commit(wrapper));
					else query.push(self._criterion(wrapper));
				});
				
				return query;
			};
			this.options.query.query = commit(this._content);
			this._trigger("change");
		},
		_load: function(list, query) {
			list.empty();
			if(!query) query = {id:0, name: "", query: [{field: this.options.fields[0].id, operator: this._operators[this.options.fields[0].type][0].value, value: ""}]};
			if(typeof(query.id) != "undefined") {
				this.options.query = {id: query.id, name: query.name, query: query.query};
				query = query.query;
			}
			if(typeof(query[0]) != "string") {
				query.push(query[0]);
				query[0] = "&";
			}
			
			for(var loop = 0; loop < query.length; loop += 2) {
				var sub_query = $.isArray(query[loop + 1]);
				var item_class = '';
				if(loop == 0) item_class = 'ui-dozerQ-first';
				else if(loop >= (query.length - 1)) item_class = 'ui-dozerQ-last';
				if(item_class != '') item_class = ' class="' + item_class + '"';
				var uuid = (new Date()).getTime();
				
				var html = '<li' + item_class + '>';
				html += '<div class="ui-dozerQ-andor ui-dozerQ-box ui-widget ui-corner-all">';
				html += '<input type="radio" name="radio' + uuid + '" value="&"' + ((query[loop] == "&") ? ' checked="checked"' : '') + '> AND <br />';
				html += '<input type="radio" name="radio' + uuid + '" value="|"' + ((query[loop] == "|") ? ' checked="checked"' : '') + '> OR';
				html += '</div>';
				
				if(sub_query) {
					html += '<ul class="ui-dozerQ-criterion ui-dozerQ-box ui-corner-all"></ul>';
				} else {
					html += '<div class="ui-dozerQ-criterion ui-dozerQ-box ui-corner-all">';
					html += '<div class="ui-dozerQ-column ui-dozerQ-left">';
					html += '<select class="ui-dozerQ-fields">';
					for(var loop2 = 0; loop2 < this.options.fields.length; loop2++) html += '<option value="' + this.options.fields[loop2].id + '">' + (this.options.fields[loop2].name ? this.options.fields[loop2].name : this.options.fields[loop2].id) + '</option>';
					html += '</select>';
					html += '<select class="ui-dozerQ-operators"></select>';
					html += '<span class="ui-dozerQ-value-wrapper"></span>';
					html += '</div>'; // ui-dozerQ-column ui-dozerQ-left
					html += '<div class="ui-dozerQ-column ui-dozerQ-right">';
					html += '<button class="ui-dozerQ-button ui-dozerQ-group">Create Criterion Group</button>';
					html += '<button class="ui-dozerQ-button ui-dozerQ-delete">Delete Criterion</button>';
					html += '</div>'; // ui-dozerQ-column ui-dozerQ-right
					html += '<br class="ui-dozerQ-clear" />';
					html += '</div>'; // ui-dozerQ-box
				}
				
				html += '</li>';
				
				list.append(html);
				
				var item = list.children("li:last");
				if(sub_query) {
					var root = item.children("ul");
					this._load(root, query[loop + 1]);
					if(typeof(root.sortable) == "function") {
						root.sortable({
							connectWith: "ul.ui-dozerQ-content, ul.ui-dozerQ-criterion",
							update: function(event, ui) {
								root.find("ul").each(function() {
									var list = $(this);
									if(list.children("li").length == 0) list.parent("li").remove();
								});
								self._commit();
								self._refresh();
							},
							start: function(event, ui) {
								ui.item.children(".ui-dozerQ-andor").hide();
								ui.item.nextAll("li:not(.ui-sortable-placeholder):first").children(".ui-dozerQ-andor").hide();
							},
							stop: function(event, ui) {
								self._refresh();
							}
						});
					}
				} else {
					var self = this;
					var ui = function() {
						var field_id = item.find(".ui-dozerQ-fields").val();
						var field = null;
						for(var loop2 = 0; loop2 < self.options.fields.length; loop2++) {
							if(self.options.fields[loop2].id == field_id) {
								field = self.options.fields[loop2];
								break;
							}
						}
						if(!field) return;
						
						var type = field.type;
						var values = field.values;
						var operators = (values ? self._operators[type + "-strict"] : self._operators[type]);
						
						var html = '';
						for(var loop2 = 0; loop2 < operators.length; loop2++) html += '<option value="' + operators[loop2].value + '">' + operators[loop2].text + '</option>';
						item.find(".ui-dozerQ-operators").empty().append(html);
						
						var value = item.find(".ui-dozerQ-value").val() || "";
						var wrapper = item.find(".ui-dozerQ-value-wrapper").empty();
						if(values) {
							var fill_menu = function(values) {
								var html = '';
								for(var loop = 0; loop < values.length; loop++) {
									if(values[loop].group) {
										html += '<optgroup label="' + values[loop].group + '">';
										html += fill_menu(values[loop].values);
										html += "</optgroup>";
									} else html += '<option value="' + (values[loop].value === null ? "" : values[loop].value) + '"' + (values[loop].value === null ? ' ask="yes"' : "") + '>' + values[loop].text + '</option>';
								}
								return html;
							};
							wrapper.append('<select class="ui-dozerQ-value-menu">' + fill_menu(values) + '</select>');
						}
						wrapper.append('<input type="text" class="ui-dozerQ-value" value="" />');
						switch(type) {
							case "bool":
								value = ((value == "") ? "0" : "1");
								break;
							case "int":
								value = parseInt(value);
								if(isNaN(value)) value = "";
								break;
							case "float":
								value = parseFloat(value);
								if(isNaN(value)) value = "";
								break;
							default:
								break;
						}
						if(values) {
							item.find(".ui-dozerQ-value-menu").val(value).change(function() {
								var menu = $(this);
								var field = item.find(".ui-dozerQ-value");
								if(!menu.children("option:selected").attr("ask")) field.val(menu.val()).hide();
								else field.show();
							}).change();
						} else item.find(".ui-dozerQ-value").val(value);
					};
					
					var query_data = query[loop + 1];
					item.find(".ui-dozerQ-fields").val(query_data.field).change(ui);
					item.on("change", ":input", function() { self._commit(); });
					item.find(".ui-dozerQ-group").button({
						text: false,
						icons: {primary: "ui-icon-carat-2-e-w"}
					}).click(function() {
						var item = $(this).parents("li:first");
						var new_item = item.clone(true);
						item = item.find(".ui-dozerQ-criterion");
						item.before('<ul class="ui-dozerQ-criterion ui-dozerQ-box ui-corner-all"></ul>');
						var list = item.prev("ul");
						list.append(new_item)
						item.remove();
						self._commit();
						self._refresh();
						if(typeof(list.sortable) == "function") {
							list.sortable({
								connectWith: "ul.ui-dozerQ-content, ul.ui-dozerQ-criterion",
								update: function(event, ui) {
									list.find("ul").each(function() {
										var list = $(this);
										if(list.children("li").length == 0) list.parent("li").remove();
									});
									self._commit();
									self._refresh();
								},
								start: function(event, ui) {
									ui.item.children(".ui-dozerQ-andor").hide();
									ui.item.nextAll("li:not(.ui-sortable-placeholder):first").children(".ui-dozerQ-andor").hide();
								},
								stop: function(event, ui) {
									self._refresh();
								}
							});
						}
						return false;
					});
					item.find(".ui-dozerQ-delete").button({
						text: false,
						icons: {primary: "ui-icon-circle-close"}
					}).click(function() {
						var item = $(this).parents("li:first");
						var wrapper = item.children(".ui-dozerQ-criterion");
						self._confirm("Delete Criterion", "Are you sure you want to delete this criterion?<br />\n<br />\n" + $.toJSON(self._criterion(wrapper)), function(button) {
							if(button.match(/^yes$/i)) {
								item.remove();
								self._commit();
								self._refresh();
							}
						});
						return false;
					});
					ui();
					item.find(".ui-dozerQ-operators").val(query_data.operator);
					item.find(".ui-dozerQ-value").val(query_data.value);
				}
			}
			this._commit();
			this._refresh();
		},
		_open: function(event) {
			var names = [];
			for(var loop = 0; loop < this.options.queries.length; loop++) names.push(this.options.queries[loop].name);
			
			this._dialog("Saved Queries", "Select the query to load:", $.proxy(function(button, value) {
				if(button.match(/^load$/i)) {
					var index = this._query_index(value);
					if(index >= 0) this._load(this._content, this.options.queries[index]);
				}
			}, this), ["Cancel", "Load"], "", names);
			
			return false;
		},
		_save: function(event) {
			var query = {id: this.options.query.id, name: this.options.query.name, query: this.options.query.query};
			var self = this;
			this._prompt("Save As", "Save query as:", function(button, value) {
				if(button.match(/^save$/i) && (value != "")) {
					query.name = value;
					if((self._trigger("save", event, query) !== false) && (query.name != "")) {
						var index = self._query_index(query.name);
						if(index < 0) self.options.queries.push(query);
						else self.options.queries[index] = query;
						self._refresh();
					}
				}
			}, ["Cancel", "Save"], query.name);
			
			return false;
		}
	});
})(jQuery);
