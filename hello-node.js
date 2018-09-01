// path와 fs, ejs 모듈 불러오기
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const directoryPath = path.join(__dirname, "contents");

const contentFiles = fs.readdirSync(directoryPath);

// 템플릿 가져오기
const indexHtmlFormat = fs.readFileSync("./templates/index.html", "utf8");
const listHtmlFormat = fs.readFileSync("./templates/list.html", "utf8");
// mardown-it

var MarkdownIt = require("markdown-it"),
  md = new MarkdownIt();

// deploy디렉토리 생성
const dir = "./deploy";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}
// 확장자를 제외한 파일 이름을 얻는 함수
getHtmlFileName = file => {
  return file.slice(0, file.indexOf(".")).toLocaleLowerCase();
};
// deploy 폴더 안에 넣은 파일의 리스트
const deployFiles = [];
// map함수로 content안에 있는 파일들을 반복문을 돌면서 deploy안에 html파일 생성
contentFiles.map(file => {
  let body = fs.readFileSync(`./contents/${file}`, "utf-8");
  body = md.render(body);
  articleHtml = ejs.render(indexHtmlFormat, {
    body
  });
  const fileName = getHtmlFileName(file);
  fs.writeFileSync(`./deploy/${fileName}.html`, articleHtml);
  deployFiles.push(fileName);
});

// index.html파일 생성
const listHtml = ejs.render(listHtmlFormat, {
  fileList: deployFiles
});

fs.writeFileSync("./index.html", listHtml);
