/**
 * Development: Mackson Araujo
 * Arcgis SigWeb
 */
require([
    "esri/WebMap",
    "esri/views/MapView",
    "esri/widgets/Expand",
    "esri/core/watchUtils",
    "esri/Graphic"
    ], function (WebMap, MapView, Expand, watchUtils, Graphic) {

    var viewDiv = document.getElementById("sigweb__viewDiv");
    var streetViewWindow = document.getElementById("streetViewWindow");
    var startWidget = document.getElementById("startWidget");
    var enableEndpointView = false;
    var existsPoint = false;
    var pointGraphic;
    var streetMapGooglePopup;

    const webmap = new WebMap({
        portalItem: {
          // autocasts as new PortalItem()
          id: "ea59225e90e34924a4e593269de347af"
        }
      });
            
    var webmap2d = new MapView({
        zoom: 12,
        map: webmap,
        container: "sigweb__viewDiv",
        popup: {
            defaultPopupTemplateEnabled: true,
            dockEnabled: false,
            dockOptions: {
                buttonEnabled: false,
                breakpoint: false
            }
        },
        navigation: {
            momentumEnabled: false
        },
    });

    LoadingView(webmap2d)
    

    //Loading View
    function LoadingView(view) {

        view.when(function () {

            // Display the loading indicator when the view is updating
            watchUtils.whenTrueOnce(view, "updating", function(evt) {
                document.querySelector(".sigweb__centered").style.display = "block";
            });

            // Hide the loading indicator when the view stops updating
            watchUtils.whenFalseOnce(view, "updating", function(evt) {
                document.querySelector(".sigweb__centered").style.display = "none";
            });

            //Display the loading indicator when the view is updating
            watchUtils.whenTrue(view, "updating", function(evt) {
                document.querySelector("#sigweb__loadingMap").style.display = "block";
                view.ui.add("sigweb__loadingMap", "top-left");
            });

            // Hide the loading indicator when the view stops updating
            watchUtils.whenFalse(view, "updating", function(evt) {
                document.querySelector("#sigweb__loadingMap").style.display = "none";
            });

            view.ui.components = [ "zoom"];

            // add legend, layerlist and basemapGallery widgets
            view.ui.add(
            [
                new Expand({
                    expandIconClass: "esri-icon-maps",
                    view: view,
                    content: streetViewWindow,
                    group: "top-right"
                })

            ],
            "top-right"
            );


            //Main Logo
            view.ui.add("sigweb__logoDiv", "top-left");
        

            /**
             * 
             * Google Street View Widget for Arcgis
             */

              function changerCursor(isCrosshair) {
                viewDiv.style.cursor = isCrosshair ? "crosshair" : "default";
              }
      
              function changerColorButton() {
                startWidget.classList.toggle('green');
              }
      
              function changerLatAndLng(lat, lng) {
                streetMapGooglePopup.location.search = "?lat=" + lat + "&lng=" + lng;
              }
      
              function changerGeometryOfMap(point) {
                pointGraphic.geometry = point;
              }
      
              function createWindowPopup(lat, lng) {
                var option = "toolbar=yes,scrollbars=yes,resizable=yes, type=fullWindow, fullscreen, top=0,left=0,width=500,height=400"
                streetMapGooglePopup = window.open(`./streetview.html?lat=${lat}&lng=${lng}`, "_blank", option);
              }
      
              function getCordanation(event) {
                // Get the coordinates of the click on the view
                var lat = event.mapPoint.latitude;
                var lng = event.mapPoint.longitude;
                return [lat, lng];
              }
      
              function createPoint(lat, lng) {
                var point = {
                  type: "point", // autocasts as new Point()
                  longitude: lng,
                  latitude: lat
                };
      
                var markerSymbol = {
                  type: "picture-marker",  // autocasts as new PictureMarkerSymbol()
                  url: "./static/images/graySVM.png",
                  width: "50px",
                  height: "50px"
                };
      
                // Create a graphic and add the geometry and symbol to it
                pointGraphic = new Graphic({
                  geometry: point,
                  symbol: markerSymbol
                });
      
                return pointGraphic;
              }
      
              function handleClickButton() {
                
                changerColorButton();
                enableEndpointView = !enableEndpointView;
                changerCursor(enableEndpointView);
      
                if (enableEndpointView === false) {
                    
                    if(streetMapGooglePopup){
                        streetMapGooglePopup.close();
                        //document.querySelector('.esri-popup').style.display = 'block'; 
                    }
                    ExistPoint = false;
                    if(pointGraphic){
                        pointGraphic.visible = false;
                    }
                    
                }
              }
      
              function handleWindowMessage(event) {
                var lat = event.data[0];
                var lng = event.data[1];
      
                var point = {
                  type: "point", // autocasts as new Point()
                  longitude: lng,
                  latitude: lat
                };
                pointGraphic.geometry = point;
              }
      
              function handleViewClick(event) {
                
                if (!enableEndpointView) {
                  return;
                }
                var latAndLng = getCordanation(event);
                var lat = latAndLng[0];
                var lng = latAndLng[1];
      
                if (!existsPoint) {
                  pointGraphic = createPoint(lat, lng);
                  view.graphics.add(pointGraphic);
                  createWindowPopup(lat, lng);
                  existsPoint = true;
                  pointGraphic.visible = true;
                  //document.querySelector('.esri-popup').style.display = 'none';
                } else {
                    pointGraphic.visible = true;
                    //document.querySelector('.esri-popup').style.display = 'none';
                  var point = {
                    type: "point", // autocasts as new Point()
                    longitude: lng,
                    latitude: lat
                  };
                  changerGeometryOfMap(point);
      
                  streetMapGooglePopup.closed ?
                    createWindowPopup(lat, lng) :
                    changerLatAndLng(lat, lng);
      
                  streetMapGooglePopup.focus();
                }
              }
      
              startWidget.addEventListener("click", handleClickButton);
              window.addEventListener('message', handleWindowMessage, false);
              view.on("click", handleViewClick);

        }, function(error){
            console.log(error)
        });
    }

});
