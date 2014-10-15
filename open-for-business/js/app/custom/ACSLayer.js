/* global define, geostats */
define([
  'dojo/_base/declare',
  'dojo/on',
  'dojo/_base/array',
  'dojo/_base/connect',
  'dojo/_base/lang',
  'dojo/request/xhr',
  'dojo/Deferred',
  'dojo/promise/all',

  'esri/SpatialReference',
  'esri/graphic',
  'esri/Color',
  'esri/layers/FeatureLayer',
  'esri/tasks/QueryTask',
  'esri/tasks/query',
  'esri/renderers/SimpleRenderer',
  'esri/renderers/ClassBreaksRenderer',
  'esri/symbols/SimpleFillSymbol',
  'esri/symbols/SimpleLineSymbol'

], function(
  declare, on, array, connect, lang, xhr, Deferred, all,
  SpatialReference, Graphic, Color, FeatureLayer, QueryTask, Query, SimpleRenderer, ClassBreaksRenderer, SimpleFillSymbol, SimpleLineSymbol
) {
  return declare([FeatureLayer], {
    constructor: function(url, options) {
      /**
       * Options
       *
       * option:  DataType
       *   Description
       *
       * option: DataType
       *   Description
       *
       *
       */

      this._variableId = options.variableId;
      this._variableName = options.variableName;
      this._featuresUrl = options.featuresUrl || 'http://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/0';
      this._apiUrl = options.apiUrl || 'http://api.census.gov/data/2012/acs5';
      this._stateFipsField = options.stateFipsField || 'STATE';
      this._tractField = options.tractField;
      this._colorRamp = options.colorRamp;

      this._outFields.push(this._tractField);

      this._sr = options.spatialReference || new SpatialReference({
        'wkid': 102100
      });

      // Use proxy if one has been defined for use with the JSAPI
      this._proxy = window.esriConfig.defaults.io.proxyUrl || '';
      if (this._proxy) {
        this._proxy += '?';
      }

      // Other private variables
      this._queryTask = new QueryTask(this._featuresUrl);

      // Set Renderer
      this._fillSymbolJson = {
        'type': 'simple',
        'label': '',
        'description': '',
        'symbol': {
          'type': 'esriSFS',
          'style': 'esriSFSNull',
          'color': [0, 0, 0, 50],
          'outline': {
            'type': 'esriSLS',
            'style': 'esriSLSNull',
            'color': [0, 0, 0, 0],
            'width': 0
          }
        }
      };
      this.setRenderer(new SimpleRenderer(this._fillSymbolJson));
    },

    /**
     * Initialization
     */

    /**
     * Override esri/layers/GraphicsLayer methods
     */
    _setMap: function(map, surface) {
      // save ref to the map
      this._map = map;

      on(this, 'update-end', lang.hitch(this, function() {
        // Initial fetch
        this._getData();
      }));

      // GraphicsLayer will add its own listener here
      var div = this.inherited(arguments);
      return div;
    },

    /**
     * Override esri/layers/GraphicsLayer methods
     */
    _unsetMap: function() {
      this.inherited(arguments);
      connect.disconnect(this._extentChange);
    },

    /**
     * Public Methods
     */

    /**
     * Set a new variable for the layer
     * @param { Object } v Variable description (variableId, variableName)
     */
    setVariable: function(v) {
      /**
       * Update the ACS variable being used by this layer
       */
      this._variableId = v.id;
      this._variableName = v.name;

      // Optional
      if (v.apiUrl) {
        this._apiUrl = v.apiUrl;
      }

      this._getData();
    },

    setColor: function(c) {
      this._colorRamp = c;
    },

    // onClick: function(e) {
    //   // console.log(e.graphic);
    //   // this._map.infoWindow.setFeatures([e.graphic]);
    // },

    /**
     * Internal Methods
     */

    /**
     * Send request(s) to Census Data API to get values for supplied variable
     * @return { N/A }
     */
    _getData: function() {
      var fips = this._getCurrentStates(),
        dataUrls = [],
        promises = [],
        request;

      if (fips.length) {
        array.forEach(fips, lang.hitch(this, function(state) {
          dataUrls.push(this._getDataUrl(state));
        }));
      }

      array.forEach(dataUrls, lang.hitch(this, function(url) {
        request = xhr(url, {
          handleAs: 'json',
          headers: {
            // Workaround to get Dojo to quit prefetching with an OPTIONS request
            'X-Requested-With': null
          }
        });
        promises.push(request);
      }));

      // Handle all requests that were sent to Census API
      all(promises).then(lang.hitch(this, function(results) {
        this._handleDataApiResults(results);
      }));
    },

    /**
     * Handle response from Census Data API
     * @param  { Array } results Array of result objects returned by Census Data API
     * @return { N/A }
     */
    _handleDataApiResults: function(results) {
      var keys,
        tempObject = {},
        dict = {};

      array.forEach(results, function(result) {
        // extract keys
        keys = result.shift();
        // dump values into a new object
        array.forEach(result, function(values) {
          array.forEach(values, function(value, i) {
            // Create an object that maps to a single tract
            tempObject[keys[i]] = value;
          });
          // Create new object in dictionary
          dict[values[3]] = tempObject;
          // Clean temp object
          tempObject = {};
        });
      });

      var simpleArray = this._joinData(dict);

      if (simpleArray.length) {
        var renderer = this._generateRenderer(simpleArray);
        this.setRenderer(renderer);
        this.redraw();
        this.emit('acs-update-end');
      }
    },

    /**
     * Join data from the API response to the FeatureLayer
     * @param  { Object } dict Dictionary object of API data for quick lookup
     * @return { Array }      1-d array to be used for classification
     */
    _joinData: function(dict) {
      // join data to this layer and save a 1-d array for classification
      var simpleArray = [];
      array.forEach(this.graphics, lang.hitch(this, function(feature) {
        var tractId = feature.attributes[this._tractField].substr(feature.attributes[this._tractField].length - 6);
        if (dict[tractId]) {
          if (isNaN(dict[tractId][this._variableId])) {
            dict[tractId][this._variableId] = 0;
          }
          feature.attributes[this._variableId] = dict[tractId][this._variableId];
          simpleArray.push(parseInt(feature.attributes[this._variableId], 10));
        }
      }));
      return simpleArray;
    },

    /**
     * Generate a Class Breaks Renderer with the 1-d array of API values
     * @param  { Array } values 1-d array of values
     * @return { ClassBreaksRenderer }        Renderer to use for the layer
     */
    _generateRenderer: function(values) {
      var i;
      // clean NaN values
      // for (i = 0; i < values.length - 1; i++) {
      //   if (isNaN(values[i])) {
      //     values[i] = 0;
      //   }
      // }

      // Generate class breaks
      var series = new geostats();
      series.setSerie(values);


      var classBreaks = series.getClassQuantile(5);
      var ranges = series.ranges;
      var breaks = [];
      var renderer = new ClassBreaksRenderer(null, this._variableId);

      var colorRamp = [];
      array.forEach(this._colorRamp, function(rgba) {
        colorRamp.push(new Color(rgba));
      });


      var min,
        max,
        label;
      for (i = 0; i < classBreaks.length - 1; i++) {

        // Min
        min = classBreaks[i] || 0;

        // Max
        if (classBreaks[i + 1] === null) {
          max = Infinity;
        } else {
          max = classBreaks[i + 1] + 1;
        }

        // Label
        label = min + ' - ' + max;

        renderer.addBreak({
          minValue: min,
          maxValue: max,
          label: label, //ranges[i],
          symbol: new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 0]), 1), colorRamp[i])
        });
      }
      return renderer;
    },

    /**
     * Build the URL used to request data from the Census Data API
     * @param  { String } fips State FIPS to be used in the request
     * @return { String }      URL to be used for requesting data from the Census Data API
     */
    _getDataUrl: function(fips) {

      // Koop
      // return 'http://koop.dc.esri.com/acs/2012/' + fips + '/' + this._variableId + '/tract:*';

      // Census Data API (directly)
      return this._proxy + this._apiUrl + '?get=' + this._variableId + '&for=tract:*&in=state:' + fips + '&key=b2410e6888e5e1e6038d4e115bd8a453f692e820';
    },

    /**
     * Get the unique State FIPS for all the tracts currently in the layer
     * @return { Array } Array of State FIPS currently in the layer
     */
    _getCurrentStates: function() {
      var fips = [];

      array.forEach(this.graphics, lang.hitch(this, function(graphic) {
        fips.push(graphic.attributes[this._stateFipsField]);
      }));

      function cleanFilterValues(values) {
        var unique = {};
        //get rid of duplicates
        return array.filter(values, function(value) {
          if (!unique[value]) {
            unique[value] = true;
            return true;
          }
          return false;
        }).sort();
      }

      return cleanFilterValues(fips);
    }

  });
});