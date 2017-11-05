import {EditorState , convertFromRaw} from 'draft-js';
import createReduxDuckling from 'redux-ducklings';
const request = require('superagent');

const redux = (() => {

	const REDUX_ACTIONS = {
		UPDATE_CONTENTS:'editable-content/UPDATE_CONTENTS' ,
		SAVE_CONTENTS:'editable-content/SAVE_CONTENTS'
	};

	const defaultState = {
		editorState:{}
	};

	const createReducer = ACTIONS => () => (state = defaultState , action) => {
		switch (action.type) {
			case ACTIONS.UPDATE_CONTENTS: {

				const newEditorState = (

					action.rawContent ?

						// convert raw content to editor state
						(rawContent => {

							// check if empty object
							if ( Object.keys(rawContent).length === 0 ) {
								return EditorState.createEmpty();
							}

							// add empty entity map if doesnt exist
							if ( !rawContent.entityMap ) {
								rawContent.entityMap = {};
							}

							// process blocks
							rawContent.blocks.forEach(block => {

								// convert HTML special chars to normal chars - e.g. '&lt;' ==> '<'
								const tempElement = document.createElement('textarea');
								tempElement.innerHTML = block.text;
								block.text = tempElement.value;

								// make sure depth properties are integers, or else Draft hangs
								block.depth = parseInt(block.depth);
							});

							// create editorState
							return EditorState.createWithContent(convertFromRaw(rawContent));

						})(action.rawContent)

						:

						action.editorState
				);

				return {
					...state ,
					editorState:{
						...({[action.id ? action.id : 'default']:newEditorState})
					}
				}
			}

			default:
				return state;
		}
	};

	const ajaxRequests = {};
	const actionCreators = ACTIONS => (apiUrl = 'save-content') => {

		const saveContents = (rawContent , editorInstanceId = 'default') => () => {

			// abort old request
			if ( ajaxRequests[editorInstanceId] ) {
				ajaxRequests[editorInstanceId].abort();
			}

			// make request
			ajaxRequests[editorInstanceId] = request.post(apiUrl).withCredentials().type('application/x-www-form-urlencoded').send({
				rawContent:JSON.stringify(rawContent)
			}).end();
		}

		const updateContents = editorState => ({
			type:ACTIONS.UPDATE_CONTENTS ,
			editorState
		});

		return {
			saveContents ,
			updateContents
		}
	};

	// duckling
	return createReduxDuckling(
		REDUX_ACTIONS ,
		createReducer ,
		actionCreators
	);
})();

module.exports = redux;