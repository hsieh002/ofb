/* global define, getAppPath */
define([], function() {

	return {

		// Url to geometry server
		geometryService: {
			url: 'http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer'
		},

		/**
		 * Proxy configuration
		 * url: URL to the proxy page
		 * alwaysUseProxy: Whether or not to always use the proxy for XHR requests
		 * rules: Array of URL's for which the proxy should always be used when sending requests
		 */
		proxy: {
			//url: 'http://wdccivweb.esri.com/proxy/proxy.ashx',
			// url: 'proxy/PHP/proxy.php',
			// url: 'proxy/DotNet/proxy.ashx',
			//url: 'http:/127.0.0.1/proxy/proxy.ashx',
			//alwaysUseProxy: true,
			rules: [ /* Add URLs here*/ ]
		},

		// Current version of the application - presented in the Settings dialog of the app
		appVersion: '0.1.0',

		reportServiceUrl: 'http://wdccivweb.esri.com/open-for-business/ofb-reports/generateEconomicProfile.php',
		tractLayerUrl: 'http://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/0',
		countyLayerUrl: 'http://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1',

		/**
		 * Map Configuration
		 */

		/**
		 * Configuration of the map
		 * basemap: Basemap to display by default, options: topo, gray, satellite, streets
		 */
		map: {
			basemap: 'topo',
			center: [-95, 39],
			zoom: 4,
			extentJson: {
				'xmin': -94,
				'ymin': 41,
				'xmax': -86,
				'ymax': 48,
				'spatialReference': {
					'wkid': 4326
				}
			}
		},

		/**
		 * Content Config
		 */

		/**
		 * Generic application conifguration options
		 */
		app: {
			logo: getAppPath() + '/assets/img/logo.png',
			title: 'Open for Business',
			abbrevTitle: 'OFB'
		},

		/**
		 * Feedback configuration
		 * 'to' - a semicolon separated list of email addresses to receive the feedback
		 */
		feedback: {
			to: 'census.cofb@census.gov'
		},

		/**
		 * Data API's (include any API endpoints that are supported here, then reference the right one in the Data Layers definition below)
		 */
		dataApis: {
			'2008-2012_SummaryFile': 'http://api.census.gov/data/2012/acs5',
			'2008-2012_DataProfile': 'http://api.census.gov/data/2012/acs5/profile'
		},

		/**
		 * Data Layers to be displayed
		 */
		dataLayers: [{
			name: 'Total Population',
			code: 'B01001_001E',
			unit: 'people',
			color: 'green',
			api: '2008-2012_SummaryFile',
			'default': true
		}, {
			name: 'Median Household Income',
			code: 'B19013_001E',
			unit: 'USD',
			color: 'red',
			api: '2008-2012_SummaryFile'
		}, {
			name: 'Median Age',
			code: 'B01002_001E',
			unit: 'years old',
			color: 'blue',
			api: '2008-2012_SummaryFile'
		}, {
			name: '% Bachelor\'s degree or higher',
			code: 'DP02_0067PE',
			unit: '%',
			color: 'purple',
			api: '2008-2012_DataProfile'
		}],


		/**
		 * NAICS configuration (business areas)
		 */
		businessAreas: {
			cons: {
				key: 'cons',
				name: 'Construction',
				icon: './assets/img/primary/cons.png',
				hoverIcon: './assets/img/primary/cons_on.png',
				naics: [{
					name: 'Electrical',
					icon: './assets/img/secondary/23821.png',
					hoverIcon: './assets/img/secondary/23821_on.png',
					code: '23821'
				}, {
					name: 'Plumbing, Heating and Air-Contidioning Contractors',
					icon: './assets/img/secondary/23822.png',
					hoverIcon: './assets/img/secondary/23822_on.png',
					code: '23822'
				}]
			},
			retail: {
				key: 'retail',
				name: 'Retail',
				icon: './assets/img/primary/retail.png',
				hoverIcon: './assets/img/primary/retail_on.png',
				naics: [{
					name: 'Gas Stations',
					icon: './assets/img/secondary/4471.png',
					hoverIcon: './assets/img/secondary/4471_on.png',
					code: '4471'
				}]
			},
			pers: {
				key: 'pers',
				name: 'Personal Services',
				icon: './assets/img/primary/pers.png',
				hoverIcon: './assets/img/primary/pers_on.png',
				naics: [{
					name: 'Taxi Services',
					icon: './assets/img/secondary/48531.png',
					hoverIcon: './assets/img/secondary/48531_on.png',
					code: '48531'
				}, {
					name: 'Travel Agencies',
					icon: './assets/img/secondary/56151.png',
					hoverIcon: './assets/img/secondary/56151_on.png',
					code: '56151'
				}, {
					name: 'Landscaping',
					icon: './assets/img/secondary/56173.png',
					hoverIcon: './assets/img/secondary/56173_on.png',
					code: '56173'
				}, {
					name: 'Auto Repair',
					icon: './assets/img/secondary/8111.png',
					hoverIcon: './assets/img/secondary/8111_on.png',
					code: '8111'
				}, {
					name: 'Beauty Salons',
					icon: './assets/img/secondary/812112.png',
					hoverIcon: './assets/img/secondary/812112_on.png',
					code: '812112'
				}]
			},
			prof: {
				key: 'prof',
				name: 'Professional Services',
				icon: './assets/img/primary/prof.png',
				hoverIcon: './assets/img/primary/prof_on.png',
				naics: [{
					name: 'Insurance',
					icon: './assets/img/secondary/52421.png',
					hoverIcon: './assets/img/secondary/52421_on.png',
					code: '52421'
				}, {
					name: 'Real Estate',
					icon: './assets/img/secondary/53121.png',
					hoverIcon: './assets/img/secondary/53121_on.png',
					code: '53121'
				}, {
					name: 'Lawyers',
					icon: './assets/img/secondary/54111.png',
					hoverIcon: './assets/img/secondary/54111_on.png',
					code: '54111'
				}, {
					name: 'Accounting',
					icon: './assets/img/secondary/54121.png',
					hoverIcon: './assets/img/secondary/54121_on.png',
					code: '54121'
				}, {
					name: 'Consulting',
					icon: './assets/img/secondary/54161.png',
					hoverIcon: './assets/img/secondary/54161_on.png',
					code: '54161'
				}]
			},
			health: {
				key: 'health',
				name: 'Health Care',
				icon: './assets/img/primary/health.png',
				hoverIcon: './assets/img/primary/health_on.png',
				naics: [{
					name: 'Doctors',
					icon: './assets/img/secondary/62111.png',
					hoverIcon: './assets/img/secondary/62111_on.png',
					code: '62111'
				}, {
					name: 'Dentists',
					icon: './assets/img/secondary/62121.png',
					hoverIcon: './assets/img/secondary/62121_on.png',
					code: '62121'
				}]
			},
			food: {
				key: 'food',
				name: 'Food Services',
				icon: './assets/img/primary/food.png',
				hoverIcon: './assets/img/primary/food_on.png',
				naics: [{
					name: 'Restaurants',
					icon: './assets/img/secondary/7221.png',
					hoverIcon: './assets/img/secondary/7221_on.png',
					code: '722511'
				}, {
					name: 'Fast Food',
					icon: './assets/img/secondary/7222.png',
					hoverIcon: './assets/img/secondary/7222_on.png',
					code: '722513'
				}]
			}
		},

		colorRamps: {
			green: [
				// Greens
				[237, 248, 233, 0.60],
				[186, 228, 179, 0.60],
				[116, 196, 118, 0.60],
				[49, 163, 84, 0.60],
				[0, 109, 44, 0.60]
			],
			purple: [
				[242, 240, 247, 0.60],
				[203, 201, 226, 0.60],
				[158, 154, 200, 0.60],
				[117, 107, 177, 0.60],
				[84, 39, 143, 0.60]
			],
			red: [
				[254, 229, 217, 0.60],
				[252, 174, 145, 0.60],
				[251, 106, 74, 0.60],
				[222, 45, 38, 0.60],
				[165, 15, 21, 0.60]
			],
			blue: [
				[239, 243, 255, 0.60],
				[189, 215, 231, 0.60],
				[107, 174, 214, 0.60],
				[49, 130, 189, 0.60],
				[8, 81, 156, 0.60]
			]
		},

		countiesLayerRenderer: {
			'type': 'simple',
			'label': '',
			'description': '',
			'symbol': {
				'type': 'esriSLS',
				'style': 'esriSLSSolid',
				'color': [75, 75, 75, 200], //alpha is 0-255... so 120 ~ 0.5	
				'width': 3
			}
		},

		countiesLabelRenderer: {
			'type': 'simple',
			'label': '',
			'description': '',
			'symbol': {
				'type': 'esriTS',
				'color': [0, 0, 0, 255],
				'backgroundColor': [255, 255, 255, 255],
				'borderLineColor': [255, 255, 255, 255],
				'verticalAlignment': 'bottom',
				'horizontalAlignment': 'left',
				'rightToLeft': false,
				'angle': 0,
				'xoffset': 0,
				'yoffset': 0,
				'font': {
					'family': 'Helvetica',
					'size': 14,
					'style': 'normal',
					'weight': 'bold',
					'decoration': 'none'
				}
			}
		},

		locatorSymbol: {
			'type': 'esriPMS',
			'url': 'assets/img/pin.svg',
			'color': null,
			'width': 19.5,
			'height': 19.5,
			'angle': 0,
			'xoffset': 0,
			'yoffset': 0
		}

	};
});
