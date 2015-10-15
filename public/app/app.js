/**
 * Created by allenbklj on 9/9/15.
 */
var myApp = angular.module('chatApp',['ui.router']);
myApp.config(function($stateProvider,$urlRouterProvider){
    //$urlRouterProvider.otherwise('unauthenticated');
    $stateProvider.state('login',{
        url:'/login',
        templateUrl:'_login.html',
        controller:'loginController'
    }).state('register',{
        url:'/register',
        templateUrl:'_register.html',
        controller:'registerController'
    });
    //    .state('authenticated',{
    //    url:'/authenticated',
    //    templateUrl:'_authenticated_landing.html',
    //    resolve:{getUser:function($http){
    //        return $http.get('/validate').success(function(data){
    //            return data;
    //        })
    //    }},
    //    controller:'authenticatedController',
    //    onEnter:function(getUser){
    //        console.log(getUser);
    //    }
    //}).state('unauthenticated',{
    //    url:'/validate',
    //    templateUrl:'_authenticated_landing.html',
    //    controller:'unauthenticatedController'
    //});

});

// unauthenticated state - make a call to /vaidate and see what it returns
// if it returns a user, then take them to the user to the authenticated view
// if it returns null, take the user to the unauthenticated view


myApp.controller('loginController',function($scope,AuthenService, $state,$window){
    $scope.user = {};
    $scope.login = function(){

        if(typeof $scope.user.username ==='undefined' || typeof $scope.user.password==='undefined'){
            alert('Please fill info!');
        }else{
            AuthenService.login($scope.user).then(function(response){
                $scope.message = response.data.message;
                $scope.user = {};
                //console.log(response);
                AuthenService.user = response.data.user;
                $window.location.href = '/';
                //$state.go('authenticated');
            }, function(response){
                console.log(response);
                $scope.message = response.data;
                $scope.user = {};
            });
    }}
});

myApp.controller('registerController',function($scope,AuthenService){
    $scope.user = {};
    $scope.register = function(){
        AuthenService.register($scope.user).then(function(response){
            $scope.message = response.data.message;
            $scope.user = {};
        },function(response){
            $scope.message = response.data.message;
            $scope.user = {};
        })
    }
});
//myApp.controller('authenticatedController',function($scope, AuthenService){
//    $scope.user = AuthenService.user;
//});
//
//myApp.controller('unauthenticatedController',function($scope, AuthenService){
//    $scope.user = AuthenService.user;
//});

myApp.factory('AuthenService',function($http){
   return{
       user: {},
       register:function(user){
           return $http.post('/register',user);
       },
       login:function(user){
           return $http.post('/login',user);
       },
       validate:function(){
           return $http.get('validate');
       }
   }
});