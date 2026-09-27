import { Extension } from '@tiptap/core';
import { v4 as uuidv4 } from 'uuid';

export const BlockIdExtension = Extension.create({
  name: 'blockId',

  addGlobalAttributes() {
    return [
      {
        types: ['heading', 'paragraph', 'blockquote'],
        attributes: {
          blockId: {
            default: null,
            rendered: true,
            keepOnSplit: false, // create new UUID on split
            parseHTML: (element) => element.getAttribute('data-block-id') || uuidv4(),
            renderHTML: (attributes) => {
              if (!attributes.blockId) {
                return {};
              }
              return {
                'data-block-id': attributes.blockId,
                id: `block-${attributes.blockId}`,
              };
            },
          },
        },
      },
    ];
  },

  onCreate() {
    // Ensure existing nodes without a blockId receive one
    const { tr, doc } = this.editor.state;
    let modified = false;

    doc.descendants((node, pos) => {
      if (['heading', 'paragraph', 'blockquote'].includes(node.type.name)) {
        if (!node.attrs.blockId) {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            blockId: uuidv4(),
          });
          modified = true;
        }
      }
    });

    if (modified) {
      this.editor.view.dispatch(tr);
    }
  },
});
