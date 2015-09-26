angular.module('BDLibApp.controllers', ['ui.router','angular.directives-round-progress'])

  .controller('AppCtrl', ['ViewsService','$cacheFactory','ngPouch','$state','$scope', '$ionicSideMenuDelegate', function (ViewsService,$cacheFactory,ngPouch,$state,$scope, $ionicSideMenuDelegate) {

      // check if remotedb has already been initialized
      // if yes, create views, if not redirect to preferences page
      if (ngPouch.getSettings().database === undefined) {
        $state.go('app.preferences',{
          init: 0
        });
      } else {
        ViewsService.create();
      }
    }
  ])

  .controller('PreferenceCtrl', ['$cacheFactory','ngPouch','$ionicPopup', '$scope', '$state','$log', function ($cacheFactory,ngPouch, $ionicPopup, $scope, $state, $log) {
      $scope.data = {};

      if (ngPouch.getSettings().database === undefined) {
        // si l'applcation n'est pas initialisée, créer une valeur par défault
        $scope.data.url = "http://localhost:5984/bdlibdev";
      } else {
        // sinon aller chercher la valeur sauvegardée précédemment
          $scope.data.url = ngPouch.getSettings().database;
      }

      $scope.updateRemoteUrl = function () {
          if (ngPouch.getSettings().database != $scope.data.url) {
              $log.info("PreferenceCtrl - ngPouch DB setting before "+JSON.stringify(ngPouch.getSettings())+' - after : '+$scope.data.url);
              ngPouch.resetAndSaveSettings({database:$scope.data.url,stayConnected: true });
              $log.info("db settings updated");
              var alertPopup = $ionicPopup.alert({
                title: 'Confirmation',
                template: 'DB distante changée'
              });
              alertPopup.then(function(res) {
                $state.go('app.home');
              });
          }
      };
  }
  ])

  .controller('ConfirmCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {
    $scope.msg = $stateParams.msg;
    $scope.returnState=$stateParams.state;
    $scope.id=$stateParams.id;
  }
  ])

  .controller('EditeurCtrl', ['CRUDService', '$scope', '$ionicModal', '$state', '$log',
    function (CRUDService, $scope, $ionicModal, $state, $log) {
      // Load the add / change dialog from the given template URL
      $ionicModal.fromTemplateUrl('pages/add-change-editeur-dialog.html', function (modal) {
        $scope.addDialog = modal;
      }, {
        scope: $scope,
        animation: 'slide-in-up'
      });

      $scope.showAddChangeDialog = function (action) {
        $scope.action = action;
        $scope.addDialog.show();
      };

      $scope.leaveAddChangeDialog = function () {
        // Remove dialog
        $scope.addDialog.remove();
        // Reload modal template to have cleared form
        $ionicModal.fromTemplateUrl('pages/add-change-editeur-dialog.html', function (modal) {
          $scope.addDialog = modal;
        }, {
          scope: $scope,
          animation: 'slide-in-up'
        });
      };

      // Get list from storage
      CRUDService.getList("editeur","filterOnEditeur")
        .then(function (res) {
          // Update UI (almost) instantly
          $scope.list = res;
          $log.info('EditeurCtrl - Editeur list : ' + JSON.stringify($scope.list));
        })
        .catch(function (err) {
          $state.go('errorModal', {
            msg: "Impossible d'accéder à la liste d'éditeurs" + JSON.stringify(err)
          });
        });

      // Used to cache the empty form for Edit Dialog
      $scope.saveEmpty = function (form) {
        $scope.form = angular.copy(form);
      };

      $scope.addItem = function (form) {
        var newItem = {};
        // Add values from form to object
        newItem.nom = form.nom.$modelValue;
        CRUDService.addItem(newItem,"editeur")
          .then(function (res) {
            // Update UI (almost) instantly
            $scope.list.push(res);
            $scope.leaveAddChangeDialog();
          })
          .catch(function (err) {
            $state.go('errorModal', {
              msg: "Impossible de sauvegarder l'éditeur - erreur : " + JSON.stringify(err)
            });
          });
      // Close dialog
    };

      $scope.removeItem = function (item) {
        // Search & Destroy item from list
        $scope.list.splice($scope.list.indexOf(item), 1);
        // Save list in factory
        CRUDService.deleteItem(item,"editeur");
      };

      $scope.showEditItem = function (item) {
        // Remember edit item to change it later
        $scope.tmpEditItem = item;

        // Preset form values
        //				$scope.form.nom.$setViewValue(item.editeur.nom)
        $scope.nom = item.editeur.nom;
        //				$scope.nom.$setViewValue(item.editeur.nom)
        $scope.id = item._id;
        // Open dialog
        $scope.showAddChangeDialog('change');
      };

      $scope.editItem = function (form) {
        var item = {};
        item.editeur = {};
        item.editeur.nom = form.nom.$modelValue;
        item._id = form.id.$modelValue;

        CRUDService.updateItem(item,"editeur");
        $scope.list[$scope.list.indexOf($scope.tmpEditItem)] = item;

        $scope.leaveAddChangeDialog();
      };
    }
  ])

  .controller('SeriesCtrl', ['CRUDService', '$scope', '$ionicModal', '$ionicPopup','$state', '$log',
    function (CRUDService, $scope, $ionicModal, $ionicPopup, $state, $log) {

      $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        $log.info('SeriesCtrl - stateChangeSuccess event');
        switch (toState.name) {
          case 'app.series' :
            // Get list from storage
            CRUDService.getList("serie","filterOnSerie")
              .then(function (res) {
                // Update UI (almost) instantly
                $scope.list = res;
              })
              .catch(function (err) {
                $state.go('errorModal', {
                  msg: "Impossible d'accéder à la liste de séries " + JSON.stringify(err)
                });
              });

              CRUDService.getList("genre","filterOnGenre")
              .then(function (res) {
                // Update UI (almost) instantly
                $scope.genreList = res;
                $log.info('SeriesCtrl - Genre list : ' + JSON.stringify($scope.genreList));
              })
              .catch(function (err) {
                $state.go('errorModal', {
                  msg: "Impossible d'accéder à la liste de genres " + JSON.stringify(err)
                });
              });
            break;
        }
      });

      // Load the add / change dialog from the given template URL
      $ionicModal.fromTemplateUrl('pages/add-change-serie-dialog.html', function (modal) {
        $scope.addDialog = modal;
      }, {
        scope: $scope,
        animation: 'slide-in-up'
      });

      $scope.showAddChangeDialog = function (action) {
        $scope.action = action;
        $scope.addDialog.show();
      };

      $scope.leaveAddChangeDialog = function () {
        // Remove dialog
        $scope.addDialog.remove();
        // Reload modal template to have cleared form
        $ionicModal.fromTemplateUrl('pages/add-change-serie-dialog.html', function (modal) {
          $scope.addDialog = modal;
        }, {
          scope: $scope,
          animation: 'slide-in-up'
        });
      };

      // Used to cache the empty form for Edit Dialog
      $scope.saveEmpty = function (form) {
        $scope.id = '';
        $scope.nom = '';
        $scope.genre = '';
      //				$scope.form = angular.copy(form)
    };

      $scope.addItem = function (form) {
        var newItem = {};
        // Add values from form to object
        newItem.nom = form.nom.$modelValue;
        newItem.genre = form.genre.$modelValue;
        CRUDService.addItem(newItem,"serie")
          .then(function (res) {
            // Update UI (almost) instantly
            CRUDService.getList("serie","filterOnSerie")
              .then(function (res) {
                // Update UI (almost) instantly
                $scope.list = res;
              })
              .catch(function (err) {
                $state.go('errorModal', {
                  msg: "Impossible d'accéder à la liste de séries " + JSON.stringify(err)
                });
              });
            $scope.leaveAddChangeDialog();
          })
          .catch(function (err) {
            $state.go('errorModal', {
              msg: "Impossible de sauvegarder l'éditeur - erreur : " + JSON.stringify(err)
            });
          });
      // Close dialog
    };

      $scope.removeItem = function (item) {
        // show confirmation dialog
        var confirmPopup = $ionicPopup.confirm({
          title: 'Confirmation',
          template: 'Etes-vous sûr de supprimer la série ? Ceci supprimera tes les albums de la série également !!!'
        });
        confirmPopup.then(function(res) {
          if(res) {
            // Search & Destroy item from list
            $scope.list.splice($scope.list.indexOf(item), 1);
            // delete item from DB
            CRUDService.deleteItem(item,"serie");
          } else {
            console.log('You are not sure');
          }
        });
      };

      $scope.showEditItem = function (item) {
        // Remember edit item to change it later
        $state.go('app.serie', {
          serieId: item._id
        });
      };

      $scope.editItem = function (form) {
        var item = {};
        item.serie = {};
        item.serie.nom = form.nom.$modelValue;
        item.serie.genre = form.genre.$modelValue;
        item._id = form.id.$modelValue;

        CRUDService.updateItem(item,"serie");
        $scope.list[$scope.list.indexOf($scope.tmpEditItem)] = item;
        $scope.leaveAddChangeDialog();
      };
    }
  ])

  .controller('SerieCtrl', ['CRUDService', '$scope', '$ionicModal', '$ionicPopup', '$state', '$log', '$stateParams',
    function (CRUDService, $scope, $ionicModal, $ionicPopup, $state, $log, $stateParams) {

      $scope.id = $stateParams.serieId;
      $scope.serie = $scope.serie || {};
      $scope.album = $scope.album || {};
      $scope.serieId = ($stateParams.serieId) ?  $stateParams.serieId : "";
      $scope.album.numero = ($stateParams.albumNr) ? $stateParams.albumNr : null;
      $log.info('SerieCtrl - serie id parameter : ' + $scope.serieId);

      if ($scope.serieId) {
        CRUDService.getList("genre","filterOnGenre")
          .then(function (res) {
            // Update UI (almost) instantly
            $scope.genreList = res;
            $log.info('SerieCtrl - Genre list : ' + JSON.stringify($scope.genreList));
            // Get list from storage - if this part is not done inside the then, this creates very strange effects and options are not correctly filled in
            CRUDService.getItem($scope.serieId,"serie")
              .then(function (res) {
                // Update UI (almost) instantly
                $scope.serie = res.serie;
                $scope.serieRev = res._rev;
                $scope.albums = res.serie.albums;
                $log.info('SerieCtrl - Serie : ' + JSON.stringify($scope.serie));
              })
              .catch(function (err) {
                $state.go('errorModal', {
                  msg: "Impossible d'accéder aux données de la série" + JSON.stringify(err)
                });
              });
          })
          .catch(function (err) {
            $state.go('errorModal', {
              msg: "Impossible d'accéder à la liste de genres " + JSON.stringify(err)
            });
          });
      }

      $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        $log.info('SerieCtrl - stateChangeSuccess event');
        switch (fromState.name) {
          case 'app.series' :
          case 'app.serie.album' :
            if ($scope.serieId) {
              CRUDService.getList("genre","filterOnGenre")
                .then(function (res) {
                  // Update UI (almost) instantly
                  $scope.genreList = res;
                  $log.info('SerieCtrl - Genre list : ' + JSON.stringify($scope.genreList));
                  // Get list from storage - if this part is not done inside the then, this creates very strange effects and options are not correctly filled in
                  CRUDService.getItem($scope.serieId,"serie")
                    .then(function (res) {
                      // Update UI (almost) instantly
                      $scope.serie = res.serie;
                      $scope.serieRev = res._rev;
                      $scope.albums = res.serie.albums;
                      $log.info('SerieCtrl - Serie : ' + JSON.stringify($scope.serie));
                    })
                    .catch(function (err) {
                      $state.go('errorModal', {
                        msg: "Impossible d'accéder aux données de la série" + JSON.stringify(err)
                      });
                    });
                })
                .catch(function (err) {
                  $state.go('errorModal', {
                    msg: "Impossible d'accéder à la liste de genres " + JSON.stringify(err)
                  });
                });
            }
            break;
        }
      });

      $scope.updateSerie = function() {
        CRUDService.updateItem($scope.serieId,$scope.serieRev,$scope.serie,"serie")
        .then(function(res) {
          var alertPopup = $ionicPopup.alert({
            title: 'Confirmation',
            template: 'Série mise à jour'
          });
          alertPopup.then(function(res) {
            $state.go('app.serie', {
              serieId: $scope.serieId
            });
          });
        });
      };

      $scope.createAlbum = function() {
        $state.go('app.serie.album',{
          "serieId": $scope.id,
          "albumNr": ""
        });
      };

      $scope.deleteAlbum = function(album) {
        for (var i=0; i < $scope.serie.albums.length; i++) {
          if ($scope.serie.albums[i].numero == album.numero) {
            $scope.serie.albums.splice(i,1);
            // delete $scope.serie.albums[i];
            // // la longueur de l'array ne semble pas se mettre à jour automatiquement ???
            // $scope.serie.albums.length--;
            break;
          }
        }
        CRUDService.updateItem($scope.serieId,$scope.serieRev,$scope.serie,"serie")
        .then(function(res) {
          var alertPopup = $ionicPopup.alert({
            title: 'Confirmation',
            template: 'Album mis à jour'
          });
          alertPopup.then(function(res) {
            $state.go('app.serie', {
              serieId: $scope.serieId
            });
          });
        });
      };

      $scope.editAlbum = function(album) {
          $state.go('app.serie.album', {
            serieId : $scope.id,
            albumNr : album.numero
          });
      };

    }
  ])

  .controller('AlbumCtrl', ['CRUDService', '$scope', '$ionicModal', '$ionicPopup', '$state', '$log', '$stateParams',
    function (CRUDService, $scope, $ionicModal, $ionicPopup, $state, $log, $stateParams) {

      $scope.album = {};
      $scope.serieId = ($stateParams.serieId) ?  $stateParams.serieId : "";
      $scope.albumNr = ($stateParams.albumNr) ? $stateParams.albumNr : null;
      $log.info('AlbumCtrl - serieId / albumNr : ' + $scope.serieId + " / "+$scope.albumNr);

      CRUDService.getList("editeur","filterOnEditeur")
        .then(function (result) {
          $scope.editeurList=result;
          if ($scope.serieId) {
            // Charger la série identifiée par son serieId
            CRUDService.getList("serie","filterOnSerie")
              .then(function (result) {
                $scope.serieList=result;
                CRUDService.getItem($scope.serieId,"serie")
                    .then(function (res) {
                      // Update UI (almost) instantly
                      $scope.serie = res.serie;
                      $scope._id=res._id;
                      $scope._rev=res._rev;
                      $log.info('AlbumCtrl - serie : ' + JSON.stringify($scope.serie));

                      // si serieId et albumNr existent, on vient du state 'serie' ou 'home' et on a sélectionné un album pour modification
                      if($scope.albumNr) {
                        // charger l'album sélectionné dans le scope
                        if ($scope.albumNr && $scope.serie.albums) {
                          for (var i=0; i < $scope.serie.albums.length; i++) {
                            if ($scope.serie.albums[i].numero == $scope.albumNr) {
                              $scope.album = res.serie.albums[i];
                              $scope.album.serieId = $scope.serieId;
                              $scope.oldAlbumNr = $scope.serie.albums[i].numero;
                              break;
                            }
                          }
                        }
                      } else {
                        // si serieId existe et albumNr n'existe pas, on vient du state 'serie' et on veut créer un nouvel album
                        $scope.album.serieId = $scope.serieId;
                      }
                    })
                    .catch(function (err) {
                      $state.go('errorModal', {
                        msg: "Impossible d'accéder aux données de l'album" + JSON.stringify(err)
                      });
                    });
              })
              .catch(function (err) {
                $state.go('errorModal', {
                  msg: "Impossible d'accéder à la liste des séries" + JSON.stringify(err)
                });
              });
            }

          // si serieId et albumNr n'existent pas, on vient du menu album pour créer un nouvel album
          if (!$scope.serieId) {
            // Charger la liste des séries dans le scope
            CRUDService.getList("serie","filterOnSerie")
              .then(function (result) {
                $scope.serieList=result;
              })
              .catch(function (err) {
                $state.go('errorModal', {
                  msg: "Impossible d'accéder à la liste des séries" + JSON.stringify(err)
                });
              });
          }
        })
        .catch(function (err) {
          $state.go('errorModal', {
            msg: "Impossible d'accéder à la liste des éditeurs" + JSON.stringify(err)
          });
        });


      $scope.addAlbum = function() {
          var duplicate = false;
          if (!$scope.serieId) {
            // fetch serie based on serieId
            CRUDService.getItem($scope.album.serieId,"serie")
              .then(function (res) {
                // Update UI (almost) instantly
                $scope.serie = res.serie;
                $scope._id=res._id;
                $scope.serieId=res._id;
                $scope._rev=res._rev;
                // Contrôler qu'il n'a a pas déjà un album portant le même numéro
                if ($scope.serie.albums) {
                  for (var i=0; i < $scope.serie.albums.length; i++) {
                    if ($scope.serie.albums[i].numero == $scope.album.numero) {
                      // album avec le même numéro trouvé => doublon => générer message d'erreur
                      duplicate=true;
                    }
                  }
                } else {
                  $scope.serie.albums = [];
                }

                if (!duplicate) {
                  delete $scope.album.serieId;
                  $scope.serie.albums.push($scope.album);
                  CRUDService.updateItem($scope._id, $scope._rev,$scope.serie,"serie")
                  .then(function(res) {
                    if ($scope.comingFromSerie) {
                        $log.info('AlbumCtrl - going back to serie screen');
                        $state.go('app.serie', {
                          "serieId" : $scope.serieId
                        },{reload:true});
                        // $log.info('AlbumCtrl - reloading app.serie state');
                        // $state.reload('app.serie');
                    } else {
                      // go back home in case album is created without coming from the Serie screen
                      var alertPopup = $ionicPopup.alert({
                        title: 'Confirmation',
                        template: 'Album créé'
                      });
                      alertPopup.then(function(res) {
                        $state.go('app.serie', {
                          serieId: $scope.serieId
                        });
                      });
                    }
                  });
                } else {
                  var alertPopup = $ionicPopup.alert({
                    title: 'Erreur',
                    template: "<style>.popup-head { background-color : red; }</style>Le numéro de l'album existe déjà"
                  });
                  alertPopup.then(function(res) {
                  });
                }
              })
              .catch(function (err) {
                $state.go('errorModal', {
                  msg: "Impossible d'accéder aux données de l'album" + JSON.stringify(err)
                });
              });
          }

          // Contrôler qu'il n'a a pas déjà un album portant le même numéro
          if ($scope.serie.albums) {
            for (var i=0; i < $scope.serie.albums.length; i++) {
              if ($scope.serie.albums[i].numero == $scope.album.numero) {
                // album avec le même numéro trouvé => doublon => générer message d'erreur
                duplicate=true;
                $state.go('errorModal', {
                  msg: "Le numéro de l'album existe déjà"
                });
              }
            }
          } else {
            $scope.serie.albums = [];
          }

          if (!duplicate) {
            delete $scope.album.serieId;
            $scope.serie.albums.push($scope.album);
            CRUDService.updateItem($scope._id, $scope._rev,$scope.serie,"serie")
            .then(function(res) {
              if ($scope.comingFromSerie) {
                  $log.info('AlbumCtrl - going back to serie screen');
                  $state.go('app.serie', {
                    "serieId" : $scope.serieId
                  },{reload:true});
                  // $log.info('AlbumCtrl - reloading app.serie state');
                  // $state.reload('app.serie');
              } else {
                // go back home in case album is created without coming from the Serie screen
                var alertPopup = $ionicPopup.alert({
                  title: 'Confirmation',
                  template: 'Album créé'
                });
                alertPopup.then(function(res) {
                  $state.go('app.serie', {
                    serieId: $scope.serieId
                  });
                });
              }
            });
          }  else {
            var alertPopup = $ionicPopup.alert({
              title: 'Erreur',
              template: "<style>.popup-head { background-color : red; }</style>Le numéro de l'album existe déjà"
            });
            alertPopup.then(function(res) {
            });
          }
      };

      $scope.deleteAlbum = function() {
        for (var i=0; i < $scope.serie.albums.length; i++) {
          if ($scope.serie.albums[i].numero == $scope.album.numero) {
            $scope.serie.albums.splice(i,1);
            break;
          }
        }
        CRUDService.updateItem($scope._id,$scope._rev,$scope.serie,"serie")
        .then(function(res) {
          var alertPopup = $ionicPopup.alert({
            title: 'Confirmation',
            template: 'Album mis à jour'
          });
          alertPopup.then(function(res) {
            $state.go('app.serie', {
              serieId: $scope.serieId
            });
          });
        });
      };

      $scope.updateAlbum = function() {
        // Si l'ancien numéro est différent, contrôler qu'il n'y pas de doublon
        if ($scope.oldAlbumNr != $scope.albumNr) {
          // Contrôler qu'il n'a a pas déjà un album portant le même numéro
          for (var i=0; i < $scope.serie.albums.length; i++) {
            if ($scope.serie.albums[i].numero == $scope.album.numero) {
              // album avec le même numéro trouvé => doublon => générer message d'erreur
              $state.go('errorModal', {
                msg: "Le numéro de l'album existe déjà"
              });
            }
          }
        }
        CRUDService.updateItem($scope._id, $scope._rev,$scope.serie,"serie")
        .then(function(res) {
          var alertPopup = $ionicPopup.alert({
            title: 'Confirmation',
            template: 'Album mis à jour'
          });
          alertPopup.then(function(res) {
            $state.go('app.serie', {
              serieId: $scope.serieId
            });
          });
        });
      };

      $scope.createAlbum = function() {
        $state.go('app.albums',{
          serieid: $scope.id
        });
      };
    }
  ])

  .controller('BiblioCtrl', function ($scope) {
    $scope.Model = $scope.Model || {Name : "xxx"};
  })

  .controller('ImportAlbumsCtrl', ['$scope','CRUDService','$ionicPopup','$state','$log', function ($scope, CRUDService,$ionicPopup,$state,$log) {
//    $scope.data = $scope.data || {Name : "xxx"};
    $scope.progressData = {
      label: 0,
      percentage: 0.0
    };
    $scope.data = {};
    var totalLinesToProcess = 0;
    var serieList;
    var findSerieIdx = function(nomSerie){
      for (i = 0; i < serieList.length; i++) {
        if (serieList[i].serie.nom == nomSerie) {
          return(i);
          //return [serieList[i]];
        }
      }
      // var newSerie = {type:"Serie",serie:{nom: nomSerie}};
      // serieList.push(newSerie);
      // return [];
      return (-1);
    };

    $scope.importCSVData = function() {
      var importedSerieList = [];
      var importedEditeurList = [];
      var editeurList = [];
      var updateSerieIdxList = [];
      CRUDService.getList("editeur","filterOnEditeur")
      .then(function(editeurs) {
        editeurList=editeurs;
      });
      var importedData = Papa.parse($scope.data.csvData,{delimiter: ";"});
      $scope.added = 0;
      $scope.updated = 0;
      $scope.skipped = 0;
      totalLinesToProcess = importedData.data.length;
      // charger toutes les séries pour éviter de refaire une recherche sur le nom de série pour chaque ligne
      CRUDService.getList("Serie","filterOnSerie")
      .then(function(series){
        importedData.data.forEach(function(element,index) {
          $log.info("[ImportController]importing element #"+index+JSON.stringify(element));
          var serie;
          serieList = series;
          $scope.progressData.percentage = index/(totalLinesToProcess-1);
          $scope.progressData.label = Math.round($scope.progressData.percentage*100);
          $scope.$apply($scope.progressData);
          // pour toutes les lignes autres que la première ligne contenant les headers des colonnes, on éxecute la fonction
          if (!(index===0 && element[0]=="Série")) {
              // rechercher nom de série dans la liste compléte des séries
              // si la serie n'existe pas, créer la série et l'album
              serieIdx = findSerieIdx(element[0]);
              if (editeurList.indexOf(element[3])==-1) {
                importedEditeurList.push(element[3]);
              }
              if (serieIdx == -1){
                serie = {"nom":element[0],"albums":[{"numero":element[1],"nom":element[2],"editeur":element[3],"dateParution":element[4],"ISBN":element[6],"estimation":element[7]}]};
                var newSerieDoc = {type:"Serie",serie:serie,status:"new"};
                var newIdx = serieList.length;
                serieList.push(newSerieDoc);
                importedSerieList.push(newIdx);
                //Si l'éditeur n'existe pas encore, l'ajouter à la liste des édituers
              } else // la serie existe, vérifier si l'album n'existe pas déjà.
              {
                // si il n'existe pas, ajouter l'album.
                  var exist=false;
                  if (serieList[serieIdx].serie.albums === undefined)
                    exist=false;
                  else {
                    serieList[serieIdx].serie.albums.forEach(function(el,ind){
                      if (element[1]==el.numero && element[2]==el.nom && element[4]==el.dateParution)
                        exist=true;
                    });
                  }
                  if (!exist) {
                    album = {"numero":element[1],"nom":element[2],"editeur":element[3],"dateParution":element[4],"ISBN":element[6],"estimation":element[7]};
                    if (serieList[serieIdx].serie.albums === undefined)
                      serieList[serieIdx].serie.albums=[];
                    serieList[serieIdx].serie.albums.push(album);
                    // ajouter la série à la liste des séries à updater si elle ne fait pas déjà partie de cette liste ou si elle n'est pas nouvellement créée
                    if (updateSerieIdxList.indexOf(serieIdx)==-1 && serieList[serieIdx].status===undefined)
                      updateSerieIdxList.push(serieIdx);
                    else {
                      $scope.updated++;
                    }
                  } else {
                    $scope.skipped++;
                  }
              }
          } else {
            // on traite la ligne contenant le nom des colonnes, il ne faut pas la compter dans le total des lignes à processer
            totalLinesToProcess--;
          }
        });
        for(i=0;i<importedSerieList.length;i++) {
          CRUDService.addItem(serieList[importedSerieList[i]].serie,"Serie")
          .then(function(){
            $scope.added++;
          })
          .catch(function(){
            $log.error("Erreur dans la création de la série et de l'album lors de l'import");
          });
        }
        for(i=0;i<updateSerieIdxList.length;i++) {
          serieDoc = serieList[updateSerieIdxList[i]];
          CRUDService.updateItem(serieDoc._id, serieDoc._rev,serieDoc.serie,"Serie")
          .then(function(){
            $scope.updated++;
          })
          .catch(function(){
            $log.error("Erreur dans la mise à jour de la série lors d'un ajout d'album lors de l'import");
          });
        }
        for (i=0;i<importedEditeurList.length;i++) {
          CRUDService.addItem(importedEditeurList(i),"editeur")
          .then(function(){
            $scope.editeurAdded++;
          })
          .catch(function(){
            $log.error("Erreur dans la création de l'éditeur lors de l'import");
          });
        }
      });
    };

    $scope.$watch(function(){return($scope.added+$scope.updated+$scope.skipped);}, function(newValue, oldValue) {
      if (totalLinesToProcess>0 && $scope.added+$scope.updated+$scope.skipped >= totalLinesToProcess) {
        // afficher écran indiquant que le processus d'import est terminé plus le résultat
        var alertPopup = $ionicPopup.alert({
          title: 'Confirmation',
          template: '<i>Résultat Import albums</i><br>'+$scope.added+' albums added<br>'+$scope.updated+' albums updated<br>'+$scope.skipped+' albums non importés'
        });
        alertPopup.then(function(res) {
          $state.go('app.home');
        });
      }
    });
  }])

  .controller('HomeCtrl', ['$scope','CRUDService', 'SearchAlbumService', '$log', '$state', '$ionicHistory', function($scope, CRUDService, SearchAlbumService, $log, $state, $ionicHistory) {
    $ionicHistory.clearHistory();

    $scope.$on('$ionicView.afterEnter', function(){
      setTimeout(function(){
        document.getElementById("custom-overlay").style.display = "none";
      }, 3000);
    });

    // Chargement de tous les albums en mémoire pour recherche par substring (like '%mar%')
      $scope.data = { "albums" : [], "search" : '' };
      $scope.search = function() {
        if ($scope.data.search.length >= 3) {
          SearchAlbumService.searchAlbums($scope.data.search).then(
        		function(matches) {
        			$scope.data.albums = matches;
        		}
        	);
        }
      };

      $scope.import = function() {
        var serieList = new HashMap();
        var serie;
        for (i=0;i<bdtheque.length;i++) {
          if (!serieList.has(bdtheque[i].serie)) {
            serie = {nom:bdtheque[i].serie,albums:[]};
          } else {
            serie = serieList.get(bdtheque[i].serie);
          }
          var album = {numero:bdtheque[i].numero,nom:bdtheque[i].nom,editeur:bdtheque[i].editeur,dateParution:bdtheque[i].dateparution,ISBN: bdtheque[i].isbn, estimation: bdtheque[i].estimation};
          serie.albums.push(album);
          serieList.set(bdtheque[i].serie,serie);
        }
        serieArray = serieList.values();
        for (i=0;i<serieArray.length;i++) {
          newItem = serieArray[i];
          CRUDService.addItem(newItem,"serie")
            .then(function (res) {
              $log.info('HomeCtrl - Serie : '+JSON.stringify(res)+' ajoutée');
            })
            .catch(function (err) {
              $state.go('errorModal', {
                msg: "Impossible d'importer les séries - " + JSON.stringify(err)
              });
            });
        }
      };
    }
  ])

  // test of nested views
  .controller('mainController', function ($scope) {
    $scope.Model = $scope.Model || {Name : "xxx"};
    $scope.nom = "main";
  })
  ;
