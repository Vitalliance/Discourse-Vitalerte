import { ajax } from 'discourse/lib/ajax';
import Category from "discourse/models/category";
import User from "discourse/models/user";
import { vitalerte_group } from "../initializers/setup-vitalerte"

var discourseString = {};
var subcategorie = {};

function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key))
      return false;
  }
  return true;
}

function createObjectByObject(myObject) {
  let result = {}
  for (let [key, value] of Object.entries(myObject)) {
    result[value] = {
      nouveauIncident: [],
      nouveauIncidentResolu: [],
      IncidentNonResolu: [],
      Category_Id: key
    }
  }
  return result;
}

export function nouveauIncidentFiltreVitastats(incidents, dateSetBegin, dateSetEnd) {

  let dateDebut = new Date(dateSetBegin);
  let dateFin = new Date(dateSetEnd)
  dateDebut.setHours(0, 0, 0, 0);
  dateFin.setHours(0, 0, 0, 0);
  let filtre = [];

  subcategorie = createObjectByObject(discourseString);
  for (let incident of incidents) {
    let dateTopicDebut = new Date(incident.created_at);
    let title = Category.findById(incident.category_id)
    if (title != undefined && subcategorie[title.name]) {
      if (dateDebut <= dateTopicDebut && dateFin >= dateTopicDebut || dateDebut <= dateTopicDebut && dateFin >= dateTopicDebut) {
        incident['category_string'] = title.name;
        incident['dateDebut_string'] = dateTopicDebut.toLocaleDateString()
        subcategorie[title.name].nouveauIncident.push(incident.title)
        incident['EasyOuPasEasy'] = incident.closed == false || incident.has_accepted_answer == false ? "Non résolu" : "Résolu"
        filtre.push(cloneMessage(incident));
      }
      if (dateDebut <= dateTopicDebut && dateFin >= dateTopicDebut && incident.closed == true || dateDebut <= dateTopicDebut && dateFin >= dateTopicDebut && incident.has_accepted_answer == true) {
        subcategorie[title.name].nouveauIncidentResolu.push(incident.title)
      }
      if (incident.closed == false || incident.has_accepted_answer == false) {
        subcategorie[title.name].IncidentNonResolu.push(incident.title)
      }
    }
  }
  return filtre;
}

export function nouveauIncidentFiltreVitalerte(incidents, dateSetBegin, dateSetEnd) {

  let dateDebut = new Date(dateSetBegin);
  let dateFin = new Date(dateSetEnd)
  dateDebut.setHours(0, 0, 0, 0);
  dateFin.setHours(0, 0, 0, 0);
  let filtre = [];

  subcategorie = createObjectByObject(discourseString);
  for (let incident of incidents) {
    let dateTopicDebut = new Date(incident.created_at);
    let title = Category.findById(incident.category_id)
    if (isEmpty(incident.nagoraStats[0]) == false && subcategorie[title.name]) {
      if (dateDebut <= dateTopicDebut && dateFin >= dateTopicDebut || dateDebut <= dateTopicDebut && dateFin >= dateTopicDebut) {
        incident['category_string'] = title.name;
        incident['dateDebut_string'] = dateTopicDebut.toLocaleDateString()
        subcategorie[title.name].nouveauIncident.push(incident.title)
        incident['EasyOuPasEasy'] = incident.closed == false || incident.has_accepted_answer == false ? "Non résolu" : "Résolu"
        filtre.push(cloneMessage(incident));
      }
      if (dateDebut <= dateTopicDebut && dateFin >= dateTopicDebut && incident.closed == true || dateDebut <= dateTopicDebut && dateFin >= dateTopicDebut && incident.has_accepted_answer == true) {
        subcategorie[title.name].nouveauIncidentResolu.push(incident.title)
      }
      if (incident.closed == false || incident.has_accepted_answer == false) {
        subcategorie[title.name].IncidentNonResolu.push(incident.title)
      }
    }
  }
  return filtre;
}
// to components utils
export function startOfWeek(date) {
  let diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);

  return new Date(date.setDate(diff));
}

export function endOfWeek(date) {

  let lastday = date.getDate() - (date.getDay() - 1) + 6;
  return new Date(date.setDate(lastday));
}


export function startOfMonth(dateMonthStart) {

  let firstDay = new Date(dateMonthStart.getFullYear(), dateMonthStart.getMonth(), 1);
  return new Date(firstDay);
}

export function endOfMonth(dateMonthEnd) {

  var lastDay = new Date(dateMonthEnd.getFullYear(), dateMonthEnd.getMonth() + 1, 0);
  return new Date(lastDay);
}

//
function createObjectByValues(values) {
  let objectfiltres = {};

  for (let value of values) {
    objectfiltres[value] = {
      nouveauIncident: [],
      nouveauIncidentResolu: [],
      IncidentNonResolu: []
    }
  }
  return objectfiltres;
}

function filtreTopicsStats(selectedOption, incidents, dateSetBegin, dateSetEnd) {

  let result = [];

  // Tri [Select Distinct]

  for (let el of incidents) {
    if (isEmpty(el.nagoraStats[0]) == false) {
      if (!result.includes(el.nagoraStats[0][selectedOption])) result.push(el.nagoraStats[0][selectedOption]);
    }
  };

  for (let index = 0; index < result.length; index++) {
    let el = result[index];
    if (!result.includes(el)) result.push(el);
  }
  //

  let objectfiltres = createObjectByValues(result)

  let dateDebut = new Date(dateSetBegin);
  let dateFin = new Date(dateSetEnd)
  dateDebut.setHours(0, 0, 0, 0);
  dateFin.setHours(0, 0, 0, 0);

  let filtre = [];

  for (let incident of incidents) {
    for (let objectfiltre of result) {
      let dateTopicDebut = new Date(incident.created_at);
      let title = Category.findById(incident.category_id)
      if (isEmpty(incident.nagoraStats[0]) == false) {
        if (objectfiltre == incident.nagoraStats[0][selectedOption] && subcategorie[title.name]) {
          if (dateDebut <= dateTopicDebut && dateFin >= dateTopicDebut || dateDebut <= dateTopicDebut && dateFin >= dateTopicDebut) {
            incident['selectedOption'] = objectfiltre;
            incident['category_string'] = title.name;
            incident['dateDebut_string'] = dateTopicDebut.toLocaleDateString()
            objectfiltres[objectfiltre].nouveauIncident.push(incident.title);
            incident['EasyOuPasEasy'] = incident.closed == false || incident.has_accepted_answer == false ? "Non résolu" : "Résolu"
            filtre.push(cloneMessage(incident));
          }
          if (dateDebut <= dateTopicDebut && dateFin >= dateTopicDebut && incident.closed == true || dateDebut <= dateTopicDebut && dateFin >= dateTopicDebut && incident.has_accepted_answer == true) {
            incident['selectedOption'] = objectfiltre;
            incident['category_string'] = title.name;
            incident['dateDebut_string'] = dateTopicDebut.toLocaleDateString()
            objectfiltres[objectfiltre].nouveauIncidentResolu.push(incident.title);
            incident['EasyOuPasEasy'] = incident.closed == false || incident.has_accepted_answer == false ? "Non résolu" : "Résolu"
            filtre.push(cloneMessage(incident));
          }
          if (incident.closed == false || incident.has_accepted_answer == false) {
            incident['selectedOption'] = objectfiltre;
            objectfiltres[objectfiltre].IncidentNonResolu.push(incident.title);
          }
        }
      }
    }
  }
  return objectfiltres;
};

function getDataToCSV(filtres) {

  var dataCSV = [];
  var dataCSVModel = {
    "Catégorie": "",
    "Nom ADV": "",
    "Date Création": "",
    "Agence": "",
    "Directrice Régionale": "",
    "Nom CDA": "",
    "Statut Incident": ""
  };

  for (let filtre of filtres) {
    if (isEmpty(filtre.nagoraStats[0]) == false) {
      let dateTopicDebut = new Date(filtre.created_at);

      dataCSVModel['Catégorie'] = filtre.category_string;
      dataCSVModel['Nom ADV'] = filtre.nagoraStats[0].nomADV;
      dataCSVModel['Date Création'] = dateTopicDebut.toLocaleDateString();
      dataCSVModel['Agence'] = filtre.nagoraStats[0].nomAgence;
      dataCSVModel['Directrice Régionale'] = filtre.nagoraStats[0].nomDR;
      dataCSVModel['Nom CDA'] = filtre.nagoraStats[0].nomCDA;
      dataCSVModel['Statut Incident'] = filtre.closed == false || filtre.has_accepted_answer == false ? "En Cours" : "Résolu";
    }
    if (dataCSVModel['Catégorie'] != "") {
      dataCSV.push(cloneMessage(dataCSVModel));
    }
  }
  return dataCSV
}

function cloneMessage(servermessage) {
  var clone = {};
  for (var key in servermessage) {
    if (servermessage.hasOwnProperty(key))
      clone[key] = servermessage[key];
  }
  return clone;
}

function addCategoryByname(allcategories, name) {

  for (let allcategorie of allcategories) {
    if (name == allcategorie.name)
      return true;
  }
  return false;
}

function create_obj(objs) {
  let object = {};

  for (let obj of objs) {
    object[obj.id] = obj.title
  }
  return object;
}
function checkCategories(subs, title) {

  for (let sub in subs) {
    if (subs[title]) {
      return false;
    }
  }
  return true;
}

export default Ember.Controller.extend({
  nothing: false,
  topics: [],
  subcategorieObject: [],
  dateBegin: null,
  dateBeginInput: null,
  dateEnd: null,
  dateEndInput: null,
  dateSetBegin: null,
  dateSetEnd: null,
  value: [],
  incidents: [],
  selectedOption: null,
  detail: false,
  allCategories: [],
  categories: [],
  current_username: null,
  vitalerte_group: false,
  title: null,
  favicon: false,

  actions: {
    setSelection: function (selected) {
      if (selected == "") {
        return;
      }
      this.set('favicon', false)
      let startDateWeek = new Date()
      let endDateWeek = new Date()
      startOfWeek(startDateWeek);
      endOfWeek(endDateWeek);
      startDateWeek.setHours(0, 0, 0, 0);
      endDateWeek.setHours(0, 0, 0, 0);

      if (selected == 'nomAgence')
        this.set('option', "Agence");
      if (selected == 'nomDR')
        this.set('option', "Directrice Régionale");
      if (selected == 'categories') {
        this.set('option', "Catégories");
        this.set('favicon', true)
      }
      this.set('selectedOption', selected)
      if (this.dateBeginInput == null && this.dateEndInput == null) {
        if (this.selectedOption != "categories") {
          this.set('subcategorieObject', filtreTopicsStats(this.selectedOption, this.incidents, startDateWeek, endDateWeek));
        }
        else {
          this.set('filtre', nouveauIncidentFiltreVitalerte(this.incidents, startDateWeek, endDateWeek));
          this.set('subcategorieObject', subcategorie);
        }
      }
      else {
        if (this.selectedOption != "categories")
          this.set('subcategorieObject', filtreTopicsStats(this.selectedOption, this.incidents, this.dateBeginInput, this.dateEndInput));
        else {
          this.set('filtre', nouveauIncidentFiltreVitalerte(this.incidents, this.dateBeginInput, this.dateEndInput));
          this.set('subcategorieObject', subcategorie);
        }
      }
    },
    create_category: function (selected) {
      this.set('category_title', selected);
      if (this.category_title == "")
        return;
      let check = addCategoryByname(this.allCategories, this.category_title);
      if (check == false) {
        alert('La catégorie ' + this.category_title + ' n\'existe pas, veuillez saisir la bonne catégorie');
        return;
      }
      if (checkCategories(this.subcategorieObject, this.category_title) == false) {
        alert('La catégorie ' + this.category_title + ' existe déja !');
        return;
      }
      let startDateWeek = new Date()
      let endDateWeek = new Date()
      startOfWeek(startDateWeek);
      endOfWeek(endDateWeek);
      startDateWeek.setHours(0, 0, 0, 0);
      endDateWeek.setHours(0, 0, 0, 0);
      let startDateWeekString = startDateWeek.toLocaleDateString()
      let endDateWeekString = endDateWeek.toLocaleDateString()
      let current_user = User.currentProp('username').toString();

      let category = {
        title: this.category_title,
        username: current_user
      }
      ajax('/dev-stats-nagora/create', { method: 'POST', data: { category: category } }).then(result => {
        ajax('/dev-stats-nagora/get_categories', { method: 'GET', data: { username: this.current_username } }).then(resultat => {
          this.set('categories', resultat['categories']);
          var obj = [];
          for (let category of this.categories) {
            obj.push(JSON.parse(category.value));
          }
          discourseString = create_obj(obj);
          ajax('/dev-stats-nagora', { method: 'GET' }).then(result => {
            var concat = [].concat.apply([], result['incidents']);
            this.set('incidents', concat);
            if (this.vitalerte_group == true)
              this.set('filtre', nouveauIncidentFiltreVitalerte(this.incidents, this.dateSetBegin, this.dateSetEnd));
            else
              this.set('filtre', nouveauIncidentFiltreVitastats(this.incidents, this.dateSetBegin, this.dateSetEnd));
            if (this.filtre == [] || this.filtre == null || this.filtre.length == 0)
              this.set('nothing', false);
            else
              this.set('nothing', true);
            this.set('subcategorieObject', subcategorie);
            this.set('option', "Catégories")
            this.set('allCategories', result['allCategories']);
          })
        })
      })
    },
    delete_category: function (Category_Id) {
      let startDateWeek = new Date()
      let endDateWeek = new Date()
      startOfWeek(startDateWeek);
      endOfWeek(endDateWeek);
      startDateWeek.setHours(0, 0, 0, 0);
      endDateWeek.setHours(0, 0, 0, 0);

      ajax('/dev-stats-nagora/delete', { method: 'DELETE', data: { category_id: Category_Id } }).then(result => {
        ajax('/dev-stats-nagora/get_categories', { method: 'GET', data: { username: this.current_username } }).then(result => {
          this.set('categories', result['categories']);
          this.categories = result['categories'];
          var obj = [];
          for (let category of this.categories) {
            obj.push(JSON.parse(category.value));
          }
          discourseString = create_obj(obj);
          ajax('/dev-stats-nagora', { method: 'GET' }).then(result => {
            var concat = [].concat.apply([], result['incidents']);
            this.set('incidents', concat);
            if (this.vitalerte_group == true)
              this.set('filtre', nouveauIncidentFiltreVitalerte(this.incidents, this.dateSetBegin, this.dateSetEnd));
            else
              this.set('filtre', nouveauIncidentFiltreVitastats(this.incidents, this.dateSetBegin, this.dateSetEnd));
            if (this.filtre == [] || this.filtre == null || this.filtre.length == 0)
              this.set('nothing', false);
            else
              this.set('nothing', true);
            this.set('subcategorieObject', subcategorie);
            this.set('option', "Catégories")
            this.set('allCategories', result['allCategories']);
          })
        });
      });
    },
    showDetails: function () {
      this.set('detail', true);
    },
    hideDetails: function () {
      this.set('detail', false);
    },
    setDateBegin: function () {
      this.set('dateBegin', this.dateDebut);
    },
    setDateSend: function () {
      this.set('dateDebut', this.dateDebut);
      this.set('dateFin', this.dateFin);
    },
    getTopicsStatsByDates: function (dateBegin, dateEnd) {

      this.set('dateSetBegin', dateBegin)
      this.set('dateSetEnd', dateEnd)
      this.set('nothing', false);

      if (this.dateSetBegin == null || this.dateSetEnd == null) {
        alert("Vous devez renseignez une date de début et de fin ")
        return;
      }
      if (this.selectedOption == "" || this.selectedOption == null || this.selectedOption == "categories") {
        if (this.vitalerte_group == true) {
          this.set('filtre', nouveauIncidentFiltreVitalerte(this.incidents, dateBegin, dateEnd));
        }
        else {
          this.set('filtre', nouveauIncidentFiltreVitastats(this.incidents, dateBegin, dateEnd));
        }

        this.set('subcategorieObject', subcategorie);
      }
      else {
        if (this.vitalerte_group == true) {
          this.set('filtre', nouveauIncidentFiltreVitalerte(this.incidents, dateBegin, dateEnd));
          this.set('subcategorieObject', filtreTopicsStats(this.selectedOption, this.incidents, dateBegin, dateEnd));
        }
        else
          this.set('filtre', nouveauIncidentFiltreVitastats(this.incidents, dateBegin, dateEnd));
      }

      this.set('dateBegin', dateBegin.toLocaleDateString())
      this.set('dateEnd', dateEnd.toLocaleDateString())
      if (this.filtre == [] || this.filtre == null || this.filtre.length == 0) {
        this.set('nothing', false);
      }
      else
        this.set('nothing', true);
    },
    downloadToCSV: function () {

      let arrData = getDataToCSV(this.filtre);
      let ReportTitle = "Vitalerte pour la période du " + this.dateBegin + " au " + this.dateEnd;
      let ShowLabel = true;
      var CSV = '';

      if (ShowLabel) {
        var row = "";
        for (var index in arrData[0]) {
          row += index + ';';
        }
        row = row.slice(0, -1);
        CSV += row + '\r\n';
      }
      for (var i = 0; i < arrData.length; i++) {
        var row = "";
        for (var index in arrData[i]) {
          row += arrData[i][index] + ';';
        }
        row = row.slice(0, -1);
        CSV += row + '\r\n';
      }

      if (CSV == '') {
        alert("Invalid data");
        return;
      }

      var fileName = "Stats_Réclamation_ADV";
      fileName += ReportTitle.replace(/ /g, "_");
      var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
      var link = document.createElement("a");
      link.href = uri;
      link.style = "visibility:hidden";
      link.download = fileName + ".csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },
  getTopicsStats: function () {
    this.set('vitalerte_group', vitalerte_group);
    if (this.vitalerte_group == true)
      this.set('title', "Réclamation ADV");
    else
      this.set('title', "Vitastats");
    let startDateWeek = new Date()
    let endDateWeek = new Date()
    startOfWeek(startDateWeek);
    endOfWeek(endDateWeek);
    startDateWeek.setHours(0, 0, 0, 0);
    endDateWeek.setHours(0, 0, 0, 0);
    let startDateWeekString = startDateWeek.toLocaleDateString()
    let endDateWeekString = endDateWeek.toLocaleDateString()
    this.set('dateBegin', startDateWeekString);
    this.set('dateEnd', endDateWeekString);
    this.set('current_username', User.currentProp('username').toString());
    this.set('favicon', true);

    ajax('/dev-stats-nagora/get_categories', { method: 'GET', data: { username: this.current_username } }).then(result => {
      this.set('categories', result['categories']);
      var obj = [];
      for (let category of this.categories) {
        obj.push(JSON.parse(category.value));
      }
      discourseString = create_obj(obj);
      ajax('/dev-stats-nagora', { method: 'GET' }).then(result => {
        var concat = [].concat.apply([], result['incidents']);
        this.set('incidents', concat);
        if (this.vitalerte_group == true)
          this.set('filtre', nouveauIncidentFiltreVitalerte(this.incidents, startDateWeek, endDateWeek));
        else
          this.set('filtre', nouveauIncidentFiltreVitastats(this.incidents, startDateWeek, endDateWeek));
        if (this.filtre == [] || this.filtre == null || this.filtre.length == 0)
          this.set('nothing', false);
        else
          this.set('nothing', true);
        this.set('subcategorieObject', subcategorie);
        this.set('option', "Catégories")
        this.set('allCategories', result['allCategories']).sort();
        this.allCategories.sort();
      })
    })
  }.on('init')
});