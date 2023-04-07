# Mammoth_Patching

This patch updates the mammoth package to keep the following while conversion: 
- text highlights
- font colors
- author names in comments

## Install Instructions:

#### Run ``` npm install ``` to install package dependencies, and packages "Mammoth" and "Patch-Package"
After Installing, update the following functions in the respective file names mentioned below.

### node_modules/mammoth/lib/documents.js
```
function Run(children, properties) {
    properties = properties || {};
    return {
        type: types.run,
        children: children,
        styleId: properties.styleId || null,
        styleName: properties.styleName || null,
        isBold: properties.isBold,
        isUnderline: properties.isUnderline,
        isItalic: properties.isItalic,
        isStrikethrough: properties.isStrikethrough,
        isAllCaps: properties.isAllCaps,
        isSmallCaps: properties.isSmallCaps,
        verticalAlignment: properties.verticalAlignment || verticalAlignment.baseline,
        font: properties.font || null,
        fontSize: properties.fontSize || null,
        color: properties.color ? '#' + properties.color : null,
        highlight: properties.highlight ? properties.highlight : null
    };
}
```
```
function comment(options) {
    return {
        type: types.comment,
        commentId: options.commentId,
        body: options.body,
        authorName: options.authorName,
        authorInitials: options.authorInitials,
    };
}
```


### node_modules/mammoth/lib/docx/body-reader.js
```
  function readRunProperties(element) {
      return readRunStyle(element).map(function (style) {
          var fontSizeString = element.firstOrEmpty("w:sz").attributes["w:val"];
          // w:sz gives the font size in half points, so halve the value to get the size in points
          var fontSize = /^[0-9]+$/.test(fontSizeString) ? parseInt(fontSizeString, 10) / 2 : null;

          return {
              type: "runProperties",
              styleId: style.styleId,
              styleName: style.name,
              verticalAlignment: element.firstOrEmpty("w:vertAlign").attributes["w:val"],
              font: element.firstOrEmpty("w:rFonts").attributes["w:ascii"],
              fontSize: fontSize,
              isBold: readBooleanElement(element.first("w:b")),
              isUnderline: readUnderline(element.first("w:u")),
              isItalic: readBooleanElement(element.first("w:i")),
              isStrikethrough: readBooleanElement(element.first("w:strike")),
              isAllCaps: readBooleanElement(element.first("w:caps")),
              isSmallCaps: readBooleanElement(element.first("w:smallCaps")),
              color: element.firstOrEmpty("w:color").attributes["w:val"],
              highlight: element.firstOrEmpty("w:highlight").attributes["w:val"],
          };
      });
  }
```

### node_modules/mammoth/lib/document-to-html.js
```
function convertRun(run, messages, options) {
      var nodes = function () {
          return convertElements(run.children, messages, options);
      };
      var paths = [];
      if (run.isSmallCaps) {
          paths.push(findHtmlPathForRunProperty("smallCaps"));
      }
      if (run.isAllCaps) {
          paths.push(findHtmlPathForRunProperty("allCaps"));
      }
      if (run.isStrikethrough) {
          paths.push(findHtmlPathForRunProperty("strikethrough", "s"));
      }
      if (run.isUnderline) {
          paths.push(findHtmlPathForRunProperty("underline"));
      }
      if (run.verticalAlignment === documents.verticalAlignment.subscript) {
          paths.push(htmlPaths.element("sub", {}, { fresh: false }));
      }
      if (run.verticalAlignment === documents.verticalAlignment.superscript) {
          paths.push(htmlPaths.element("sup", {}, { fresh: false }));
      }
      if (run.isItalic) {
          paths.push(findHtmlPathForRunProperty("italic", "em"));
      }
      if (run.isBold) {
          paths.push(findHtmlPathForRunProperty("bold", "strong"));
      }
      if (run.color) {
          paths.push(htmlPaths.element('font', { color: run.color }, { fresh: false }));
      }
      if (run.highlight) {
          paths.push(htmlPaths.element('mark', { 'style': 'background-color:' + run.highlight }, { fresh: false }));
      }
      var stylePath = htmlPaths.empty;
      var style = findStyle(run);
      if (style) {
          stylePath = style.to;
      } else if (run.styleId) {
          messages.push(unrecognisedStyleWarning("run", run));
      }
      paths.push(stylePath);

      paths.forEach(function (path) {
          nodes = path.wrap.bind(path, nodes);
      });

      return nodes();
  }
```


```
  function convertCommentReference(reference, messages, options) {
      return findHtmlPath(reference, htmlPaths.ignore).wrap(function () {
          var comment = comments[reference.commentId];
          var count = referencedComments.length + 1;
          var label =
              "[" +
              commentAuthorLabel(comment) +
              count +
              "] ";

          referencedComments.push({ label: label, comment: comment });
          // TODO: remove duplication with note references
          return [
              Html.freshElement("a", {
                  href: "#" + referentHtmlId("comment", reference.commentId),
                  id: referenceHtmlId("comment", reference.commentId),
              }, [Html.text(label)])
          ];
      });
  }

  function convertComment(referencedComment, messages, options) {
      // TODO: remove duplication with note references
      var label = referencedComment.label;
      var comment = referencedComment.comment;
      var body = convertElements(comment.body, messages, options).concat([
          Html.nonFreshElement("p", {}, [
              Html.text(" "),
              Html.freshElement("a", { href: "#" + referenceHtmlId("comment", comment.commentId) }, [
                  Html.text("↑")
              ])
          ])
      ]);
      var commentInfo = "";
      if (comment.authorName) {
          commentInfo += "Author: " + comment.authorName + ". ";
      }
      if (commentInfo) {
          body.unshift(Html.freshElement("p", {}, [Html.text(commentInfo)]));
      }
      return [
          Html.freshElement("dt", { id: referentHtmlId("comment", comment.commentId) }, [
              Html.text("Comment " + label),
          ]),
          Html.freshElement("dd", {}, body),
      ];
  }
```

#### After updating the above functions, run ``` npm install ``` again.

The patch will be applied, write the name of your docx file in input file name. Please make sure that the file is in the root directory or complete path is provided.
After that run ``` npm start ``` to initiate the conversion process, The converted HTML file will be placed in root directory by default or you can provide the path where you want to place it. 

