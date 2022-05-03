if(window.hsInEditor){
  /* While in the editor add styling to improve the appearance of code-blocks within the editor. */
  let template = document.createElement('style');
  template.innerHTML = `
  /* Content editor only styles injected only when the component is viewed in the page editor. */
  .hs-inline-edit .hs-embed-wrapper[data-mce-embed-content~="<code-block"] .hs-embed-content-wrapper {
      display: block;
      background: rgb(45, 45, 45);
      min-height: 20px;
      padding: 10px;
      line-height:1;
      color: rgb(204, 204, 204);
  }
  .hs-inline-edit .hs-embed-wrapper[data-mce-embed-content~="<code-block"] .hs-embed-content-wrapper:before {
      content:"Please make sure to escape HTML and HubL before using in blog posts.";
      display:block;
      position:relative;
      color:red;
      font-weight: bold;
  }
  .hs-inline-edit .hs-embed-wrapper[data-mce-embed-content~="<code-block"]:hover .hs-embed-content-wrapper:after {
      content:"Use the post preview to see an accurate depiction of how the code block will display."    ;
      display:block;
      font-size:.9em;
      position:relative;
      color:gray;
      font-style:italic;
  }
   
  `;
  document.querySelector('head').appendChild(template);
}



// change string into escaped characters to prevent rendering DOM elements. This is used for the contents of the code blocks if the user doesn't specify that the content is escaped.
function encode (str) { 
      var buf = [];
      for (var i = str.length - 1; i >= 0; i--) {
        buf.unshift(["&#", str[i].charCodeAt(), ";"].join(""));
      }
      return buf.join("");
}
  // load Prism to be used by the web component, used for syntax highlighting.
  import syntaxHighlighting from "{{ get_asset_url('../css/components/prism.css')}}" assert { type: "css" }; 
  import "{{ get_asset_url('../js/prism.js') }}";
  
  
  // Register <code-tab> element
  class CodeTab extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    connectedCallback(){
      // pass Syntax highlighting stylesheets to be used in the ShadowDOM for <code-tab> elements.
      this.shadowRoot.adoptedStyleSheets = [syntaxHighlighting];
      // Get attributes from <code-tab> element needed for prism and escaping.
      let language = this.getAttribute("data-language");
      let lineNumbers = this.getAttribute("data-line-numbers") == "false" ?  "no-line-numbers": "line-numbers";
      let isEscaped = this.getAttribute("data-escaped");
      // take whatever code is between <code-tab> and </code-tab> and escape it unless the data-escaped attribute is set to true.
      let code;
      if(isEscaped == "true"){
          code = this.innerHTML.replace(/^\s+/g, "");  // replace strips the leading whitespace

      } else {
          code = encode(this.innerHTML.replace(/^\s+/g, "")); // replace strips the leading whitespace
      }

      // The Shadow DOM HTML for a <code-tab> element.
      this.shadowRoot.innerHTML = `
        <style>
          :host{display:block;}
          :host code[class*="language-"],:host pre[class*="language-"]{margin-top:0;}
        </style>
        <div class="code-snippet">
            <pre class="${lineNumbers}"><code class="language-${language}">${code}</code></pre>
        </div>
        `;
        // once the web component is initialized tell Prism to syntax highlight the code blocks.
        Prism.highlightAllUnder(this.shadowRoot);
    }
  }
  window.customElements.define("code-tab", CodeTab);

  // <code-block> custom element - This element is where you place <code-tab> elements into.
  class CodeBlock extends HTMLElement {
    constructor() {
      super();
      // attach a ShadowDom to the <code-block> element. The mode makes it so JavaScript outside the root can interact with it's contents.
      this.attachShadow({ mode: "open" });
    }
    connectedCallback(){
      
      // check if code-tab element has data-line-numbers set to false. This value gets used to pass the line numbers option to
      /* let lineNumbers = this.getAttribute("data-line-numbers") == "false" ?  "no-line-numbers": "line-numbers"; */
      // let codeTabs = this.querySelectorAll("code-tab");
      const codeBlockElement = this; // the element itself
      const shadowRoot = codeBlockElement.shadowRoot;
      // The ShadowDOM for the <code-block>. The tablist, is where we will place buttons for the user to tab through.
      // <slot> determines where <code-tab> elements will be rendered.
      shadowRoot.innerHTML = `
        <style>
          :host{
            --activeColor: rgb(153, 153, 153);
            --inactiveColor: rgb(45, 45, 45);
          }
          .code-block__tablist button{
            appearance:none;
            border-width:0;
            background:var(--activeColor);
            padding:15px;
            color:#fff;
            border-right:1px solid var(--activeColor);
          }
          .code-block__tablist button:last-of-type{
            border-right:0;
          }
          .code-block__tablist button[aria-selected="true"]{
            background:var(--inactiveColor);
          }
        </style>
        <section class="code-block">
            <div class="code-block__tablist" role="tablist" aria-label="Code Example"></div>
            <slot></slot>
        </section>
      `;
      let codeTabs = codeBlockElement.querySelectorAll("code-tab");
      

      // for each <code-tab> element create a corresponding <button> in a tablist div.
      codeTabs.forEach(function(individualCodeTab,i){
        let tabButton;
        // get the button label from the <code-tab> element 
        let buttonLabel = individualCodeTab.getAttribute("data-label");
        
        // update <code-tab> elements to have corresponding IDs and aria labels to ensure accessibility.
        individualCodeTab.setAttribute("aria-labelledby",`tab-${i}`);
        individualCodeTab.setAttribute("id",`tabPanel-${i}`);

        // if the <button> is for the first <code-tab>, set aria-selected to true because it will be the active tab initially.
        if(i==0){
          tabButton = `<button role="tab" aria-selected="true" id="tab-${i}" aria-controls="tabPanel-${i}">${buttonLabel}</button>`;

        } else {
          tabButton = `<button role="tab" id="tab-${i}" aria-controls="tabPanel-${i}">${buttonLabel}</button>`;
          // set all of the tabs after the first one to hidden initially.
          individualCodeTab.hidden = true;
        }

        // add button element within the tablist div.       
        shadowRoot.querySelector(".code-block__tablist").innerHTML += tabButton;
      });

      /* handle tabs clicks and panel visibility */
      let tabButtons = shadowRoot.querySelectorAll("button[role='tab']");
      //let tabPanels = shadowRoot.querySelectorAll("code-tab"); duplicate of codeTabs
      
      // for every tabButton click, remove aria-selected for all tabs, add aria-selected to clicked tab
      tabButtons.forEach(function(tabButton,i){
       
        tabButton.addEventListener("click",function (){
          let clickedTabButton = this;
          let activeTabPanelId = clickedTabButton.getAttribute("aria-controls");
          let activeCodeTab = codeBlockElement.querySelector(`#${activeTabPanelId}`);
          // remove aria-selected from all tabs
          tabButtons.forEach(function(tabButton){
            tabButton.ariaSelected = false;
      
          });
          // add aria-selected to clicked tab.
          clickedTabButton.ariaSelected = true;
          
          // hide all <code-tab>'s that are not active.
          codeBlockElement.querySelectorAll(`code-tab:not(#${activeTabPanelId})`).forEach(function(inactiveTab){
            inactiveTab.hidden = true;
          });

          // ensure the active <code-tab> is not hidden.
          activeCodeTab.hidden = false;
        });
      });
    }
  }
  window.customElements.define("code-block", CodeBlock);
  

  /* 
    Example of how you'd use this:
    <code-block data-line-numbers="true">
        <code-tab data-language="HTML" data-escaped="true">
            <h1>Your HTML here. Any HTML or HubL should be escaped</h1>
        </code-tab>
    </code-block>

    If multiple code-tabs exist inside code-block it will display tabs for the different languages.
    data-escaped is optional, you are telling the component that your code is already escaped so it doesn't need to be escaped using JavaScript. 
    It is recommended to always escape html otherwise it technically gets added to the DOM temporarily.
    data-language is where you set the language.
  */