export const MONACO_EDITOR_OPTIONS = {
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

export function defineAndSetTheme(monaco) {
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
    });
    monaco.editor.setTheme("myTheme"); 
}