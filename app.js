(function() {

  return {

    events: {
      'userGetRequest.done': 'this.showInfo',
      'userGetRequest.fail': 'this.showError',
      'app.activated':'getInfo'
    },

    requests: {
      userGetRequest: function(id) {
        return {
          url: '/api/v2/users/' + id + '.json',
          type: 'GET',
          dataType: 'json'
        };
      },
      orgGetRequest: function(id) {
        return {
          url: '/api/v2/organizations/' + id + '.json',
          type: 'GET',
          dataType: 'json'
        };
      },
      mandrillRequest: function(email) {
        return {
          url: 'https://mandrillapp.com/api/1.0/messages/search.json?key=ZIOMfsvPhMt7gqXNWsq_LA&query=email:'+email,
          type: 'GET',
          dataType: 'json'
        };
      }
    },

    formatDates: function(data) {

      var cdate = new Date(data.user.created_at);
      var ldate = new Date(data.user.last_login_at);
      data.user.created_at = cdate.toLocaleDateString();
      data.user.last_login_at = ldate.toLocaleString();
      return data;
    },

    convertTimestamp: function(ts, format) {
      var d = new Date(ts*1000);
      var datetime = moment(d).format(format);
      return datetime;
    },

    getInfo: function() {
      var id = this.ticket().requester().id();
      this.ajax('userGetRequest', id);
    },

    showInfo: function(data) {
      this.ajax('mandrillRequest', data.user.email).then(
         function(mandrill_data) {
          for (var key in mandrill_data) {
            if (mandrill_data.hasOwnProperty(key)) {
              mandrill_data[key].date=this.convertTimestamp(mandrill_data[key].ts,"L");
            }
          }
          data.user.messages = mandrill_data;
          this.switchTo('requester', data);
        },
        function() {
        this.showError();
        }
      );
      this.formatDates(data);
      if (data.user.organization_id == null) {
        this.switchTo('requester', data);
      } else {
        this.ajax('orgGetRequest', data.user.organization_id).then(
        function(org_data) {
        data.user.organization_name = org_data.organization.name;
        this.switchTo('requester', data);
        },
        function() {
        this.showError();
        });
      }
    },

    showError: function() {
      this.switchTo('error');
    },

  };

}());