
var Module;

if (typeof Module === 'undefined') Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {
 var loadPackage = function(metadata) {

    var PACKAGE_PATH;
    if (typeof window === 'object') {
      PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    } else if (typeof location !== 'undefined') {
      // worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
    } else {
      throw 'using preloaded data can only be done on a web page or in a web worker';
    }
    var PACKAGE_NAME = 'game.data';
    var REMOTE_PACKAGE_BASE = 'game.data';
    if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
      Module['locateFile'] = Module['locateFilePackage'];
      Module.printErr('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
    }
    var REMOTE_PACKAGE_NAME = typeof Module['locateFile'] === 'function' ?
                              Module['locateFile'](REMOTE_PACKAGE_BASE) :
                              ((Module['filePackagePrefixURL'] || '') + REMOTE_PACKAGE_BASE);
  
    var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
    var PACKAGE_UUID = metadata.package_uuid;
  
    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        var size = packageSize;
        if (event.total) size = event.total;
        if (event.loaded) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: size
            };
          } else {
            Module.dataFileDownloads[url].loaded = event.loaded;
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
          var data = Module.dataFileDownloads[download];
            total += data.total;
            loaded += data.loaded;
            num++;
          }
          total = Math.ceil(total * Module.expectedDataFileDownloads/num);
          if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
        } else if (!Module.dataFileDownloads) {
          if (Module['setStatus']) Module['setStatus']('Downloading data...');
        }
      };
      xhr.onload = function(event) {
        var packageData = xhr.response;
        callback(packageData);
      };
      xhr.send(null);
    };

    function handleError(error) {
      console.error('package error:', error);
    };
  
      var fetched = null, fetchedCallback = null;
      fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);
    
  function runWithFS() {

    function assert(check, msg) {
      if (!check) throw msg + new Error().stack;
    }
Module['FS_createPath']('/', 'states', true, true);

    function DataRequest(start, end, crunched, audio) {
      this.start = start;
      this.end = end;
      this.crunched = crunched;
      this.audio = audio;
    }
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.name = name;
        this.requests[name] = this;
        Module['addRunDependency']('fp ' + this.name);
      },
      send: function() {},
      onload: function() {
        var byteArray = this.byteArray.subarray(this.start, this.end);

          this.finish(byteArray);

      },
      finish: function(byteArray) {
        var that = this;

        Module['FS_createDataFile'](this.name, null, byteArray, true, true, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
        Module['removeRunDependency']('fp ' + that.name);

        this.requests[this.name] = null;
      },
    };

        var files = metadata.files;
        for (i = 0; i < files.length; ++i) {
          new DataRequest(files[i].start, files[i].end, files[i].crunched, files[i].audio).open('GET', files[i].filename);
        }

  
    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      assert(arrayBuffer instanceof ArrayBuffer, 'bad input to processPackageData');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
      
        // copy the entire loaded file into a spot in the heap. Files will refer to slices in that. They cannot be freed though
        // (we may be allocating before malloc is ready, during startup).
        if (Module['SPLIT_MEMORY']) Module.printErr('warning: you should run the file packager with --no-heap-copy when SPLIT_MEMORY is used, otherwise copying into the heap may fail due to the splitting');
        var ptr = Module['getMemory'](byteArray.length);
        Module['HEAPU8'].set(byteArray, ptr);
        DataRequest.prototype.byteArray = Module['HEAPU8'].subarray(ptr, ptr+byteArray.length);
  
          var files = metadata.files;
          for (i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }
              Module['removeRunDependency']('datafile_game.data');

    };
    Module['addRunDependency']('datafile_game.data');
  
    if (!Module.preloadResults) Module.preloadResults = {};
  
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }
    
  }
  if (Module['calledRun']) {
    runWithFS();
  } else {
    if (!Module['preRun']) Module['preRun'] = [];
    Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
  }

 }
 loadPackage({"files": [{"audio": 0, "start": 0, "crunched": 0, "end": 6148, "filename": "/.DS_Store"}, {"audio": 0, "start": 6148, "crunched": 0, "end": 8730, "filename": "/background.png"}, {"audio": 0, "start": 8730, "crunched": 0, "end": 10276, "filename": "/Bird.lua"}, {"audio": 0, "start": 10276, "crunched": 0, "end": 10607, "filename": "/bird.png"}, {"audio": 0, "start": 10607, "crunched": 0, "end": 13673, "filename": "/class.lua"}, {"audio": 1, "start": 13673, "crunched": 0, "end": 59451, "filename": "/explosion.wav"}, {"audio": 0, "start": 59451, "crunched": 0, "end": 66083, "filename": "/flappy.ttf"}, {"audio": 0, "start": 66083, "crunched": 0, "end": 85575, "filename": "/font.ttf"}, {"audio": 0, "start": 85575, "crunched": 0, "end": 85837, "filename": "/ground.png"}, {"audio": 1, "start": 85837, "crunched": 0, "end": 124035, "filename": "/hurt.wav"}, {"audio": 1, "start": 124035, "crunched": 0, "end": 139245, "filename": "/jump.wav"}, {"audio": 0, "start": 139245, "crunched": 0, "end": 144378, "filename": "/main.lua"}, {"audio": 1, "start": 144378, "crunched": 0, "end": 1650398, "filename": "/marios_way.mp3"}, {"audio": 0, "start": 1650398, "crunched": 0, "end": 1651464, "filename": "/Pipe.lua"}, {"audio": 0, "start": 1651464, "crunched": 0, "end": 1652269, "filename": "/pipe.png"}, {"audio": 0, "start": 1652269, "crunched": 0, "end": 1653636, "filename": "/PipePair.lua"}, {"audio": 0, "start": 1653636, "crunched": 0, "end": 1660865, "filename": "/push.lua"}, {"audio": 1, "start": 1660865, "crunched": 0, "end": 1677185, "filename": "/score.wav"}, {"audio": 0, "start": 1677185, "crunched": 0, "end": 1678939, "filename": "/StateMachine.lua"}, {"audio": 0, "start": 1678939, "crunched": 0, "end": 1685087, "filename": "/states/.DS_Store"}, {"audio": 0, "start": 1685087, "crunched": 0, "end": 1685789, "filename": "/states/BaseState.lua"}, {"audio": 0, "start": 1685789, "crunched": 0, "end": 1686871, "filename": "/states/CountdownState.lua"}, {"audio": 0, "start": 1686871, "crunched": 0, "end": 1690580, "filename": "/states/PlayState.lua"}, {"audio": 0, "start": 1690580, "crunched": 0, "end": 1691730, "filename": "/states/ScoreState.lua"}, {"audio": 0, "start": 1691730, "crunched": 0, "end": 1692506, "filename": "/states/TitleScreenState.lua"}], "remote_package_size": 1692506, "package_uuid": "6903d7d1-0cd9-4d7d-a789-7a54a2b563a0"});

})();
