import DynamicImport from "./dynamic-import";

type load_t = (v: string) => Promise<any>;
type hgFunc_t = (content: string, language: string) => string;

const _mapPromise: Map<string, Promise<any>> = new Map();

let hljs: any;
DynamicImport("../../highlight.js/core.min.js").then((m) => {
    hljs = m.default;
    LoadLanguage = _LoadLanguage;
    Highlight = _Highlight;
    _LoadLanguage("plaintext");
});

function _LoadLanguage(language: string): Promise<any> {
    let _p: Promise<any> | undefined = _mapPromise.get(language);
    if (!_p) {
        console.info(`[SLOG] load language highlight file: ${language}`);
        _p = DynamicImport(`../../highlight.js/languages/${language}.min.js`).then(
            (m) => {
                hljs.registerLanguage(language, m.default);
            },
            (err) => {
                //ToastMessager.Show(`error loading language parser:\n${err}`, MessagerLevel.ERROR);
            }
        );
        _mapPromise.set(language, _p);
    }
    return _p;
}

function _Highlight(content: string, language: string): string {
    return hljs.highlight(content, { language }).value;
}

let LoadLanguage: load_t = (_) => {
    return Promise.resolve();
};
let Highlight: hgFunc_t = (content, _) => {
    return content;
};

export default { LoadLanguage, Highlight };
