import React from 'react';
import ReactDOM from 'react-dom';
import EditableContent from './components/App/App';
import $ from 'jquery';

$(".axe-editable_content:not(.js_added)").each(function(index , element) {
	$(element).addClass('js_added');

	const id         = $(element).data('editable-content-id');
	const rawContent = (function() {
		try {
			return JSON.parse($(element).find(".raw-content").html())
		} catch(e) {
			return false;
		}
	})();

	let ajaxOps;
	const ajaxSaveFn = (htmlContent , rawContent) => {
		if ( ajaxOps ) ajaxOps.abort();
		ajaxOps = $.ajax({
			url: '/save-content/' + id ,
			type:'POST' ,
			data:{
				htmlContent:htmlContent ,
				rawContent: rawContent
			}
		});
	};

	ReactDOM.render(
		<EditableContent rawContent={rawContent} saveFn={ajaxSaveFn}/> ,
		$(element).get(0)
	)
});