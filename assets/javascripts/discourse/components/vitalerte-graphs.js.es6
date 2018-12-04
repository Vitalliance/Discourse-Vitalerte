import loadScript from "discourse/lib/load-script";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth
} from "../controllers/vitalerte"

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
var MOIS = [];
var PERSO = [];
const ANNEE = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
var d = new Date();
var dateBeginInput,
  dateEndInput;

function getCurrentDateTime(selectedOption, currentDateTime, selectedOptionElement) {
  var date = new Date();
  var dateEnd = new Date();
  if (selectedOptionElement) {
    switch (selectedOption) {
      case 'Mois':
        MOIS = [];
        dateEnd.setMonth(selectedOptionElement);
        currentDateTime.start = startOfMonth(date);
        currentDateTime.end = endOfMonth(dateEnd)
        currentDateTime.start.setMonth(selectedOptionElement)
        let currentMonthStart = currentDateTime.start.toLocaleDateString()
        let currentMonthEnd = currentDateTime.end.toLocaleDateString()
        MOIS.push(currentMonthStart);
        MOIS.push(currentMonthEnd);
        currentDateTime.labelString = MOIS;
        break;
      case 'Annee':
        currentDateTime.start = new Date(new Date().getFullYear(), 0, 1);;
        currentDateTime.end = new Date(new Date().getFullYear(), 0, 1);;
        currentDateTime.start.setFullYear(selectedOptionElement)
        let yearPlus = parseInt(selectedOptionElement);
        yearPlus += 1;
        yearPlus.toString();
        currentDateTime.end.setFullYear(yearPlus)
        currentDateTime.labelString = ANNEE;
        break;
      default:
        console.error("Can't get current time.. ");
    }
  }
  else
    switch (selectedOption) {
      case 'Semaine':
        currentDateTime.start = startOfWeek(date);
        currentDateTime.end = endOfWeek(dateEnd);
        currentDateTime.labelString = JOURS;
        break;
      case 'Mois':
        MOIS = [];
        currentDateTime.start = startOfMonth(date);
        currentDateTime.end = endOfMonth(dateEnd)
        let currentMonthStart = currentDateTime.start.toLocaleDateString()
        let currentMonthEnd = currentDateTime.end.toLocaleDateString()
        MOIS.push(currentMonthStart);
        MOIS.push(currentMonthEnd);
        currentDateTime.labelString = MOIS;
        break;
      case 'Annee':
        currentDateTime.start = new Date(new Date().getFullYear(), 0, 1);;
        currentDateTime.end = new Date(new Date().getFullYear() + 1, 0, 1);;
        currentDateTime.labelString = ANNEE;
        break;
      case 'Personnalise':
        PERSO = [];
        currentDateTime.start = new Date(dateBeginInput);
        currentDateTime.end = new Date(dateEndInput)
        let currentPersoStart = currentDateTime.start.toLocaleDateString()
        let currentPersoEnd = currentDateTime.end.toLocaleDateString()
        PERSO.push(currentPersoStart);
        PERSO.push(currentPersoEnd);
        currentDateTime.labelString = PERSO;
        break;
      default:
        console.error("Can't get current time.. ");
    }
  return currentDateTime;
};

function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key))
      return false;
  }
  return true;
};

function getWeeksInMonth(firstDate, lastDate) {
  var weeks = [],
    numDays = lastDate.getDate();

  var start = 1;
  var end = 7 - firstDate.getDay();
  while (start <= numDays) {
    weeks.push({ start: start, end: end });
    start = end + 1;
    end = end + 7;
    if (end > numDays)
      end = numDays;
  }
  return weeks;
}

function getDataByCurrentDateTimeMonth(currentDateTime, data, incidents) {
  let dateDebut = new Date(currentDateTime.start);
  let dateFin = new Date(currentDateTime.end)
  let weeks = getWeeksInMonth(dateDebut, dateFin);

  data.nouveauIncident = []
  data.incidentNonResolu = []
  let tmp = []

  tmp.push(weeks[0].start);
  for (let week = 1; week <= weeks.length - 1; week++) {
    tmp.push(weeks[week].end);
  }
  currentDateTime.labelString = tmp
  for (let index of weeks) {
    var tmp_nouveau = [];
    var tmp_Resolu = [];
    for (let incident of incidents) {
      let dateTopicDebut = new Date(incident.created_at);
      if (dateDebut <= dateTopicDebut && dateFin >= dateTopicDebut) {
        if (index.start <= dateTopicDebut.getDate() && index.end >= dateTopicDebut.getDate()) {
          tmp_nouveau.push(incident.title);
        }
      }
      if (dateDebut <= dateTopicDebut && dateFin >= dateTopicDebut && incident.closed == true || dateDebut <= dateTopicDebut && dateFin >= dateTopicDebut && incident.has_accepted_answer == true) {
        if (index.start <= dateTopicDebut.getDate() && index.end >= dateTopicDebut.getDate()) {
          tmp_Resolu.push(incident.title);
        }
      }
    }
    if (tmp_nouveau.length > 0) {
      data.nouveauIncident.push(tmp_nouveau.length)
    }
    else
      data.nouveauIncident.push(0)

    if (tmp_Resolu.length > 0) {
      data.incidentNonResolu.push(tmp_Resolu.length)
    }
    else
      data.incidentNonResolu.push(0);
  }
  return data;
}

function getDataByCurrentDateTimeYear(currentDateTime, data, incidents) {
  let dateDebut = new Date(currentDateTime.start);
  let dateFin = new Date(currentDateTime.end)
  dateDebut.setHours(0, 0, 0, 0);
  dateFin.setHours(0, 0, 0, 0);

  data.nouveauIncident = []
  data.incidentNonResolu = []
  for (let index = 0; index <= currentDateTime.labelString.length - 1; index++) {
    var tmp_nouveau = [];
    var tmp_Resolu = [];
    for (let incident of incidents) {
      let dateTopicDebut = new Date(incident.created_at);
      if (dateDebut <= dateTopicDebut && dateFin >= dateTopicDebut) {
        if (index == dateTopicDebut.getMonth()) {
          tmp_nouveau.push(incident.title);
        }
      }
      if (dateDebut <= dateTopicDebut && dateFin >= dateTopicDebut && incident.closed == true || dateDebut <= dateTopicDebut && dateFin >= dateTopicDebut && incident.has_accepted_answer == true) {
        if (index == dateTopicDebut.getMonth())
          tmp_Resolu.push(incident.title);
      }
    }
    if (tmp_nouveau.length > 0) {
      data.nouveauIncident.push(tmp_nouveau.length)
    }
    else
      data.nouveauIncident.push(0)

    if (tmp_Resolu.length > 0) {
      data.incidentNonResolu.push(tmp_Resolu.length)
    }
    else
      data.incidentNonResolu.push(0);
  }
  return data;
};

function getDataByCurrentDateTimePerso(currentDateTime, data, incidents) {
  let dateDebut = new Date(currentDateTime.start);
  let dateFin = new Date(currentDateTime.end)
  dateDebut.setHours(0, 0, 0, 0);
  dateFin.setHours(0, 0, 0, 0);

  data.nouveauIncident = []
  data.incidentNonResolu = []
  for (let i = 0; i != 2; i++) {
    var tmp_nouveau = [];
    var tmp_Resolu = [];
    for (let incident of incidents) {
      let dateTopicDebut = new Date(incident.created_at);
      if (dateDebut <= dateTopicDebut && dateFin >= dateTopicDebut) {
        tmp_nouveau.push(incident.title);
      }
      if (dateDebut <= dateTopicDebut && dateFin >= dateTopicDebut && incident.closed == true || dateDebut <= dateTopicDebut && dateFin >= dateTopicDebut && incident.has_accepted_answer == true) {
        tmp_Resolu.push(incident.title);
      }
    }
    if (tmp_nouveau.length > 0) {
      data.nouveauIncident.push(tmp_nouveau.length)
    }
    else
      data.nouveauIncident.push(0)

    if (tmp_Resolu.length > 0) {
      data.incidentNonResolu.push(tmp_Resolu.length)
    }
    else
      data.incidentNonResolu.push(0);
  }
  return data;
};

function getDataByCurrentDateTimeWeek(currentDateTime, data, incidents) {
  let dateDebut = currentDateTime.start;
  let dateFin = currentDateTime.end
  dateDebut.setHours(0, 0, 0, 0);
  dateFin.setHours(0, 0, 0, 0);

  data.nouveauIncident = []
  data.incidentNonResolu = []
  for (let index = 0; index <= currentDateTime.labelString.length - 1; index++) {
    var tmp_nouveau = [];
    var tmp_Resolu = [];
    var tmp_retard = [];
    for (let incident of incidents) {
      let dateTopicDebut = new Date(incident.created_at);
      if (dateDebut <= dateTopicDebut && dateFin >= dateTopicDebut) {
        if (index == dateTopicDebut.getDay() - 1) {
          tmp_nouveau.push(incident.title);
        }
      }
      if (dateDebut <= dateTopicDebut && dateFin >= dateTopicDebut && incident.closed == true || dateDebut <= dateTopicDebut && dateFin >= dateTopicDebut && incident.has_accepted_answer == true) {
        if (index == dateTopicDebut.getDay() - 1)
          tmp_Resolu.push(incident.title);
      }
    }
    if (tmp_nouveau.length > 0) {
      data.nouveauIncident.push(tmp_nouveau.length)
    }
    else
      data.nouveauIncident.push(0)
    if (tmp_Resolu.length > 0) {
      data.incidentNonResolu.push(tmp_Resolu.length)
    }
    else
      data.incidentNonResolu.push(0);
  }
  return data;
};
export default Ember.Component.extend({
  classNames: ["test-chart"],
  selectedOption: null,
  labelsString: null,
  selectedMonth: null,
  currentMonth: null,
  selectedYears: null,
  currentYear: null,
  selectedPlus: null,
  years: null,
  pickDate: false,
  selectedPersonalizer: false,
  data: {
    nouveauIncident: [],
    incidentNonResolu: [],
  },
  labels: [],
  currentDateTime: {
    start: null,
    end: null,
    labelString: []
  },
  actions: {
    getTopicsStatsByDates: function () {
      dateBeginInput = this.dateBeginInput
      dateEndInput = this.dateEndInput
      this.set('currentDateTime', getCurrentDateTime(this.selectedOption, this.currentDateTime))
      this.sendAction('sendDate', this.currentDateTime.start, this.currentDateTime.end);
    },
    selectedElement: function (selected) {
      this.set("selectedOption", selected);
      this.set("labelsString", selected)
      this.set("selectedMonth", false);
      this.set("selectedYears", false);
      this.set('pickDate', false);

      if (selected != "Personnalise") {
        this.set('currentDateTime', getCurrentDateTime(this.selectedOption, this.currentDateTime))
        this.sendAction('sendDate', this.currentDateTime.start, this.currentDateTime.end);
      }
      if (selected == "Personnalise") {
        this.set('pickDate', true);
        dateBeginInput = null;
        dateEndInput = null;
      }
    },
    selectedElementOption: function (selected) {
      this.set('selectedPlus', selected)

      if (this.selectedOption == "Mois") {
        this.set('currentDateTime', getCurrentDateTime(this.selectedOption, this.currentDateTime, this.selectedPlus))
        this.sendAction('sendDate', this.currentDateTime.start, this.currentDateTime.end);
        this.set('data', getDataByCurrentDateTimeMonth(this.currentDateTime, this.data, this.get('incident')));
      }
      if (this.selectedOption == "Annee") {
        this.set('currentDateTime', getCurrentDateTime(this.selectedOption, this.currentDateTime, this.selectedPlus))
        this.sendAction('sendDate', this.currentDateTime.start, this.currentDateTime.end);
        this.set('data', getDataByCurrentDateTimeYear(this.currentDateTime, this.data, this.get('incident')));
      }
    }
  },
  willDestroyElement() {
    this._super(...arguments);

    this._resetChart();
  },
  init() {
    this._super(...arguments);
  },
  didUpdateAttrs() {
    this._super(...arguments);

    if (this.selectedOption == "Mois") {
      this.set('currentMonth', ANNEE[d.getMonth()]);
      this.set('selectedMonth', true)
      this.set('data', getDataByCurrentDateTimeMonth(this.currentDateTime, this.data, this.get('incident')));
    }
    else if (this.selectedOption == "Semaine") {
      this.set('labelsString', "Semaine")
      this.set('currentDateTime', getCurrentDateTime("Semaine", this.currentDateTime))
      this.set('data', getDataByCurrentDateTimeWeek(this.currentDateTime, this.data, this.get('incident')))
    }
    else if (this.selectedOption == "Annee") {
      this.set('currentYear', d.getFullYear());
      this.set("selectedYears", true);
      let tmp = [];
      for (let index = 1; index != 10; index++) {
        tmp.push(d.getFullYear() - index)
      }
      this.set('years', tmp);
      this.set('data', getDataByCurrentDateTimeYear(this.currentDateTime, this.data, this.get('incident')));
    }
    else if (this.selectedOption == "Personnalise" && dateBeginInput && dateEndInput) {
      this.set('currentDateTime', getCurrentDateTime(this.selectedOption, this.currentDateTime))
      this.set('data', getDataByCurrentDateTimePerso(this.currentDateTime, this.data, this.get('incident')))
    }
    else
      return;
  },
  didUpdate() {
    this._super(...arguments);

    if (this.selectedOption == null && this.get('incident') != []) {
      this.set('labelsString', "Semaine")
      this.set('currentDateTime', getCurrentDateTime("Semaine", this.currentDateTime))
      this.set('data', getDataByCurrentDateTimeWeek(this.currentDateTime, this.data, this.get('incident')))
    }
    if (this.selectedOption == "Personnalise" && !dateBeginInput && !dateEndInput) {
      this.set('data.nouveauIncident', 0)
      this.set('data.incidentNonResolu', 0)
      this.set('currentDateTime.labelString', ['Début', 'Fin']);
    }

    Ember.run.schedule("afterRender", () => {
      const $chartCanvas = this.$(".test-chart");
      if (!$chartCanvas || !$chartCanvas.length)
        return;
      const context = $chartCanvas[0].getContext("2d");
      if (this.get('incident') != []) {
        loadScript("/javascripts/Chart.min.js").then(() => {
          this._resetChart();
          const data = {
            labels: this.currentDateTime.labelString,
            datasets: [{
              label: 'Nombre d\'incident',
              fill: true,
              backgroundColor: 'rgba(255, 99, 132, 0.2)', //Red
              borderColor: 'rgba(255,99,132,1)',
              data: this.data.nouveauIncident,
            }, {
              label: 'Incident résolu',
              fill: true,
              backgroundColor: 'rgba(54, 162, 235, 0.2)', //Blue
              borderColor: 'rgba(54, 162, 235, 1)',
              data: this.data.incidentNonResolu,
            },
            ]
          };
          this._chart = new window.Chart(context, this._buildChartConfig(data));
        });
      }
    });
  },

  _buildChartConfig(data) {
    return {
      type: "line",
      data,
      options: {
        responsive: true,
        title: {
          display: true,
          text: 'Reporting Incident'
        },
        tooltips: {
          mode: 'index',
          intersect: false,
        },
        hover: {
          mode: 'nearest',
          intersect: false
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: this.labelsString
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Incidents'
            },
            ticks: {
              suggestedMin: 0,
              suggestedMax: Math.max(this.data.nouveauIncident.length + 10, 20),
            }
          }]
        }
      }
    }
  },
  _resetChart() {
    if (this._chart) {
      this._chart.destroy();
      this._chart = null;
    }
  }
});
