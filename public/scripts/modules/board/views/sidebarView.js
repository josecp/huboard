define(["../../common/events/postal","./filterView", "./selectView"], function (postal, filterView, selectView) {

    return Backbone.View.extend( {
        tagName: "ul",
        className: "filters",
        initialize: function (params) {
            this.milestones = params.data.milestones;
            this.login = params.params.login;
            this.labels = params.data.other_labels;
            this.priority_labels = params.data.priority_labels;
        },
        render: function () {
            var $this = $(this.el),
                login = this.login;

            var assignedToMe = new filterView({color: "#0069D6", name:"Assigned to me" , condition:function(issue) { return issue.assignee && issue.assignee.login === login; } }).render();
            var assignedToOthers = new filterView({color: "#0069D6", name:"Assigned to others" , condition:function(issue) { return issue.assignee && issue.assignee.login !== login; } }).render();
            var unassigned = new filterView({color: "#0069D6", name:"Unassigned issues" , condition:function(issue) { return !issue.assignee; } }).render();

            var userFilterViews = $([assignedToMe.el,assignedToOthers.el,unassigned.el]);

            $this.append(userFilterViews);

            userFilterViews
                .click(function(ev) {
                    ev.preventDefault();
                    var $this = $(this),
                        $clicked = $this.data("filter");
                    var othersActive = _(userFilterViews).filter(function(v) {
                        var data = $(v).data("filter");
                        return $clicked.cid !== data.cid && data.state !== 0;
                    });
                    _(othersActive).each(function(v) {
                        $(v).trigger("clear");
                    });
                });

            var grouped = _.groupBy(this.milestones, function (milestone) {
                return milestone._data.status || "backlog";
            });

            var combined = (grouped.wip || []).concat(grouped.backlog || []);


            var priorityLabelViews = new selectView({
                options: this.priority_labels,
                option_value: 'name',
                prompt: 'All',
                condition: function(issue, selected) {
                    return _.any(issue.labels, function(label) {
                        return label.name.toLocaleLowerCase() === selected.toLocaleLowerCase();
                    });
                },
                promptCondition: function(issue) { return true }
            }).render().el;

            $this.append("<h5>Priority</h5>");
            $this.append(priorityLabelViews);

            var labels = new selectView({
                options: this.labels,
                option_value: 'name',
                prompt: 'All',
                condition: function(issue, selected) {
                    return _.any(issue.labels, function(label) {
                        return label.name.toLocaleLowerCase() === selected.toLocaleLowerCase();
                    });
                },
                promptCondition: function(issue) { return true }
            }).render().el;
            $this.append("<h5>Labels</h5>");
            $this.append(labels);

            var milestoneViews = new selectView({
                options: combined,
                option_value: 'title',
                prompt: 'No milestone assigned',
                condition: function(issue, selected) { return issue.milestone && issue.milestone.title.toLocaleLowerCase() === selected.toLocaleLowerCase(); },
                promptCondition: function(issue) { return !issue.milestone; }
            }).render().el;

            $this.append("<h5>Milestones</h5>");
            $this.append(milestoneViews);
            return this;
        }
    });
});