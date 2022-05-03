# code-block-web-component
A code block web component and HubSpot module that leverages the component.

## How to use the web component
Wherever you want to place your code block you use HTML. On the page you will need to ensure you are loading the web component's JavaScript file as well.

There are two elements in use [Code blocks](#code-block-element-code-block) and [Code tabs](#code-tab-element-code-tab).
### Code block element `<code-block>`

This is a wrapper element which contains `<code-tab>` elements. Multiple `<code-tab>` elements can be placed inside of a code block. This element generates tabs for each of the `<code-tab>` elements placed within it, and handles toggling the visibility of the individual tabs.

#### Code block custom attributes
The `<code-block>` element has 1 custom attribute.
* `line-numbers` - Determines if line numbers are shown in the code block. Expects a value of `true` or `false`. Defaults to `true`. 

Attributes are passed as data attributes since these are custom attributes. 
``` html
<code-block data-line-numbers="true">
    ...
</code-block>
```

### Code tab element `<code-tab>`
This is the element that renders the syntax highlighted code itself. This element is designed to be used inside of `<code-block>` elements.

#### Code tab element custom attributes
The code tab has three attributes:
* `language` - determines the which syntax highlighting is used.
* `label` - The label for the tab
* `is-escaped` - by default is-escaped is false. This attribute determines whether the module will convert any HTML inside the element to escaped HTML. You should never pass HTML that isn't already escaped. The HTML will be temporarily rendered.

Each of these attributes are passed as data attributes since these are custom attributes.
``` html
<code-tab data-language="HTML" data-is-escaped="false" data-label=" Rendered HTML">
    <h1>Your HTML here. Any HTML or HubL should be escaped</h1>
</code-tab>
```

### How the two elements are used together
Example of how you'd use this:
``` html
<code-block data-line-numbers="true">
    <code-tab data-language="HTML">
        <h1>Your HTML here. Any HTML or HubL should be escaped</h1>
    </code-tab>
</code-block>
```

Anywhere you want this code block to render you need to load the JavaScript file. When loading on pages hosted on CMS Hub, use `{{ require_js(get_asset_url('../../js/code-block.js'),{"type":"module"}) }}`. The require_js function ensure that the JavaScript is only loaded once per page.

### Under the hood how does the code block work?
Under the hood the JS file that registers and renders the web components is [code-block.js](/src/js/code-block.js). This file holds the definitions for both the code-block and code-tab elements. It handles all of the tabbing functionality and passes data needed for the syntax highlighting to the shadow DOM div element that gets processed. This file also contains the CSS for the Shadow DOM elements to keep it self contained - with an exception of the syntax highlighting itself.

The syntax highlighting itself is performed by [Prism.js](/src/js/prism.js). [PrismJS is an open source syntax highlighter](https://github.com/PrismJS/prism). Prism takes the code that's pasted in and converts it to HTML elements that can be styled. We're using one of the [Prism themes for the styling](/src/css/components/prism.css). You'll notice if you open the Prism JavaScript file we have `{% raw %}` tags being used, this tells the HubSpot renderer to ignore anything that resembles HubL within this code. 

## Use inside custom modules
In the modules folder we've provided an example plug and play module that uses the web component to create the code blocks. Using module fields the content creator has a nice interface for changing settings in the code block, we can also automatically escape the code for them.
   
