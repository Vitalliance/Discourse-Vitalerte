import { ajax } from 'discourse/lib/ajax';

function parseJSON(array) {
  let tmp = [];
  for (let category of array) {
    tmp.push(JSON.parse(category.value));
  }
  return tmp;
}
export default Ember.Controller.extend({
  usernames: [],
  groups: [],
  groupes_active: [],
  usernames_active: [],

  actions: {
    setSelectionCustomer: function (selected) {
      if (selected == "")
        return;
      this.send('add_people', selected);
    },
    setSelectionGroup: function (selected) {
      if (selected == "")
        return;
      this.send('add_group', selected);

    },
    add_people: function (people_name) {

      let people = {
        name: people_name.toString()
      };

      ajax('/dev-stats-nagora/add_customer', { method: 'POST', data: { people: people } }).then(result => {
        console.log(result);
        ajax('/dev-stats-nagora/get_people_and_group', { method: 'GET' }).then(result => {
          console.log(result);
          this.set('usernames', result['usernames_all']).sort();
          this.set('groups', result['groups_all']).sort();
          var obj_user = [];
          obj_user = result['usernames']
          var obj_group = [];
          obj_group = result['groupes_active']

          if (obj_user)
            this.set('usernames_active', parseJSON(obj_user)).sort();
          if (obj_group)
            this.set('groupes_active', parseJSON(obj_group)).sort();
        })
      });
    },
    delete_group_by_id: function (group_id) {
      ajax('/dev-stats-nagora/delete_group', { method: 'DELETE', data: { group_id: group_id } }).then(result => {
        console.log(result);
        ajax('/dev-stats-nagora/get_people_and_group', { method: 'GET' }).then(result => {
          console.log(result);
          this.set('usernames', result['usernames_all']).sort();
          this.set('groups', result['groups_all']).sort();
          var obj_user = [];
          obj_user = result['usernames']
          var obj_group = [];
          obj_group = result['groups']

          if (obj_user)
            this.set('usernames_active', parseJSON(obj_user)).sort();;
          if (obj_group)
            this.set('groupes_active', parseJSON(obj_group)).sort();
        });
      })
    },
    delete_people_by_id: function (people_id) {
      ajax('/dev-stats-nagora/delete_people', { method: 'DELETE', data: { people_id: people_id } }).then(result => {
        console.log(result);
        ajax('/dev-stats-nagora/get_people_and_group', { method: 'GET' }).then(result => {
          console.log(result);
          this.set('usernames', result['usernames_all']).sort();
          this.set('groups', result['groups_all']).sort();
          var obj_user = [];
          obj_user = result['usernames']
          var obj_group = [];
          obj_group = result['groupes_active']

          if (obj_user)
            this.set('usernames_active', parseJSON(obj_user)).sort();;
          if (obj_group)
            this.set('groupes_active', parseJSON(obj_group)).sort();
        });
      })
    },
    add_group: function (group_name) {

      let group = {
        name: group_name.toString()
      };

      ajax('/dev-stats-nagora/add_group', { method: 'POST', data: { group: group } }).then(result => {
        ajax('/dev-stats-nagora/get_people_and_group', { method: 'GET' }).then(result => {
          console.log(result);
          this.set('usernames', result['usernames_all']).sort();
          this.set('groups', result['groups_all']).sort();
          var obj_user = [];
          obj_user = result['usernames']
          var obj_group = [];
          obj_group = result['groups']

          if (obj_user)
            this.set('usernames_active', parseJSON(obj_user)).sort();;
          if (obj_group)
            this.set('groupes_active', parseJSON(obj_group)).sort();
        });
      });
    },
  },
  getUsersOrGroup: function () {
    ajax('/dev-stats-nagora/get_people_and_group', { method: 'GET' }).then(result => {
      console.log(result);
      this.set('usernames', result['usernames_all']).sort();
      this.set('groups', result['groups_all']).sort();
      var obj_user = [];
      obj_user = result['usernames']
      var obj_group = [];
      obj_group = result['groups']

      if (obj_user)
        this.set('usernames_active', parseJSON(obj_user)).sort();
      if (obj_group)
        this.set('groupes_active', parseJSON(obj_group)).sort();
    })
  }.on('init')
});