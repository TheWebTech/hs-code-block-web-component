# code-block-web-component
A code block web component and HubSpot module that leverages the component.

![animation showing code block in action](https://jonm.d.pr/r1HQO5+)

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

### Preventing FOUC (Flash of Unstyled Component) - optional but may be desired
Web components use JavaScript to register and generate the shadow DOM. This can mean a momentary flash of unstyled HTML content. This is a similar situation to what you'd see with a reactive JavaScript library like Vue.js or React.js. You can prevent this flash from being jarring by adding a small amount of CSS loaded separately from your web component.

The main goal of this CSS is to minimize CLS and visually align with what the rendered component will look like so to the user it's less noticeable when the component pops in. A nice side benefit is in the event JavaScript is disabled, the first tab of the code block is still visible and code indentation is maintained.

The key to this is understanding that before rendering, the HTML rendered to the page is just:

``` html
<code-block data-line-numbers="true">
    <code-tab data-language="HTML">
        Whatever escaped code you put here.
    </code-tab>
</code-block>
```
So in your CSS you target the code-block and code-tab. You can also target the elements based on when they are actually defined or not using `:has()` and `:define`.

In the developers.hubspot.com website our code looks like this:
``` CSS
code-block:not(:defined){
  /* When the web component is not defined reserve space for the tabs */
  padding-top:56px;
  display:block;
}

code-tab:not(:defined){
  /* when code-tab is not defined, hide the tabs */
  display:none;
}
code-tab:first-of-type:not(:defined){
  /* before the code-tab is defined, display the first code tab element and style it with CSS visually align to the web component */
  display:block;
  min-height:60px;
  background-color: #33475b;
  color:#eaf0f6;
  white-space: pre;
  padding: 1em 1em 1em 3.8em;
  font-size: 1em;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  line-height: 1.5;
  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;
  overflow: auto;
}
```
The effect this achieves is that the layout doesn't significantly shift when the code block appears, and the code block is already showing readable code right away.


## Use inside custom modules
In the modules folder we've provided an example plug and play module that uses the web component to create the code blocks. Using module fields the content creator has a nice interface for changing settings in the code block, we can also automatically escape the code for them.


