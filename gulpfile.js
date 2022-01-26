// ---------------------------------------git upload----------------------------------------------------------------------------------------------------//
// 1. GitHub에서 repository 생성
// 2. 해당 repository의 URL복사
// 3. vscode에서 Source Control 아이콘 클릭
// 4. Initialize Repository 버튼 클릭(로컬 repository 초기화)
// 5. CHANGES의 '+'버튼 클릭(모든 파일 추가)
// 6. Commit(체크모양) 아이콘 클릭
// 7. Commit 내용 입력 후 엔터(로컬 repository에 커밋)
// 8. Terminal에서 "git remote add origin + '2번에서 복사한 url'" 입력(원격 repository 주소를 지정)ex) git remote add origin https://github.com/abc/abc.git
// 9. "git pull origin main --allow-unrelated-histories" 입력(Github 내용을 로컬 repository에 반영)
// 10. "git push -u origin master" 입력
// ---------------------------------------git upload----------------------------------------------------------------------------------------------------//

// ---------------------------------------npm list----------------------------------------------------------------------------------------------------//
// npm install gulp -g
// npm install gulp --save-dev
// npm init
// npm install del dateformat gulp-util gulp-banner gulp-beautify gulp-cache gulp-clean-css gulp-concat gulp-concat-css gulp-file-include gulp-if gulp-html-beautify gulp-imagemin@7.1.0 gulp-load-plugins gulp-print gulp-rename gulp-require gulp-strip-debug sass gulp-sass gulp-sourcemaps gulp-uglify gulp-useref gulp-watch gulp-autoprefixer --save -dev

//---------------필요할때만 사용-------------------//
// npm install gulp-postcss@9.0.0 --save-dev
// npm install postcss@8.1.0
//sass = require("gulp-sass")(require("sass"))
// ---------------------------------------npm list----------------------------------------------------------------------------------------------------//
// 패키지 변수
const gulp = require("gulp"),
  del = require("del"),
  banner = require("gulp-banner"),
  beautify = require("gulp-beautify"), // html, css, js 코드정리
  cache = require("gulp-cache"),
  cleanCSS = require("gulp-clean-css"), // CSS 파일 압축
  concat = require("gulp-concat"), // JS 파일 병합
  concatCss = require("gulp-concat-css"), // css 파일 병합
  fileinclude = require("gulp-file-include"), // HTML 인클루드
  gulpif = require("gulp-if"),
  imagemin = require("gulp-imagemin"), // 이미지 최적화
  print = require("gulp-print").default,
  rename = require("gulp-rename"), // 파일이름 변경
  stripDebug = require("gulp-strip-debug"), //
  sass = require("gulp-sass")(require("sass")), // SASS 파일 컴파일
  sourcemaps = require("gulp-sourcemaps"), // SASS sourcemap
  uglify = require("gulp-uglify"), // JS 파일 압축
  useref = require("gulp-useref"), // 폴더 경로대로 생성
  autoprefixer = require("gulp-autoprefixer"); //vendor prefix
// postcss = require("gulp-postcss")
// sorting = require('postcss-sorting');

const src = "public/src/",
  resources = "resources/",
  prefix = "",
  suffix = ".min",
  version = "",
  charset = "";
//charset = '@charset "UTF-8";\n';
const paths = {
  html: {
    src: [
      `${src}**/*.html`,
      `!${src}**/include/*.html`,
      `!${src}**/unit/*.html`,
      `!${src}**/pop/*.html`,
    ],
    dist: [`${src}**/*.html`, `!${src}**/include/*.html`],
  },
  css: {
    scss: `${src}${resources}sass/**/*.scss`,
    src: `${src}**/css/*.css`,
  },
  js: {
    src: [`${src}**/js/*.js`, `!${src}**/js/lib/*.js`],
    lib: `${src}**/js/lib/*.js`,
    temp: `${src}**/js/temp/*.js`,
  },
  img: {
    src: `${src}**/images/**/*.+(png|jpg|jpeg|gif|svg)`,
  },
  font: {
    src: `${src}**/css/fonts/*`,
  },
};
const sassOption = {
  /**
   * outputStyle (Type : String , Default : nested)
   * CSS의 컴파일 결과 코드스타일 지정
   * Values : nested, expanded, compact, compressed
   */
  outputStyle: "expanded",
  /**
   * indentType (>= v3.0.0 , Type : String , Default : space)
   * 컴파일 된 CSS의 "들여쓰기" 의 타입 * Values : space , tab
   */
  indentType: "tab",
  /**
   * indentWidth (>= v3.0.0, Type : Integer , Default : 2)
   * 컴파일 된 CSS의 "들여쓰기" 의 갯수
   */
  indentWidth: 1, // outputStyle 이 nested, expanded 인 경우에 사용
  /**
   * sourceComments (Type : Boolean , Default : false)
   * 컴파일 된 CSS 에 원본소스의 위치와 줄수 주석표시.
   */
  //sourceComments: true
};
var buildType = false, // build : false / dist : true
  distPath = "public/build/", //distributable
  htmlSrc = paths.html.src,
  imgSrc = paths.img.src;
function clean() {
  return del(`${distPath}*`);
}
function cleanD() {
  buildType = true;
  distPath = "public/dist/";
  htmlSrc = paths.html.dist;
  return del(`${distPath}*`);
}
async function html() {
  var option = {
    indent_with_tabs: true,
  };
  gulp
    .src(htmlSrc)
    .pipe(useref())
    .pipe(
      fileinclude({
        prefix: "@@",
        basepath: "@file",
        context: {
          resources: resources,
          version: version,
          prefix: prefix,
          suffix: suffix,
          buildType: buildType,
        },
      })
    )
    .pipe(gulpif(buildType, beautify.html(option))) // 배포파일은 html 들여쓰기
    .pipe(gulp.dest(distPath));
}
async function css() {
  // sass
  gulp
    .src(paths.css.scss)
    .pipe(useref())
    .pipe(gulpif(!buildType, sourcemaps.init()))
    .pipe(sass(sassOption).on("error", sass.logError))
    .pipe(
      gulpif(
        buildType,
        autoprefixer({ browsers: ["chrome > 0", "firefox > 0", "ie > 0"] })
      )
    )
    .pipe(
      rename({
        prefix: prefix,
      })
    )
    //.pipe(gulpif(!buildType, sourcemaps.write('.',{includeContent: true})))
    .pipe(gulpif(!buildType, sourcemaps.write()))
    .pipe(gulpif(buildType, beautify.css()))
    .pipe(gulp.dest(`${distPath}${resources}/css`));
  // sass min
  if (buildType) {
    gulp
      .src(paths.css.scss)
      .pipe(useref())
      .pipe(gulpif(!buildType, sourcemaps.init()))
      .pipe(sass(sassOption).on("error", sass.logError))
      .pipe(gulpif(buildType, cleanCSS()))
      .pipe(
        gulpif(
          buildType,
          autoprefixer({ browsers: ["chrome > 0", "firefox > 0", "ie > 0"] })
        )
      )
      .pipe(
        rename({
          prefix: prefix,
          suffix: suffix,
        })
      )
      //.pipe(gulpif(!buildType, sourcemaps.write('.',{includeContent: true})))
      .pipe(gulpif(!buildType, sourcemaps.write()))
      .pipe(gulp.dest(`${distPath}${resources}/css`));
  }
  // css폴더 파일
  gulp
    .src(paths.css.src)
    .pipe(useref())
    .pipe(gulp.dest(`${distPath}`));
}
async function js() {
  // js
  gulp
    .src(paths.js.src)
    .pipe(gulpif(buildType, stripDebug())) // 모든 console.log들과 alert 제거
    .pipe(useref())
    .pipe(
      rename({
        prefix: prefix,
        //suffix: suffix
      })
    )
    .pipe(gulp.dest(`${distPath}`));
  //js min
  if (buildType) {
    gulp
      .src(paths.js.src)
      .pipe(gulpif(buildType, stripDebug())) // 모든 console.log들과 alert 제거
      .pipe(gulpif(buildType, uglify()))
      .pipe(useref())
      .pipe(
        rename({
          prefix: prefix,
          suffix: suffix,
        })
      )
      .pipe(gulp.dest(`${distPath}`));
  }
  // js lib
  gulp.src(paths.js.lib).pipe(gulp.dest(`${distPath}`));
  // js temp
  gulp
    .src(paths.js.temp)
    .pipe(gulpif(buildType, stripDebug())) // 모든 console.log들과 alert 제거
    .pipe(gulpif(buildType, uglify()))
    .pipe(useref())
    .pipe(
      rename({
        prefix: prefix,
        suffix: suffix,
      })
    )
    .pipe(gulp.dest(`${distPath}`));
}
async function img() {
  gulp
    .src(paths.img.src)
    .pipe(
      cache(
        imagemin({
          optimizationLevel: 5,
          progressive: true,
          interlaced: true,
        })
      )
    )
    //.pipe(gulpif('**/*.{gif,jpg,jpeg,png,svg}', print()))
    .pipe(gulp.dest(`${distPath}`));
}
async function font() {
  gulp.src(paths.font.src).pipe(gulp.dest(`${distPath}`));
}
// html 코드정리
async function bfh() {
  var option = {
    indent_with_tabs: true,
  };
  gulp
    .src(`${distPath}**/*.html`)
    .pipe(beautify.html(option))
    .pipe(gulp.dest(`${distPath}`));
}
// css 코드정리
async function bfc() {
  gulp
    .src(`${distPath}**/*.css`)
    .pipe(beautify.css())
    .pipe(gulp.dest(`${distPath}`));
}
// js 코드정리
async function bfj() {
  var option = {
    indent_with_tabs: true,
  };
  gulp
    .src([`${distPath}**/*.js`, `!${distPath}**/js/lib/*.js`])
    .pipe(beautify(option))
    .pipe(gulp.dest(`${distPath}`));
}
gulp.task("clean", clean);
gulp.task("cleanD", cleanD);
gulp.task("html", html);
gulp.task("css", css);
gulp.task("js", js);
gulp.task("img", img);
gulp.task("font", font);
gulp.task("bfh", bfh);
gulp.task("bfc", bfc);
gulp.task("bfj", bfj);
function watch() {
  buildType = false;
  gulp.watch(`${src}**/**/*.html`, html);
  gulp.watch([paths.css.scss, paths.css.src], css);
  gulp.watch(paths.js.src, js);
  gulp.watch(paths.img.src, img);
}
gulp.task("watch", watch);
const build = gulp.series(clean, gulp.parallel(html, css, js, img, font));
const dist = gulp.series(cleanD, gulp.parallel(html, css, js, img, font));
gulp.task("build", build);
gulp.task("dist", dist);
gulp.task("default", watch);
