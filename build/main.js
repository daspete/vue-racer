require('source-map-support/register')
module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_image_data_uri__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_image_data_uri___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_image_data_uri__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_fs__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_fs___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_fs__);



class SpriteMaker {
    constructor(settings) {
        this.settings = settings;

        this.files = [];
        this.sprites = {};

        this.Start();
    }

    async Start() {
        this.files = this.ScanDir(this.settings.spriteDirectory);

        await this.ConvertImages(this.files);
    }

    async ConvertImages(files) {
        let sprites = {};

        for (let i = 0; i < files.length; i++) {
            try {
                let spritemapName = files[i].path.split('/').slice(-2)[0];
                let spriteName = files[i].filename.split('.').slice(0, -1).join('.');

                let sprite = await this.Convert(files[i].path + files[i].filename);

                if (typeof sprites[spritemapName] === 'undefined') {
                    sprites[spritemapName] = {};
                }

                sprites[spritemapName][spriteName] = sprite;
            } catch (err) {
                console.log(err);
            }
        }

        await __WEBPACK_IMPORTED_MODULE_1_fs___default.a.writeFileSync('./src/sprites/spritesheet.json', JSON.stringify(sprites));
    }

    async Convert(path) {
        return await __WEBPACK_IMPORTED_MODULE_0_image_data_uri___default.a.encodeFromFile(path);
    }

    ScanDir(dir, filelist) {
        let files = __WEBPACK_IMPORTED_MODULE_1_fs___default.a.readdirSync(dir);

        filelist = filelist || [];

        files.forEach(file => {
            if (__WEBPACK_IMPORTED_MODULE_1_fs___default.a.statSync(dir + file).isDirectory()) {
                filelist = this.ScanDir(dir + file + '/', filelist);
            } else {
                filelist.push({
                    path: dir,
                    filename: file
                });
            }
        });
        return filelist;
    }
}

let spriteMaker = new SpriteMaker({
    spriteDirectory: './src/assets/'
});

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("image-data-uri");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ })
/******/ ]);
//# sourceMappingURL=main.map