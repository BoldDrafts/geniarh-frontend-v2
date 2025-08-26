// config/tinymceConfig.ts
export const editorConfig = {
  height: 400,
  menubar: false,
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
    'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'table', 'code', 'help', 'wordcount'
  ],
  toolbar: 'undo redo | formatselect | ' +
    'bold italic | bullist numlist outdent indent | ' +
    'removeformat | help',
  content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; }',
  formats: {
    h1: { block: 'h1', classes: 'text-2xl font-bold' },
    h2: { block: 'h2', classes: 'text-xl font-bold' },
    h3: { block: 'h3', classes: 'text-lg font-bold' }
  },
  setup: (editor: any) => {
    editor.on('init', () => {
      editor.getContainer().style.transition = 'border-color 0.15s ease-in-out';
    });
  }
};