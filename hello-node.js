// path와 fs, ejs 모듈 불러오기
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const directoryPath = path.join(__dirname, "contents");

const contentFiles = fs.readdirSync(directoryPath);
// 사용자 파일 읽기
const authorFile = fs.readFileSync("./author/author.md", "utf8");

// 템플릿 가져오기
const articleHtmlFormat = fs.readFileSync(
  "./templates/article_format.html",
  "utf8"
);
const listHtmlFormat = fs.readFileSync("./templates/list_format.html", "utf8");
const layoutHtmlFormat = fs.readFileSync(
  "./templates/layout_format.html",
  "utf8"
);
const HeaderHtmlFormat = fs.readFileSync(
  "./templates/header_format.html",
  "utf8"
);
// mardown-it & highlightjs
const hljs = require("highlight.js");

const md = require("markdown-it")({
  html: false,
  xhtmlOut: false,
  breaks: false,
  langPrefix: "language-",
  linkify: true,
  typographer: true,
  quotes: "“”‘’",
  highlight: function(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(lang, str, true).value +
          "</code></pre>"
        );
      } catch (__) {}
    }

    return (
      '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + "</code></pre>"
    );
  }
});

// deploy디렉토리 생성
const dir = "./deploy";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}
// 확장자를 제외한 파일 이름을 얻는 함수
const getHtmlFileName = file => {
  return file.slice(0, file.indexOf(".")).toLocaleLowerCase();
};
// 본문 추출 함수
const extractBody = text => {
  return text.replace(/(\+{3})([\s|\S]+?)(\1)/, "");
};

// 글 정보 추출 함수

const extractValue = text => {
  const string = text.match(/(\+{3})([\s|\S]+?)\1/);

  if (!string) {
    return null;
  } else {
    const valueLines = string[2].match(/[^\r\n]+/g);
    const values = {};
    if (valueLines) {
      valueLines.map(valueLine => {
        const keyAndValue = valueLine.match(/(.+?)=(.+)/);
        if (keyAndValue) {
          const key = keyAndValue[1].replace(/\s/g, "");
          const value = keyAndValue[2].replace(/['"]/g, "").trim();
          values[key] = value;
        }
      });
      return values;
    }
  }
};
// 사용자 값 읽기
const authorValue = extractValue(authorFile);
console.log(authorValue);
// deploy 폴더 안에 넣은 파일의 리스트
const deployFiles = [];
const header = ejs.render(HeaderHtmlFormat, {
  title: authorValue.title,
  logo: authorValue.logo,
  github: authorValue.github
});
const authorBody = extractBody(authorFile);
const author = ejs.render(articleHtmlFormat, {
  title: "ABOUT",
  date: "",
  body: authorBody,
  disqus: authorValue.disqus
});
const aboutHtml = ejs.render(layoutHtmlFormat, {
  content: author,
  header
});
fs.writeFileSync(`./deploy/about.html`, aboutHtml);
// map함수로 content안에 있는 파일들을 반복문을 돌면서 deploy안에 html파일 생성
contentFiles.map(file => {
  const text = fs.readFileSync(`./contents/${file}`, "utf8");
  const convertedBody = md.render(extractBody(text));
  const value = extractValue(text);
  if (value) {
    const title = value.title || " ";
    const date = value.date || " ";
    const desc = value.desc || " ";
    const articleContent = ejs.render(articleHtmlFormat, {
      body: convertedBody,
      title,
      date,
      disqus: authorValue.disqus
    });

    const articleHtml = ejs.render(layoutHtmlFormat, {
      content: articleContent,
      header
    });
    const fileName = getHtmlFileName(file);
    fs.writeFileSync(`./deploy/${fileName}.html`, articleHtml);
    deployFiles.push({ path: `${fileName}.html`, title, date, desc });
  }
});

// index.html파일 생성 / 파일 목록 렌더
const listContent = ejs.render(listHtmlFormat, {
  lists: deployFiles
});
const listHtml = ejs.render(layoutHtmlFormat, {
  content: listContent,
  header
});

fs.writeFileSync("./index.html", listHtml);
