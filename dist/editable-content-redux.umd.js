(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("draft-js"), require("superagent"));
	else if(typeof define === 'function' && define.amd)
		define(["draft-js", "superagent"], factory);
	else if(typeof exports === 'object')
		exports["EditableContentRedux"] = factory(require("draft-js"), require("superagent"));
	else
		root["EditableContentRedux"] = factory(root["draft-js"], root["superagent"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_4__) {
return /******/ (function(modules) { // webpackBootstrap
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
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _draftJs = __webpack_require__(1);

var _reduxDucklings = __webpack_require__(2);

var _reduxDucklings2 = _interopRequireDefault(_reduxDucklings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var request = __webpack_require__(4);

var redux = function () {

	var REDUX_ACTIONS = {
		UPDATE_CONTENTS: 'editable-content/UPDATE_CONTENTS',
		SAVE_CONTENTS: 'editable-content/SAVE_CONTENTS'
	};

	var defaultState = {
		editorState: {}
	};

	var createReducer = function createReducer(ACTIONS) {
		return function () {
			return function () {
				var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState;
				var action = arguments[1];

				switch (action.type) {
					case ACTIONS.UPDATE_CONTENTS:
						{

							var newEditorState = action.rawContent ?

							// convert raw content to editor state
							function (rawContent) {

								// check if empty object
								if (Object.keys(rawContent).length === 0) {
									return _draftJs.EditorState.createEmpty();
								}

								// add empty entity map if doesnt exist
								if (!rawContent.entityMap) {
									rawContent.entityMap = {};
								}

								// process blocks
								rawContent.blocks.forEach(function (block) {

									// convert HTML special chars to normal chars - e.g. '&lt;' ==> '<'
									var tempElement = document.createElement('textarea');
									tempElement.innerHTML = block.text;
									block.text = tempElement.value;

									// make sure depth properties are integers, or else Draft hangs
									block.depth = parseInt(block.depth);
								});

								// create editorState
								return _draftJs.EditorState.createWithContent((0, _draftJs.convertFromRaw)(rawContent));
							}(action.rawContent) : action.editorState;

							return _extends({}, state, {
								editorState: _extends(_defineProperty({}, action.id ? action.id : 'default', newEditorState))
							});
						}

					default:
						return state;
				}
			};
		};
	};

	var ajaxRequests = {};
	var actionCreators = function actionCreators(ACTIONS) {
		return function () {
			var apiUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'save-content';


			var saveContents = function saveContents(rawContent) {
				var editorInstanceId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'default';
				return function () {

					// abort old request
					if (ajaxRequests[ACTIONS.SAVE_CONTENTS + '/' + editorInstanceId]) {
						ajaxRequests[ACTIONS.SAVE_CONTENTS + '/' + editorInstanceId].abort();
					}

					// make request
					ajaxRequests[ACTIONS.SAVE_CONTENTS + '/' + editorInstanceId] = request.post(apiUrl).withCredentials().type('application/x-www-form-urlencoded').send({
						rawContent: JSON.stringify(rawContent)
					}).end();
				};
			};

			var updateContents = function updateContents(editorState) {
				return {
					type: ACTIONS.UPDATE_CONTENTS,
					editorState: editorState
				};
			};

			return {
				saveContents: saveContents,
				updateContents: updateContents
			};
		};
	};

	// duckling
	return (0, _reduxDucklings2.default)(REDUX_ACTIONS, createReducer, actionCreators);
}();

module.exports = redux;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__dist_redux_ducklings_cjs__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__dist_redux_ducklings_cjs___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__dist_redux_ducklings_cjs__);


/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_0__dist_redux_ducklings_cjs__["createReduxDuckling"]);

/***/ }),
/* 3 */
/***/ (function(module, exports) {

exports["createReduxDuckling"] =
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
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var createReduxDuckling = function createReduxDuckling(actions, createReducer, actionCreators) {
	return function (namespace) {

		// randomize namespace if not defined
		var RAND_MIN = 10000000000000;
		var RAND_MAX = 99999999999999;
		var ducklingNamespace = namespace ? namespace : 'redux-duck-' + (Math.floor(Math.random() * (RAND_MAX - RAND_MIN + 1)) + RAND_MIN);

		// namespace actions for modularity
		var ACTIONS = Object.keys(actions).reduce(function (previous, current) {
			previous[current] = actions[current] + '/' + ducklingNamespace;
			return previous;
		}, {});

		return {
			ACTIONS: ACTIONS,
			createReducer: createReducer(ACTIONS),
			actionCreators: actionCreators(ACTIONS)
		};
	};
};

module.exports = createReduxDuckling;

/***/ })
/******/ ]);

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ })
/******/ ]);
});
//# sourceMappingURL=editable-content-redux.umd.js.map