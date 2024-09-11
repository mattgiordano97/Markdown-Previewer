/* Global variables and constants */
const editorInit = `# Welcome to my React Markdown Previewer!

## This is a sub-heading...
### And here's some other cool stuff:

Heres some code, \`<div></div> \`, between 2 backticks.

\`\`\`
// this is multi-line code:

function anotherExample(firstLine, lastLine) {
    if (firstLine == "\`\`\`" && lastLine == "\`\`\`") {
        return multiLineCode;
    }
}
\`\`\`

You can also make text **bold**... whoa!
Or _italic_.
Or... wait for it... **_both!_*.

There's also [links](https://www.freecodecamp.org), and

> Block Quotes!

And if you want to get really crazy, even tables:

| Wild Header | Crazy Header | Another Header? |
| ------------ | ------------- | ------------- |
| Your content can | be here, and it | can be here.... |
| And here. | Okay. | I think we get it. |

- And of course there are lists.
  - Some are bulleted.
    - With different indentation levels.
    - That look like this.

![freeCodeCamp Logo](https://cdn.freecodecamp.org/testable-projects-fcc/images/fcc_secondary.svg)
`;

const expandIcon = '<i class="fas fa-expand-arrows-alt lead"></i>';
const shrinkIcon = '<i class="fas fa-compress lead"></i>';

let lineIndex = 0;

/* Previewer functions */


/* Format headings (TODO) */
const formatHeading1 = (headingLine) => {
    return `
        <h1>${headingLine.slice(2)}</h1>
        <hr class="border-dark">
    `;
}
const formatHeading2 = (headingLine) => {
    return `
        <h2>${headingLine.slice(3)}</h2>
        <hr class="border-dark">
    `;
}
const formatHeading3 = (headingLine) => {
    return `
        <h3>${headingLine.slice(4)}</h3>
    `;
}

/* Format multiline code */
const formatMulCode = (lines, endingIndex) => {
    const start = lineIndex + 1;
    const end = endingIndex - 1;

    // Se blocco vuoto ritorna niente
    if (end <= start) {
        return '';
    }

    const codeLines = lines.slice(start, end + 1);
    let codeText = codeLines.join('\n');
    // Remove special characters from codeText
    codeText = codeText.replaceAll('<', '&lt');
    codeText = codeText.replaceAll('>', '&gt');
    codeText = codeText.replaceAll('`', "'");

    return `
    <pre class="rounded border border-dark px-3 m-3"><code>${codeText}</code ></pre >
    `;
}

/* Format block quote */
const formatBlockQuote = (lines, endingIndex) => {
    const start = lineIndex;
    const end = endingIndex;
    let blockQuote = lines.slice(start, end + 1).join('\n').slice(2);
    blockQuote = blockQuote.replaceAll('<', '&lt');
    blockQuote = blockQuote.replaceAll('>', '&gt');

    return `<pre class="ml-3 pl-2" style="border-left: 5px solid green">${blockQuote}</pre>`;
}

/* Format table */
const formatTable = (lines, endingIndex) => {
    const start = lineIndex;
    const end = endingIndex;
    let tableHtml = "";

    const tableHeader = lines[start];
    const tableRows = lines.slice(start + 2, end + 1);

    console.log("header: ", tableHeader);
    console.log("rows: ", tableRows);

    const headerCols = tableHeader.split('|').slice(1,-1);
    console.log("header cols: ", headerCols);
    
    // Render table header
    tableHtml += `
        <table class="table table-striped table-bordered">
            <thead class="thead-dark">
                <tr>
    `;
    headerCols.forEach(el => {tableHtml += `<th scope="col">${el}</th>`});
    tableHtml += `
                </tr>
            </thead>
    `;

    // Render table body
    tableHtml += `
            <tbody>
    `;
    tableRows.forEach(row => {
        tableHtml += `<tr>`;
        
        const rowCols = row.split('|').slice(1, -1);
        rowCols.forEach(el => {
            tableHtml += `<td>${el}</td>`});

        tableHtml += `</tr>`;
    });


    // close tags
    tableHtml += `
            </tbody>
        </table>
    `;

    console.log("tableHtml: ", tableHtml);
    return tableHtml;
}


/* Format list */
const formatList = (lines, endingIndex) => {
    let listHtml = "";
    
    const start = lineIndex;
    const end = endingIndex;

    let listLines = lines.slice(start, end + 1);
    let indentLevel = 0;

    // Open list
    listHtml += `<ul>`;

    // Inner elements
    listLines.forEach(listLine => {
        // Indent is half the number of leading whitespaces
        const currentIndent = Math.floor(listLine.match(/^\s*/)[0].length / 2);

        const listLineText = listLine.replace(/^\s*-\s/, '');
        if (currentIndent === indentLevel + 1) {
            indentLevel++;
            listHtml += `<ul>`;
        }
        else if (currentIndent < indentLevel) {
            listHtml += `</ul>`.repeat(indentLevel - currentIndent);
            indentLevel = currentIndent;
        }
        listHtml += `<li>${listLineText}</li>`;
    });

    // Close all sublists
    listHtml += "</ul>".repeat(indentLevel);

    // Close list
    listHtml += `</ul>`;

    console.log(listHtml);
    console.log("indentLevel: ", indentLevel);

    return listHtml;
}

/* Format image */
const formatImage = (line) => {
    console.log("pippo");
    const regex = line.match(/^!\[(.*)\]\((.*)\)$/);
    const myCaption = regex[1];
    const myUrl = regex[2];
    
    return `
    <figure class="figure">
         <img src="${myUrl}">
         <figcaption class="figure-caption text-xs-right">${myCaption}</figcaption>
     </figure>
    `;
}

/* Format normal text */
const formatText = (lines, endingIndex) => {
    const start = lineIndex;
    const end = endingIndex;

    const textLines = lines.slice(start, end + 1);
    let text = textLines.join('\n');
    text = text.replaceAll('<', '&lt');
    text = text.replaceAll('>', '&gt');

    // Format text with inline code, bold, italic, links
    
    // inline code
    text = text.replace(/`([^`]*)`/g, (match, p1) => `<code>${p1}</code>`);
    // bold text
    text = text.replace(/\*\*([^\*]*)\*\*/g, (match, p1) => `<strong>${p1}</strong>`);
    // italic text
    text = text.replace(/_([^_]*)_/g, (match, p1) => `<em>${p1}</em>`);

    // links
    text = text.replace(/\[([^\[\]]*)\]\(([^\(\)]*)\)/g, (match, p1, p2) => `<a href="${p2}">${p1}</a>`);

    return `<p>${text}</p>`;
}

/* Given a line, returns its type and ending index if it's a multiline
1) Line types (mutually exclusive):
    normal text (paragraphs)
    no text (metti rigo vuoto)
    heading
    multi-line code
    block quotes
    tables
    lists
    embedded image
*/
const getLineType = (lines) => {
    const line = lines[lineIndex];  // first line of the block
    let lineType = "";              // Name of the line (or block of lines) type
    let endIndex = lineIndex;       // index of last line of this block

    // Headings -> "# ", "## ", "### "
    if (line.slice(0, 2) === "# ") {
        lineType = "h1";
    }
    else if (line.slice(0, 3) === "## ") {
        lineType = "h2";
    }
    else if (line.slice(0, 4) === "### ") {
        lineType = "h3";
    }
    // Multi-line code
    /* First line of the block starts with '```' and there is a closing '```' afterwards */
    else if (line.slice(0, 3) === '```' && lines.slice(lineIndex + 1).findIndex(el => el === '```') !== -1) {
        lineType = "mulCode";
        const offset = lines.slice(lineIndex + 1).findIndex(el => el === '```');
        endIndex = offset + lineIndex + 1;  // index of the closing backticks
    }
    // Block quotes
    else if (line.slice(0, 2) === "> ") {
        lineType = "blockQuote";
        const offset = lines.slice(lineIndex).findIndex(el => el === '');
        // If there is an empty line, the block ends in the previous line, otherwise the block ends at the last line
        endIndex = offset !== -1 ? (offset + lineIndex - 1) : (lines.length - 1);
    }
    // Tables
        /* count number of "|" on first line
        /  second line must have same amount of "|", divided by at least one "-"
        */
    else if (
        lines.slice(lineIndex).length > 1 &&
        line.split('').filter(el => el === '|').length === lines[lineIndex + 1].split('').filter(el => el === '|').length &&
        lines[lineIndex + 1].match(/(\|[\s-]*)+/)
    ) {
        lineType = "table";
        const offset = lines.slice(lineIndex).findIndex(el => el === '');
        // If there is an empty line, the block ends in the previous line, otherwise the block ends at the last line
        endIndex = offset !== -1 ? (offset + lineIndex - 1) : (lines.length - 1);
    }
    // lists
    else if (line.slice(0, 2) === '- ') {
        lineType = "list";
        // list ends on first line that doesn't start with "- " with any number of white spaces before it
        const offset = lines.slice(lineIndex).findIndex(el => !el.match(/^\s*-\s/));
        // If the list continues until the last line, offset is "-1"
        endIndex = offset !== -1 ? (offset + lineIndex - 1) : (lines.length - 1);
    }
    // embedded image
    else if (line.match(/^!\[.*\]\(.*\)$/)) {
        lineType = "embeddedImage";
    }
    // line break
    else if (line === '') {
        lineType = "emptyline";
    }
    // Normal text
    else {
        lineType = "normal";
        const offset = lines.slice(lineIndex).findIndex(el => el === '');
        // If there is an empty line, the block ends in the previous line, otherwise the block ends at the last line
        endIndex = offset !== -1 ? (offset + lineIndex - 1) : (lines.length - 1);
    }

    return {lineType, endIndex};
}

/* Render current line or block of lines */
const renderLine = (lines) => {
    let renderedLine = "";

    // Get line type and index of the last line of the block
    const { lineType, endIndex } = getLineType(lines);

    console.log("lineIndex: " + lineIndex);
    console.log("endIndex:  " + endIndex);
    console.log("lineType:  " + lineType);

    // Based on line type, call the appropriate render function
    switch (lineType) {
        case 'h1':
            renderedLine = formatHeading1(lines[lineIndex]);
            break;
        case 'h2':
            renderedLine = formatHeading2(lines[lineIndex]);
            break;
        case 'h3':
            renderedLine = formatHeading3(lines[lineIndex]);
            break;
        case 'mulCode':
            renderedLine = formatMulCode(lines, endIndex);
            break;
        case 'blockQuote':
            renderedLine = formatBlockQuote(lines, endIndex);
            break;
        case 'table':
            renderedLine = formatTable(lines, endIndex);
            break;
        case 'list':
            renderedLine = formatList(lines, endIndex);
            break;
        case 'embeddedImage':
            renderedLine = formatImage(lines[lineIndex]);
            break;
        case 'emptyLine':
            renderedLine = '';
            break;

        default:
            renderedLine = formatText(lines, endIndex);
            break;
    }

    lineIndex = endIndex + 1;
    return `<p>${renderedLine}</p>`;
}

/* On Document Ready */
$(document).ready(function () {
    /* Expand/Shrink Editor button */
    $("#expand-editor-btn").on("click", function () {
        if ($("#expand-editor-btn").html() === expandIcon) {
            // Expand Editor
            $("#expand-editor-btn").html(shrinkIcon);
            $("#editor, .container, #editor textarea").addClass("vh-100");

        }
        else {
            // Shrink Editor
            $("#expand-editor-btn").html(expandIcon);
            $("#editor, .container, #editor textarea").removeClass("vh-100");
        }
        $("#previewer").toggle();
    });

    /* Expand/Shrink Previewer button */
    $("#expand-previewer-btn").on("click", function () {
        if ($("#expand-previewer-btn").html() === expandIcon) {
            // Expand Editor
            $("#expand-previewer-btn").html(shrinkIcon);
            $("#previewer-content").addClass("vh-100");

        }
        else {
            // Shrink Editor
            $("#expand-previewer-btn").html(expandIcon);
            $("#previewer-content").removeClass("vh-100");
        }
        $("#editor").toggle();
    });

    /* Render previewer based on editor content */
    $("#editor textarea").on("keyup", function () {
        // Get textarea content and split it in lines
        const text = $("#editor-content").val();
        const lines = text.split('\n');
        
        // Initialize previewer
        lineIndex = 0;
        $('#previewer-content').html("");

        // Render each line or block of lines
        while (lineIndex < lines.length) {
            const renderedLines = renderLine(lines)
            $('#previewer-content').append(renderedLines);
        }
        
    });

    // Set editor initial content and trigger keyup
    $('#editor-content').html(editorInit);
    $('#editor textarea').trigger('keyup');
});


/*
Previewer functionalities:
1) Headings
    "# text"    -> Size very big, underlined, margin-bottom very big
    "## text"   -> Size big, underlined, margin-bottom big
    "### text"  -> Size medium, margin-bottom medium

2) Code
*/



/*
1) Line types (mutually exclusive):
    normal text (paragraphs)
    no text (metti rigo vuoto)
    heading
    multi-line code (testo su stessa riga di ''' non viene visto)
    block quotes (">" oppure "> ", termina a spazio vuoto)
    tables (headings line must have same amount of "|" as the next line, next line must have "|" separated by at least one "-" and optional " ")
    lists
    embedded image
2) Text modifiers:
    inline code
    bold, italic, overline
    links
*/







/*
TODO
- rendi headings più carini magari racchiudendoli in riga e colonna per bootstrap

*/

// $("#premi").on("click", function () {
//     lineIndex = 0;
//     const text = $("#editor-content").val();
//     const lines = text.split('\n');

//     console.log("lines: " + lines);
//     renderLine(lines);
// });

