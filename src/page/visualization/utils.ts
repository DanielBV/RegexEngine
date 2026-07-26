import type { EditorDidMount } from "react-monaco-editor";

export type Monaco = Parameters<EditorDidMount>[1];
export type Editor = Parameters<EditorDidMount>[0];

// Loosely typed on purpose: this is a literal options blob handed straight to
// monaco-editor, which is more lenient at runtime than its own construction-options
// types (e.g. accepts booleans where a string union is declared).
export const MONACO_EDITOR_OPTIONS: Record<string, any> = {
    selectOnLineNumbers: true,
    lineNumbers: 'off',
    glyphMargin: false,
    folding: false,
    // Undocumented see https://github.com/Microsoft/vscode/issues/30795#issuecomment-410998882
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 0,
    minimap: {
        enabled: false
    },
    scrollbar: {
        vertical: "auto"
    },
    renderWhitespace: true,
    wordWrap: true
  };

export function defineAndSetTheme(monaco: Monaco) {
    // Cast to any: `rules` entries are missing the `token` field required by
    // monaco's own IStandaloneThemeData type, but monaco accepts this shape fine at runtime.
    monaco.editor.defineTheme('myTheme', {
        base: 'vs',
        inherit: true,
        rules: [{ background: 'EDF9FA' }],
        colors: {
            'editor.foreground': '#000000',
            'editor.background': '#f5fcfc',
            'editorCursor.foreground': '#8B0000',
            'editor.lineHighlightBackground': '#f5fcfc',
            'editorLineNumber.foreground': '#008800',
            'editor.selectionBackground': '#88000030',
            'editor.inactiveSelectionBackground': '#88000015'
        }
    } as any);
    monaco.editor.setTheme("myTheme");
}
