
/**
 * 
 */
class TinyMap {

	/**
	 * 
	 * @param {string} anchorname name of the div to attach the map 
	 */
	constructor(anchorName) {
		let anchor = document.getElementById(anchorname);
		if (!anchor) {
			throw new Error("Map anchor '" + anchorname + "' not found");
		}
		this.anchor = anchor;

		this.latLng = new google.maps.LatLng(-34.397, 150.644);
		this.startup();
	}

	startMap() {
		let opts = {
			zoom: 9,
			center: this.latLng,
			mapTypeId: "roadmap"
		};
		this.map = new google.maps.Map(this.anchor, opts);
	}


	startup() {
		navigator.geolocation.getCurrentPosition((pos) => {
			let coords = pos.coords;
			this.latLng = new google.maps.LatLng(coords.latitude, coords.longitude);
			this.startMap();
			}, () => this.startMap()
		);
	}
}

