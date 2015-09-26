angular.module('BDLibApp.services', [])

	.factory('CRUDService', ['ngPouch', '$log', '$q', function (ngPouch, $log, $q) {

				var srv = {
					getList : function (entityType,viewName,options) {
						var defer = $q.defer();
						var list = [];
						//	viewName = "filterOn"+capitalizeFirstLetter(entityType);
						ngPouch.db.query(viewName,options)
						.then(function (result) {
							$log.debug("CRUDService - "+ entityType+ " list result : " + JSON.stringify(result));
							angular.forEach(result.rows, function (value, index) {
								item = value.value;
								item._id = value.id;
								list.push(item);
							});
							defer.resolve(list);
						}).catch (function (err) {
							$log.error("CRUDService - getList error " + JSON.stringify(err));
							defer.reject(err);
						});
						return defer.promise;
					},
					addItem : function (item,entityType) {
						var defer = $q.defer();
						var type = entityType.toLowerCase();
						var doc = {
							"type" : type
						};
						doc[type]=item;
						ngPouch.db.post(doc)
						.then(function (response) {
							$log.info("CRUDService - "+ entityType+ " " + JSON.stringify(item) + " ajouté");
							doc._id = response.id;
							defer.resolve(doc);
						}).catch (function (err) {
							$log.error("CRUDService - add "+ entityType+ " problem" + JSON.stringify(err));
							defer.reject(err);
						});
						return defer.promise;
					},
					updateItem : function (id,rev,item,entityType) {
						var defer = $q.defer();
						if (!id)
							defer.reject("pas d'identifiant pour update");
						var type = entityType.toLowerCase();
						doc={"_id":id,"_rev":rev,"type":type};
						doc[type]=item;
						if (!rev)
						{
							ngPouch.db.get(doc._id)
							.then(function (resdoc) {
									doc._rev = resdoc._rev;
								}).catch (function (err) {
									$log.error("CRUDService - update "+ entityType + " problem" + JSON.stringify(err));
									defer.reject(err);
								});
						}
						ngPouch.db.put(doc)
						.then(function(resultput) {
								$log.info("CRUDService - "+ entityType+ " " + JSON.stringify(resultput) + " updaté");
								defer.resolve(resultput);
							}).catch (function (err) {
								$log.error("CRUDService - update "+ entityType + " problem" + JSON.stringify(err));
								defer.reject(err);
							});
						return defer.promise;
					},
					deleteItem : function (item,entityType) {
						var defer = $q.defer();
						ngPouch.db.get(item._id)
						.then(function (doc) {
							item._rev = doc._rev;
							$log.info("CRUDService - "+ entityType+ " " + JSON.stringify(item) + " effacé");
							defer.resolve(ngPouch.db.remove(item));
						}).catch (function (err) {
							$log.error("CRUDService - delete "+ entityType+ " problem" + JSON.stringify(err));
							defer.reject(err);
						});
						return defer.promise;
					},
					getItem : function (itemid,entityType) {
						var defer = $q.defer();
						ngPouch.db.get(itemid)
						.then(function (doc) {
							defer.resolve(doc);
						}).catch (function (err) {
							$log.error("CRUDService - delete "+ entityType+ " problem" + JSON.stringify(err));
							defer.reject(err);
						});
						return defer.promise;
					}
				};
				return srv;
			}
		])

	.factory('ViewsService', ['ngPouch', '$log', '$q', function (ngPouch, $log, $q) {

			var srv = {
				create : function () {
						// Creation/update des view dans DB locale
						$log.info("Vérification des vues ...");

						var filterOnGenre = createDesignDoc('filterOnGenre', function(doc) {
																				if (doc.type == "genre") {
																					emit(doc._id, doc.genre.nom);
																				}
																			});
						ngPouch.db.get(filterOnGenre._id)
						.then(function(doc) {
							if (doc._rev) {
								filterOnGenre._rev=doc._rev;
							}
							if (cleanText(doc.views.filterOnGenre.map) != cleanText(filterOnGenre.views.filterOnGenre.map)) {
								$log.info("filterOnEditeur view updated");
								return ngPouch.db.put(filterOnGenre);
							} else {
								return null;
							}
						}).catch(function (err) {
							$log.error("filterOnGenre update problem"+JSON.stringify(err));
						});

						var filterOnEditeur = createDesignDoc('filterOnEditeur', function(doc) {
																				if (doc.type=="editeur") {
																					emit(doc._id, doc);
																				}
																			});
						ngPouch.db.get(filterOnEditeur._id)
						.then(function(doc) {
							if (doc._rev) {
								filterOnEditeur._rev=doc._rev;
							}
							if (cleanText(doc.views.filterOnEditeur.map) != cleanText(filterOnEditeur.views.filterOnEditeur.map)) {
								$log.info("filterOnEditeur view updated");
								return ngPouch.db.put(filterOnEditeur);
							} else {
								return null;
							}
						}).catch(function (err) {
							if (err.message=="missing") {
								ngPouch.db.post(filterOnEditeur)
								.then(function (response) {
									$log.info("filterOnEditeur view created");
								}).catch(function (err) {
									$log.error("filterOnEditeur view create problem"+JSON.stringify(err));
								});
							} else {
								$log.error("filterOnEditeur view update problem"+JSON.stringify(err));
							}
						});

						var filterOnSerie = createDesignDoc('filterOnSerie', function(doc) {
																				if (doc.type=="serie") {
																					emit(doc.serie.nom, doc);
																				}
																			});
						ngPouch.db.get(filterOnSerie._id)
						.then(function(doc) {
							if (doc._rev) {
								filterOnSerie._rev=doc._rev;
							}
							if (cleanText(doc.views.filterOnSerie.map) != cleanText(filterOnSerie.views.filterOnSerie.map)) {
								$log.info("filterOnSerie view updated");
								return ngPouch.db.put(filterOnSerie);
							} else {
								return null;
							}
						}).catch(function (err) {
							if (err.message=="missing") {
								ngPouch.db.post(filterOnSerie)
								.then(function (response) {
									$log.info("filterOnSerie view created");
								}).catch(function (err) {
									$log.error("filterOnSerie view create problem"+JSON.stringify(err));
								});
							} else {
								$log.error("filterOnSerie view update problem"+JSON.stringify(err));
							}
						});

						var listAlbumsBySerieId = createDesignDoc('listAlbumsBySerieId', function(doc) {
																				if (doc.type=="album") {
																					emit([doc.album.serieId,doc.album.numero], doc.album);
																				}
																			});
						ngPouch.db.get(listAlbumsBySerieId._id)
						.then(function(doc) {
							if (doc._rev) {
								listAlbumsBySerieId._rev=doc._rev;
							}
							if (cleanText(doc.views.listAlbumsBySerieId.map) != cleanText(listAlbumsBySerieId.views.listAlbumsBySerieId.map)) {
								$log.info("listAlbumsBySerieId view created");
								return ngPouch.db.put(listAlbumsBySerieId);
							} else {
								return null;
							}
						}).catch(function (err) {
							if (err.message=="missing") {
								ngPouch.db.post(listAlbumsBySerieId)
								.then(function (response) {
									$log.info("listAlbumsBySerieId view created");
								}).catch(function (err) {
									$log.error("listAlbumsBySerieId view create problem"+JSON.stringify(err));
								});
							} else {
								$log.error("listAlbumsBySerieId view update problem"+JSON.stringify(err));
							}
						});
					}
			};
			return srv;
		}
	])

	.factory('SearchAlbumService',['$q','$timeout','CRUDService', function($q, $timeout,CRUDService) {

	    var searchAlbums = function(searchFilter) {
	        console.log('Searching albums for ' + searchFilter);
					var albums = [];
	        var deferred = $q.defer();
					CRUDService.getList("serie","filterOnSerie")
			      .then(function (result) {
			        for (i=0;i<result.length;i++) {
								if (result[i].serie.albums) {
									for (j=0;j<result[i].serie.albums.length;j++) {
										album = result[i].serie.albums[j];
										album.serieId = result[i]._id;
				            albums.push(album);
				          }
								}
			        }
							var matches = albums.filter( function(album) {
					    	if(album.nom.toLowerCase().indexOf(searchFilter.toLowerCase()) !== -1 ) return true;
					    });

			        $timeout( function(){
			           deferred.resolve( matches );
			        }, 100);
			      })
			      .catch(function (err) {
							deferred.reject(err);
			      });
	        return deferred.promise;
	    };

	    return {
	        searchAlbums : searchAlbums
	    };
	}])


	;
