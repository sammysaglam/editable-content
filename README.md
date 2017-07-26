# EditableContent

EditableContent is a [React](https://facebook.github.io/react/) wysiwyg text editor component, built using [Draft.js](https://facebook.github.io/draft-js/).
The interface is similar to Facebook Notes.

## Get started
`yarn add editable-content`

or

`npm install editable-content`

## Usage as a React Component

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import EditableContent from 'editable-content';

// Function to save contents to Database
// htmlContent is the resulting HTNL code
// rawContent is a Draft.js rawContent object
const ajaxSaveFn = (htmlContent , rawContent) => {
    ...your fetch method, etc.
}

ReactDOM.render(
    <EditableContent
        rawContent={rawContent}
        saveFn={ajaxSaveFn}
    /> ,
    document.getElementById('editor')
);
```

## License
MIT