import { basicSetup } from "codemirror"
import { EditorView } from "@codemirror/view"
import { EditorState, Compartment } from "@codemirror/state"
import { vim } from "@replit/codemirror-vim"
import { markdown as lang_markdown } from "@codemirror/lang-markdown"
import { javascript as lang_javascript } from "@codemirror/lang-javascript"
import { json as lang_json } from "@codemirror/lang-json"
import { html as lang_html } from "@codemirror/lang-html"

const _langMap: Record<string, Function> = {
    'markdown': lang_markdown,
    'javascript': lang_javascript,
    'json': lang_json,
    'html': lang_html,
}

/**
 * <h1>doc to test </h1>
 */
export default class TextareaWithHighlight {
    #_text: string = '';
    #_lang: string = 'markdown';
    #_editor: EditorView | undefined;
    #_state: EditorState | undefined;
    #_language: Compartment;

    constructor() {
        this.#_language = new Compartment();
    }

    Init(editableElement: HTMLElement) {
        if (this.#_editor) return;

        const _langFunc: Function = (this.#_lang ? _langMap[this.#_lang] : lang_markdown) ?? lang_markdown;
        this.#_state = EditorState.create({
            extensions: [
                vim(),
                basicSetup,
                this.#_language.of(_langFunc()),
            ],
            doc: this.#_text,
        })

        this.#_editor = new EditorView({
            state: this.#_state,
            parent: editableElement,
        })

        this.#_text = '';
        this.#_lang = '';
    }

    get text(): string {
        const currentValue = this.#_editor?.state.doc.toString();
        return currentValue ?? this.#_text;
    }

    set text(s: string) {
        if (this.#_editor) {
            const _len: number = this.#_editor.state.doc.toString().length;
            this.#_editor.dispatch({
                changes: { from: 0, to: _len, insert: s },
            });
        } else {
            this.#_text = s;
        }
    }

    set highlightLang(lang: string) {
        if (this.#_editor) {
            const _langFunc: Function = (lang ? _langMap[lang] : lang_markdown) ?? lang_markdown;
            this.#_editor.dispatch({
                effects: this.#_language.reconfigure(_langFunc())
            })
        } else {
            this.#_lang = lang;
        }
    }

    Destroy() {
        this.#_editor?.destroy();
        this.#_editor = undefined;
        this.#_text = '';
    }
}

