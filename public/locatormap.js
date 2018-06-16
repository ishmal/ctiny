/**
 * Simple maidenhead locator map
 *
 *  MIT License
 *
 *  Copyright (c) 2013, Bob Jamison
 *  
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of this
 *  software and associated documentation files (the "Software"), to deal in the Software
 *  without restriction, including without limitation the rights to use, copy, modify, merge,
 *  publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
 *  to whom the Software is furnished to do so, subject to the following conditions:
 *  
 *  The above copyright notice and this permission notice shall be included in all copies or
 *  substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 *  INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 *  PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 *  FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 *  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 *  DEALINGS IN THE SOFTWARE.
 *  
 */
class LocatorMap {

    constructor(anchorname, w, h) {

        let anchor = document.getElementById(anchorname);

        /**
         * This is the main setup function.  Here we create a GoogleMap and nail it
         * to the anchorname tag.  We also create a rectangle for showing the
         * locator grid square, that we can move around later.
         */

        anchor.style.width = "" + w + "px";
        anchor.style.height = "" + h + "px";

        let devilstower = this.latlon(44.591226, -104.717494);

        let opts = {
            zoom: 14,
            center: devilstower,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        this.map = new google.maps.Map(anchor, opts);
        this.rect = new google.maps.Rectangle({
            map: this.map
        });
        this.geocoder = new google.maps.Geocoder();

        let controlDiv = document.createElement("div");
        let span = document.createElement("span");
        span.textContent = "Locator ";
        span.className = "locatorlabel";
        controlDiv.appendChild(span);
        let inputElem = document.createElement("input");
        inputElem.className = "locatorinput";
        inputElem.addEventListener("change", () => {
            let txt = this.doLocator(inputElem.value, true);
            if (txt) {
                inputElem.value = txt;
            }
        });
        controlDiv.appendChild(inputElem);
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(controlDiv);

        //woohoo! nice toy
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                let loc = this.latlon(pos.coords.latitude, pos.coords.longitude);
                this.map.setCenter(loc);
            });
        }

        google.maps.event.addListener(this.map, "click", (event) => {
            inputElem.value = this.getString(event.latLng.lat(), event.latLng.lng());
        });

    }

    /**
     * Convert floating point lat and long coordinate to maidenhead
     * and formatted lat and lon
     */
    getString(lat, lon) {

        function toChar(ascii) {
            return String.fromCharCode(ascii);
        }
    
    
        let lls = lat.toFixed(4) + ", " + lon.toFixed(4);

        let str = "";

        //field
        lon += 180;
        lat += 90;
        let lonRes = 20;
        let latRes = 10;
        str += toChar(Math.floor(lon / lonRes) + 65);
        str += toChar(Math.floor(lat / latRes) + 65);

        //square
        lon %= lonRes;
        lat %= latRes;
        lonRes /= 10;
        latRes /= 10;
        str += Math.floor(lon / lonRes);
        str += Math.floor(lat / latRes);

        //subsquare

        lon %= lonRes;
        lat %= latRes;
        lonRes /= 24;
        latRes /= 24;
        str += toChar(Math.floor(lon / lonRes) + 97);
        str += toChar(Math.floor(lat / latRes) + 97);

        //extsquare
        lon %= lonRes;
        lat %= latRes;
        lonRes /= 10;
        latRes /= 10;
        str += Math.floor(lon / lonRes)

        str += Math.floor(lat / latRes)

        this.doLocator(str, false);

        str += "  /  " + lls;
        return str;
    }

    search(str) {
        this.geocoder.geocode({
                'address': str
            },
            (results, status) => {
                if (status == google.maps.GeocoderStatus.OK) {
                    let loc = results[0].geometry.location;
                    this.map.panTo(loc)
                    return loc;
                } else
                    return null;
            }
        );
    }


    /**
     * Parse a locator string    
     * @param locator a locator string in the form "AANNaann"
     * @return an array with the degree boundaries of the grid
     * rectangle, in left,bottom,width,height order. If the string
     * is not parseable, return null.
     */
    locatorToLatLong(locator) {
        /**
         * Get the ordinal position of a letter: 'a'-'z' -> 0-26    
         */
        function charAt(str, pos) {
            return str.charCodeAt(pos) - 97
        }

        /**
         * Get the ordinal position of a digit:  '0'-'9' -> 0-9  
         */
        function numAt(str, pos) {
            return str.charCodeAt(pos) - 48
        }


        /**
         * The regex works like this.  The first 2 characters are required.
         * The optionals allow all 4 pairs.  The value of 'match' will be:
         *    no match/malformed : null
         *    "bl"               : ["bl", "bl", null, null, null]
         *    "bl11"             : ["bl11", "bl", "11", null, null]
         *    "bl11bh"           : ["bl11bh", "bl", "11", "bh", null ]
         *    "bl11bh16"         : ["bl11bh16", "bl", "11", "bh", "16" ]
 
         * Notice that match[0] will always be the whole string
         */
        let regex = /([a-r]{2})(?:(\d{2})(?:([a-x]{2})(\d{2})?)?)?/g;
        let match = regex.exec(locator);
        if (!match)
            return null;
        let field = match[1];
        let square = match[2];
        let subSquare = match[3];
        let extSquare = match[4];

        let latRes = 10
        let lonRes = 20
        let lat = charAt(field, 1) * latRes - 90;
        let lon = charAt(field, 0) * lonRes - 180;
        if (square) {
            latRes /= 10;
            lonRes /= 10;
            lat += numAt(square, 1) * latRes;
            lon += numAt(square, 0) * lonRes;
            if (subSquare) {
                latRes /= 24;
                lonRes /= 24;
                lat += charAt(subSquare, 1) * latRes;
                lon += charAt(subSquare, 0) * lonRes;
                if (extSquare) {
                    latRes /= 10;
                    lonRes /= 10;
                    lat += numAt(extSquare, 1) * latRes;
                    lon += numAt(extSquare, 0) * lonRes;
                }
            }
        }
        return [lat, lon, latRes, lonRes];
    }

    /**
     * Shorthand for creating a GMaps LatLng object
     */
    latlon(lat, lon) {
        return new google.maps.LatLng(lat, lon);
    }

    /**
     * Shorthand for creating a GMaps LatLngBounds object
     */
    bounds(lat1, lon1, lat2, lon2) {
        return new google.maps.LatLngBounds(this.latlon(lat1, lon1), this.latlon(lat2, lon2));
    }

    /**
     * This is the main function, tied to input from a text field.  Get the
     * locator string and parse it to a latitude and longitude.  If this is
     * successful, move the rectangle to delineate it, and pan the map to show it.
     */
    doLocator(locator, doImove) {
        locator = locator.toLowerCase().replace(/\s/g, "");

        let ll = this.locatorToLatLong(locator);
        if (!ll) //Not a locator?  Try a normal search
            return this.search(locator);
        let x = ll[0];
        let y = ll[1];
        let w = ll[2];
        let h = ll[3];
        this.rect.setBounds(this.bounds(x, y, x + w, y + h));
        if (doImove)
            this.map.fitBounds(this.bounds(x - 0.5 * w, y - 0.5 * h, x + 1.5 * w, y + 1.5 * h));
        return locator;
    }



} //class LocatorMap