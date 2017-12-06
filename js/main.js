var app = angular.module('app', ['ui.bootstrap']);

app.controller('mainCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.showEmptySearchFieldError = false;
    $scope.showTableResult = false;
    $scope.showLoading = false;
    $scope.showNoResults = false;
    $scope.showPagination = false;
    $scope.showGihubResultsLimit = false;
    $scope.showGihubRateLimit = false;

    $scope.perPage = 10;
    $scope.messageGihubSearchLimit = 'Unfortunately by GitHub API politic only the first 1000 search results are available.';
    $scope.messageGihubRateLimit = 'Unfortunately by GitHub API politic you can make up to 30 requests per minute.';

    let isFirstView = true;
    let totalCount = 0;
    let currentRepoName = '';
    let baseUrl = 'https://api.github.com/search/repositories';
    let githubOAuth = '&client_id=9c47078cc02e07ce3a2a&client_secret=db4bd3885e42734a7865e172ba673dd9b60336a1';

    let gihubAPIErrorNotification = function(errorData) {
        console.error("Error: " + errorData.data.message, errorData);
        
        if(errorData.data.message.indexOf('API rate limit exceeded') >= 0) {
            $scope.showGihubRateLimit = true;
        }
    }


    $scope.findReposByName = function(repoNameInput, isSearchFormValid) {
        $scope.showEmptySearchFieldError = false;
        $scope.showTableResult = false;
        $scope.showLoading = true;
        $scope.showNoResults = false;  
        $scope.showPagination = false;
        $scope.showGihubResultsLimit = false;
        $scope.showGihubRateLimit = false;

        if(!isSearchFormValid) {
            $scope.showEmptySearchFieldError = true;
            $scope.showTableResult = false;
            $scope.showLoading = false;
            return;
        }

        currentRepoName = repoNameInput;
        $scope.currentPage = 1;

        $http({
            method: 'GET',
            url: baseUrl + '?q=' + currentRepoName
                + githubOAuth
                + '&per_page=' + $scope.perPage
                + '&page=' + $scope.currentPage
        })
        .then(
            function (reposData) {
                $scope.showLoading = false;

                if(reposData.data.total_count === 0) {
                    $scope.messageNoResults = 'Unfortunately no results for "' + currentRepoName + '".';
                    $scope.showNoResults = true;
                    return;
                }

                $scope.reposData = reposData;

                totalCount = reposData.data.total_count;
                $scope.totalItems = reposData.data.total_count > 1000 ? 1000 : reposData.data.total_count; //GitHub API limit
                
                if(isFirstView) {
                    document.getElementById("main-header").style.marginTop = "20px";
                    isFirstView = false;
                }

                $scope.showTableResult = true;
                $scope.showPagination = reposData.data.total_count > 10 ? true : false;
            },
            function (errorData) {
                $scope.showLoading = false;    
                $scope.showTableResult = false;
                
                gihubAPIErrorNotification(errorData);
            }
        );
    }

    $scope.pageChanged = function() {
        $http({
            method: 'GET',
            url: baseUrl + '?q=' + currentRepoName
                + githubOAuth
                + '&per_page=' + $scope.perPage
                + '&page=' + $scope.currentPage
        })
        .then(
            function (reposData) {
                $scope.reposData = reposData;

                $scope.showGihubResultsLimit = false;
                $scope.showGihubRateLimit = false;

                if (totalCount > 1000 && $scope.currentPage === Math.ceil(1000/$scope.perPage)) {
                    $scope.messageTotalCountOfSearchResults = 'Total count of search results by query "' + currentRepoName + '" is ' + totalCount + '.';
                    $scope.showGihubResultsLimit = true;
                }
            },
            function (errorData) {
                $scope.showLoading = false;

                gihubAPIErrorNotification(errorData);
            }
        );
    };

}]);
