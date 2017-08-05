'use strict';
let app = angular.module('prmApp', ['ngRoute']);
app.config(function($routeProvider){
    $routeProvider
    .when("/", {
        templateUrl : "../templates/login.html",
        //controller : "LoginCtrl"
    })
    .when("/addpatient", {
        templateUrl : "../templates/addpatient.html",
    	//controller: "AddPatientController"
    })
    .when("/getpatients", {
        templateUrl : "../templates/get.html",
        //controller: "GetPatientController"
    })
    .when("/getappointments", {
        templateUrl : "../templates/appt.html",
        //controller: "GetApptController"
    })
    .otherwise({
    	redirectTo: '/'
    });
});