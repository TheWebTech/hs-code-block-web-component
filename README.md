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
* `highlight` - used for highlighting specific line numbers in code blocks.

Each of these attributes are passed as data attributes since these are custom attributes.
``` html
<code-tab data-language="HTML" data-is-escaped="false" data-label=" Rendered HTML">
    <h1>Your HTML here. Any HTML or HubL should be escaped</h1>
</code-tab>
```
#### Supported development languages
Your prism.js and css file is what determines what languages the code block supports. Out of the box this web component supports:
* css
* html
* js
* json
* graphql
* xml
* svg
* atom
* rss
* mathml
* ssml
* c-like
* bash + shell
* web app manifest
* django/jinja2 (HubL)

Should you need other languages it's somewhat trivial to add them. Simply swap the prism.js and prism.css file with a new version from prismjs.com. You can get the current configuration from the prism.js file in this project. Do note if you update versions of Prism itself you may need to make code changes to your web component if there were breaking changes.

In this project we may expand the languages that are added by default over time but we will attempt to do so slowly as every language adds to the file size.

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

#### Highlight specific line numbers
Sometimes you want to highlight specific line numbers in a code tab so you scan show code within the larger context of how it will be used.

To do this, on your code-tab element add a data-highlight attribute. The highlight feature supports:
* A single number refers to the line with that number
* Ranges are denoted by two numbers, separated with a hyphen (-)
* Multiple line numbers or ranges are separated by commas.

Examples:
* `5` - The 5th line
* `11-5` - Lines 1 through 5
* `1,4` - Line 1 and line 4
* `1-2, 5, 9-20` - Lines 1 through 2, line 5, lines 9 through 20

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
In the modules folder we've provided an example plug and play module that uses the web component to create the code blocks. Using module fields the content creator has a nice interface for changing settings in the code block, we can also automatically escape the code for them. The key is using `require_js` to load the webcomponent JS only when the module needs it.
``` Jinja
{{ require_js(get_asset_url('../../js/code-block.js'),{"type":"module"}) }}
```

## Use inside blog posts
<details><summary>HubSpot now supports dragging and dropping modules in blog posts, and that's the recommended way to add code blocks to posts. The old way should still work fine if you need it though.</summary>
This is the old way to use them in blog posts.

The key thing you need to display a code block in your blog post is to require the JavaScript file. You do this in the same way you do for modules, but instead you use the `require_js` statement in your template. If you know your blog will use code blocks a lot, it's maybe okay to simply have the require statement right in your blog post template.
``` Jinja
{{ require_js(get_asset_url('../../js/code-block.js'),{"type":"module"}) }}
```
If you want to control it on an individual post level though, giving the post author control - the best thing to do is create a custom module that will load on the page. The module itself only needs to have a boolean field "Use code blocks" then conditionally load the JS based on that field.
``` Jinja
{% if module.enable_code_blocks %}
    {{ require_js(get_asset_url('../../js/code-block.js'),{"type":"module"}) }}
{% endif %}
```
Place that module in your blog post template. Now you have the ability to toggle the script on/off as needed per post.

Wherever you need to place your code block in the content of your blog post, use the insert > embed code feature and paste in the HTML for the code-block. When you need to edit your code examples opening the source code view for the full post - will enable you to get syntax highlighting in the editor, so that's the best way to tweak after the fact.

Note: If your blog posts are automatically sent as emails, include the `<!--readmore-->` anywhere before the first code block. Emails don't support JavaScript so your code block won't be rendered in the email. You could try using CSS styling alone - like we do to prevent FOUC but email clients are trickier and getting it to display in a useful way may be hard.



[Included in the web component is detection of if you're viewing the code block from the page editor](https://github.com/TheWebTech/hs-code-block-web-component/blob/c92ceccebea77f867d2b75f52bf2aa7dc78d6415/src/js/code-block.js#L1-L32), this enables the code block to be partially styled in the editor to give the post author a nice experience. It also displays a couple of messages in the preview.
* A warning that you should always escape html before pasting it in to the code block, this prevents those elements from being temporarily rendered to the DOM. The web component DOES have the ability to convert unescaped code to escaped code but there would be a moment where the DOM content would be shown.
* A note on hover just to let you know that what you see in the editor does not perfectly match the live page.

_Note: The styling of the web component while in the editor is dependent on HubSpot's editor code. Over time this code will change and could cause that special styling within the editor to not work. This doesn't affect the live page, so the trade off of a nicer editing experience feels worth it._

Reminder: If you need to display HubL or code that is similar in syntax to HubL it's encouraged that you use `{% raw %}` to ensure that HubSpot does not process that HubL.
</details>
