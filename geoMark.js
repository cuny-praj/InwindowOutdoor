var markers = new Array();
var points = new Array();
var tourMarkers = new Array();
window.onload = function() {
    $.ajax({
        type: "GET",
        dataType: "json",
        crossDomain: true,
        url: "locationsJson.json",
        beforeSend: function(x) {
            if (x && x.overrideMimeType) {
                x.overrideMimeType("application/j-son;charset=UTF-8");
            }
        },
        success: function(data) {
            markers = data.data;
            if (markers.length > 0) {
                initialize(markers);
            } else {
                setTimeout('', 1000); // check again in a second
            }
        }
    });
}

function initialize(markers) {
    var pinPoints = new Array();
    var mapOptions = {
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: new google.maps.LatLng(markers[0].latitude, markers[0].longitude)
    };
    var locations = new Array();
    map = new google.maps.Map(document.getElementById('dvMap'), mapOptions);
    latlngbounds = new google.maps.LatLngBounds();
    infowindow = new google.maps.InfoWindow();
    for (var i = 0; i < markers.length; i++) {
        locations[i] = [new google.maps.LatLng(markers[i].latitude, markers[i].longitude), markers[i].address];
        // Append a link to the markers DIV for each marker
        //$('#markers').append('<a class="marker-link" data-markerid="' + i + '" href="#">' + locations[i][1] + '</a> ');
        var $li = $('<li> </li>');
        $li.attr("id", markers[i].id);
        $li.append('<a class="marker-link" data-markerid="' + i + '" href="#">' + locations[i][1] + '</a> ');
        $("#list").append($li);
        var marker = new google.maps.Marker({
            position: locations[i][0],
            map: map,
            title: locations[i][1]
        });
        // Register a click event listener on the marker to display the corresponding infowindow content
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                var imagePath = 'Intern_Test/images/' + markers[i].img + '.jpg';
                // var contentString = "<p><img width='80' src='" + imagePath + "'/>" + locations[i][1] + "</p>";
                var contentString = "<div style='display: inline-block;padding:10px;'> <div style='float:left;border:1px solid;'> <img width='100' src='" + imagePath + "'/> </div> <div style='margin-top:20px;margin-left:20px'> " + locations[i][1] + " </div> </div>";
                infowindow.setContent(contentString);
                infowindow.open(map, marker);
                google.maps.event.addListener(infowindow, 'domready', function() {

                    // Reference to the DIV which receives the contents of the infowindow using jQuery
                    var iwOuter = $('.gm-style-iw');

                    /* The DIV we want to change is above the .gm-style-iw DIV.
                     * So, we use jQuery and create a iwBackground variable,
                     * and took advantage of the existing reference to .gm-style-iw for the previous DIV with .prev().
                     */
                    var iwBackground = iwOuter.prev();

                    // Remove the background shadow DIV
                    iwBackground.children(':nth-child(2)').css({
                        'display': 'none'
                    });

                    // Remove the white background DIV
                    iwBackground.children(':nth-child(4)').css({
                        'display': 'none'
                    });
                    iwOuter.parent().parent().css({
                        left: '115px'
                    });
                    iwBackground.children(':nth-child(1)').attr('style', function(i, s) {
                        return s + 'left: 76px !important;'
                    });

                    // Moves the arrow 76px to the left margin 
                    iwBackground.children(':nth-child(3)').attr('style', function(i, s) {
                        return s + 'left: 76px !important;'
                    });
                    iwBackground.children(':nth-child(3)').find('div').children().css({
                        'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px',
                        'z-index': '1'
                    });
                    var iwCloseBtn = iwOuter.next();

                    // Apply the desired effect to the close button
                    iwCloseBtn.css({
                        opacity: '1', // by default the close button has an opacity of 0.7
                        right: '30px',
                        top: '8px', // button repositioning
                        border: '3px solid #000066', // increasing button border and new color
                        'border-radius': '13px', // circular effect
                        'box-shadow': '0 0 5px #3990B9' // 3D effect to highlight the button
                    });

                    // The API automatically applies 0.7 opacity to the button after the mouseout event.
                    // This function reverses this event to the desired value.
                    iwCloseBtn.mouseout(function() {
                        $(this).css({
                            opacity: '1'
                        });
                    });
                });

            }
        })(marker, i));
        latlngbounds.extend(marker.position);
        // Add marker to markers array
        pinPoints.push(marker);
    }
    // Trigger a click event on each marker when the corresponding marker link is clicked
    $('.marker-link').on('click', function() {
        google.maps.event.trigger(pinPoints[$(this).data('markerid')], 'click');
    });
    var bounds = new google.maps.LatLngBounds();
    map.setCenter(latlngbounds.getCenter());
    map.fitBounds(latlngbounds);
}
$(document).ready(function() {
    var docked = 0;
    $("#dock li ul").height($(window).height());
    $("#dock .dock").click(function() {
        $(this).parent().parent().addClass("docked").removeClass("free");
        docked += 1;
        var dockH = ($(window).height()) / docked
        var dockT = 0;
        $("#dock li ul.docked").each(function() {
            $(this).height(dockH).css("top", dockT + "px");
            dockT += dockH;
        });
        $(this).parent().find(".undock").show();
        $(this).hide();
        if (docked > 0)
            $("#dvMap").css("margin-left", "220px");
        else
            $("#dvMap").css("margin-left", "40px");
    });
    $("#dock .undock").click(function() {
        $(this).parent().parent().addClass("free").removeClass("docked")
            .animate({
                left: "-180px"
            }, 200).height($(window).height()).css("top", "0px");
        docked = docked - 1;
        var dockH = ($(window).height()) / docked
        var dockT = 0;
        $("#dock li ul.docked").each(function() {
            $(this).height(dockH).css("top", dockT + "px");
            dockT += dockH;
        });
        $(this).parent().find(".dock").show();
        $(this).hide();
        if (docked > 0)
            $("#dvMap").css("margin-left", "220px");
        else
            $("#dvMap").css("margin-left", "40px");
    });
    $("#dock li").hover(function() {
        $(this).find("ul").animate({
            left: "40px"
        }, 200);
    }, function() {
        $(this).find("ul.free").animate({
            left: "-180px"
        }, 200);
    });
    $("#check li:gt(3)").click(function() {
        console.log(this.id);
    });
    $('#search').keyup(function() {
        var searchField = $('#search').val();
        var myExp = new RegExp(searchField, 'i');
        $.getJSON('locationsJson.json', function(data) {
            //output = '<ul class="searchresult">';
            output = '';
            dataArray = eval(data.data);
            $.each(dataArray, function(key, val) {
                if (val.address.search(myExp) != -1) {
                    //$.each($.parseJSON(JSON.stringify(val)), function() {
                    //console.log(this.latitude);
                    output = this.address;
                    //}
                }
            });
        });
        //output += '</ul>';
        $('#searchResult #update').html(output);
    });
    $("#uploadTrigger").click(function() {
        $("#uploadFile").click();
    });
});

function setNextDivUp(divId) {
    var imgDiv = document.getElementById(divId);
    imgDiv.style.visibility = 'visible';
}

function previewFile() {
    var preview = document.querySelector('img');
    var file = document.querySelector('input[type=file]').files[0];
    reader = new FileReader();
    reader.onloadend = function() {
        preview.src = reader.result;
        console.log(reader.result);
        document.getElementById('markerLink').style.visibility = 'visible';
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.drawImage(preview, 0, 0);
        var data = context.getImageData(0, 0, preview.width, preview.height).data;
        localStorage.setItem('image', data);
    }
    if (file) {
        reader.readAsDataURL(file);
    } else {
        preview.src = "";
    }
}

function pinPointMarker() {
    tourMarker = '';
    tourMarkers = new Array();
    google.maps.event.addListener(map, 'click', function(event) {
        placeMarker(event.latLng);
    });

    function placeMarker(location) {
        if (tourMarker == '') {
            tourMarker = new google.maps.Marker({
                position: location,
                map: map,
                icon: 'flag.png',
                animation: google.maps.Animation.DROP,
                draggable: true
            });
        } else {
            tourMarker.setPosition(location);
        }
        google.maps.event.addListener(tourMarker, 'click', (function(tourMarker) {
            return function() {
                tourMarker.setDraggable(false);
                var contentString = "<p><img width='80' src='" + reader.result + "'/>" + locationName + "</p>";
                infowindow.setContent(contentString);
                infowindow.open(map, tourMarker);
            }
        })(tourMarker));
        pinPoint = location;
        tourMarkers.push(tourMarker);
        setNextDivUp('operation');
    }
}

function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

function addLocation() {
    locationName = document.getElementById('location').value;
    var picture = localStorage.getItem('image');
    points[points.length] = [locationName, picture, pinPoint];
    document.getElementById('location').value = "";
    document.getElementById('markerImage').src = "#";
    /*var imagetry = document.createElement('imagegain');
    imagetry.src = picture;
    document.getElementById('imgMarker').appendChild(imagetry); */
}

function createTour() {
    var flightPlanCoordinates = new Array();
    if (points.length > 1) {
        for (var i = 0; i < points.length; i++) {
            flightPlanCoordinates[i] = points[i][2];
            // latlngbounds.extend(tourMarkers[i]);
        }
        var flightPath = new google.maps.Polyline({
            path: flightPlanCoordinates,
            geodesic: true,
            strokeColor: '#ffff00',
            strokeOpacity: 2.0,
            strokeWeight: 3
        });
        flightPath.setMap(map);
    } else {
        alert("Please add at least one more location!");
    }
}