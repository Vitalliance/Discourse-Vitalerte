import { withPluginApi } from 'discourse/lib/plugin-api';

const PLUGIN_API_VERSION = "0.8.25";
export var vitalerte_group = false;

function parseJSON(array) {
  let tmp = [];
  for (let category of array) {
    tmp.push(JSON.parse(category.value));
  }
  return tmp;
}

async function initializePluginStats(api, siteMain) {
  //Do some fucking stuff

  var current_username = siteMain.username
  var groups = [];
  var check = false;
  var obj_user = [];
  var obj_group = [];

  $.ajax('/dev-stats-nagora/get_people_and_group', { method: 'GET', async: false }).done(function (result) {
    obj_user = result['usernames']
    obj_group = result['groups']

    if (obj_user)
      obj_user = parseJSON(obj_user).sort();
    if (obj_group)
      obj_group = parseJSON(obj_group).sort();

    for (var user of obj_user) {
      if (user.name == current_username) {
        check = true;
      }
    };
  });

  $.ajax({ url: "/users/" + current_username + ".json", async: false }).done(function (data) {
    groups = data.user.groups;
    for (var group of groups) {
      for (var group_active of obj_group) {
        if (group.name == group_active.name) {
          check = true;
        }
        if (group.id == 109 || group.name == 'vitalerte' || group.name == "Vitalerte" || group.name == 'GroupTest') {
          vitalerte_group = true;
        }
        else
          vitalerte_group = false
      }
    }
  })

  if (check == true) {
    api.addNavigationBarItem({
      name: "Statisitques Incidents",
      displayName: "Réclamation ADV",
      href: "/vitalerte",
    });
  }
  /* END CHECK */
}

export default {
  name: 'vitalerte',
  initialize(container) {
    const siteMain = container.lookup("current-user:main");

    withPluginApi(PLUGIN_API_VERSION, api => initializePluginStats(api, siteMain));
  }
}
