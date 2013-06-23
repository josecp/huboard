define(["../../common/events/postal"], function(postal) {
    return Backbone.View.extend({
        tagName: "select",

        initialize: function(params) {
            this.options      = params.options;
            this.option_value = params.option_value;
            this.prompt       = params.prompt;

            this.state           = params.state || 1;
            this.condition       = params.condition;
            this.promptCondition = params.promptCondition;
        },

        events: {
            "change" : "publish"
        },

        render: function() {
            var self = this;
            var prompt  = self.prompt;
            var options = null;



            options = _.map(self.options, function(option) {return option[self.option_value];})

            options = _.map(options.sort(), function(option) {
                console.log("Added " + option)
                return self.optionTag(option, false);
            });

            if (prompt) { options.splice(0, 0, self.optionTag(prompt, true)); }

            $(this.el).html(options);

            return this;
        },

        publish: function(event) {
            var self = this;
            var selected = $(event.currentTarget).val();

            postal.publish("Filter.Simple", {
                id: this.cid,
                state: self.state,
                condition: function(value) {
                    if (selected === self.prompt) {
                        return self.promptCondition(value);
                    } else {
                        return self.condition(value, selected);
                    }
                }
            });
        },

        optionTag: function(value, selected) {
            return (selected ? "<option selected>" : "<option>") + value + "</option>"
        }
    });
});