// 'use client';

import React, { useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import { Color as TiptapColor } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import { Image as TiptapImage } from '@tiptap/extension-image';
import { Mark } from '@tiptap/core';

import {
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3,
  List, ListOrdered, Pilcrow, Type as FontIcon, Tags,
  Link as LinkIcon, Image as ImageIcon, Palette, Paintbrush
} from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from './ui/dropdown-menu';
import { cn } from '../lib/utils';
const FontSizeMark = Mark.create({
  name: 'fontSizeMark',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: (element) => element.style.fontSize,
        renderHTML: (attributes) => {
          if (!attributes.fontSize) return {};
          return { style: `font-size: ${attributes.fontSize}` };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        style: 'font-size',
        getAttrs: (value) => {
          if (typeof value === 'string' && /^\d+(pt|px|em|rem|%)$/.test(value)) {
            return { fontSize: value };
          }
          return false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0];
  },

  addCommands() {
    return {
      setFontSize: (fontSize) => ({ commands }) => {
        return fontSize
          ? commands.setMark(this.name, { fontSize })
          : commands.resetAttributes(this.name, 'fontSize');
      },
      unsetFontSize: () => ({ commands }) => {
        return commands.resetAttributes(this.name, 'fontSize');
      },
    };
  },
});

// === Data Tag Values ===
const dataTags = [
  { label: 'Customer Name', value: '{{customerName}}' },
  { label: 'Customer Email', value: '{{customerEmail}}' },
  { label: 'Customer Phone', value: '{{customerPhone}}' },
  { label: 'Billing: Street', value: '{{customerBillingAddress.street}}' },
  { label: 'Billing: City', value: '{{customerBillingAddress.city}}' },
  { label: 'Billing: State', value: '{{customerBillingAddress.state}}' },
  { label: 'Billing: Zip', value: '{{customerBillingAddress.zip}}' },
  { label: 'Billing: Country', value: '{{customerBillingAddress.country}}' },
  { label: 'Shipping: Street', value: '{{customerShippingAddress.street}}' },
  { label: 'Shipping: City', value: '{{customerShippingAddress.city}}' },
  { label: 'Shipping: State', value: '{{customerShippingAddress.state}}' },
  { label: 'Shipping: Zip', value: '{{customerShippingAddress.zip}}' },
  { label: 'Shipping: Country', value: '{{customerShippingAddress.country}}' },
  { label: 'Document Number', value: '{{documentNumber}}' },
  { label: 'Issue Date', value: '{{issueDate}}' },
  { label: 'Due Date / Valid Until / Expiry Date', value: '{{dueDate}}' },
  { label: 'Total Amount', value: '{{totalAmount}}' },
  { label: 'Payment Terms', value: '{{paymentTerms}}' },
  { label: 'Commitment Period', value: '{{commitmentPeriod}}' },
  { label: 'Service Start Date', value: '{{serviceStartDate}}' },
  { label: 'Service End Date', value: '{{serviceEndDate}}' },
  { label: 'Signature Panel', value: '{{signaturePanel}}' },
];

// === MenuBar Component ===
const fontSizes = ["8pt", "10pt", "12pt", "14pt", "16pt", "18pt", "20pt", "22pt", "24pt"];
const MenuBar = ({ editor, disabled }) => {
  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

   const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-1 border-b border-input p-2 bg-background rounded-t-md sticky top-16 z-10')}>
      {[
        { icon: Bold, label: 'Bold', command: 'toggleBold' },
        { icon: Italic, label: 'Italic', command: 'toggleItalic' },
        { icon: UnderlineIcon, label: 'Underline', command: 'toggleUnderline' },
      ].map(({ icon: Icon, label, command }) => (
        <Button
          key={label}
          type="button"
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus()[command]().run()}
          className={cn('h-8 w-8', { 'bg-accent text-accent-foreground': editor.isActive(command.replace('toggle', '').toLowerCase()) })}
          disabled={disabled}
          title={label}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}

      <Button type="button" variant="outline" size="icon" onClick={setLink} title="Link" disabled={disabled}>
        <LinkIcon className="h-4 w-4" />
      </Button>

      <Button type="button" variant="outline" size="icon" onClick={addImage} title="Image" disabled={disabled}>
        <ImageIcon className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" title="Font Size" disabled={disabled}>
            <FontIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={() => editor.chain().focus().unsetFontSize().run()}>
            Default
          </DropdownMenuItem>
          {fontSizes.map((size) => (
            <DropdownMenuItem key={size} onSelect={() => editor.chain().focus().setFontSize(size).run()}>
              {size}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-1">
        <Button type="button" variant="outline" size="icon" onClick={() => editor.chain().focus().unsetColor().run()} title="Remove Color" disabled={disabled}>
          <Paintbrush className="h-4 w-4" />
        </Button>
        <div className="relative h-8 w-8">
          <Palette className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
          <input
            type="color"
            onInput={(e) => editor.chain().focus().setColor(e.target.value).run()}
            value={editor.getAttributes('textStyle').color || '#000000'}
            className="opacity-0 absolute inset-0 cursor-pointer"
            disabled={disabled}
          />
        </div>
      </div>

      {[
        { icon: Pilcrow, label: 'Paragraph', command: () => editor.chain().focus().setParagraph().run() },
        { icon: Heading1, label: 'H1', command: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
        { icon: Heading2, label: 'H2', command: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
        { icon: Heading3, label: 'H3', command: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
        { icon: List, label: 'Bullet List', command: () => editor.chain().focus().toggleBulletList().run() },
        { icon: ListOrdered, label: 'Ordered List', command: () => editor.chain().focus().toggleOrderedList().run() },
      ].map(({ icon: Icon, label, command }) => (
        <Button key={label} type="button" variant="outline" size="icon" onClick={command} title={label} disabled={disabled}>
          <Icon className="h-4 w-4" />
        </Button>
      ))}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" title="Insert Tag" disabled={disabled}>
            <Tags className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
          {dataTags.map((tag) => (
            <DropdownMenuItem
              key={tag.value}
              onSelect={() => editor.chain().focus().insertContent(tag.value).run()}
              disabled={disabled}
            >
              {tag.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// === RichTextEditor Component ===
export function RichTextEditor({ value, onChange, disabled = false }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      FontSizeMark,
      Underline,
      LinkExtension.configure({ openOnClick: false, autolink: true }),
      TiptapImage.configure({ inline: false }),
      TextStyle,
      TiptapColor.configure({ types: ['textStyle'] }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor) editor.setEditable(!disabled);
  }, [disabled, editor]);

  return (
    <div className="rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      <MenuBar editor={editor} disabled={disabled} />
      <EditorContent
        editor={editor}
        className={cn(
          "min-h-[200px] w-full rounded-b-md bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground",
          "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          disabled ? "bg-muted/50" : ""
        )}
      />
    </div>
  );
}