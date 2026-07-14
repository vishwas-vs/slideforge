import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Block } from '@slideforge/schema';
import { renderBlockToMarkdown } from './render-block.js';

test('renders a text block as plain content', () => {
  const block: Block = { id: 'b1', type: 'text', content: 'Hello world' };
  assert.equal(renderBlockToMarkdown(block), 'Hello world');
});

test('renders an unordered bulletList as a dash list', () => {
  const block: Block = { id: 'b1', type: 'bulletList', items: ['one', 'two'] };
  assert.equal(renderBlockToMarkdown(block), '- one\n- two');
});

test('renders an ordered bulletList as a numbered list', () => {
  const block: Block = { id: 'b1', type: 'bulletList', items: ['one', 'two'], ordered: true };
  assert.equal(renderBlockToMarkdown(block), '1. one\n2. two');
});

test('renders a code block with its language, and a filename label when given', () => {
  const withoutFilename: Block = { id: 'b1', type: 'code', content: 'x', language: 'ts' };
  assert.equal(renderBlockToMarkdown(withoutFilename), '```ts\nx\n```');

  const withFilename: Block = {
    id: 'b2',
    type: 'code',
    content: 'x',
    language: 'ts',
    filename: 'a.ts',
  };
  assert.equal(renderBlockToMarkdown(withFilename), '**a.ts**\n\n```ts\nx\n```');
});

test('renders an image with alt text, and a caption when given', () => {
  const withoutCaption: Block = { id: 'b1', type: 'image', src: 'x.png', alt: 'a picture' };
  assert.equal(renderBlockToMarkdown(withoutCaption), '![a picture](x.png)');

  const withCaption: Block = {
    id: 'b2',
    type: 'image',
    src: 'x.png',
    alt: 'a picture',
    caption: 'Figure 1',
  };
  assert.equal(renderBlockToMarkdown(withCaption), '![a picture](x.png)\n\n*Figure 1*');
});

test('renders a quote as a blockquote, with an attribution line when given', () => {
  const withoutAttribution: Block = { id: 'b1', type: 'quote', content: 'stay hungry' };
  assert.equal(renderBlockToMarkdown(withoutAttribution), '> stay hungry');

  const withAttribution: Block = {
    id: 'b2',
    type: 'quote',
    content: 'stay hungry',
    attribution: 'unknown',
  };
  assert.equal(renderBlockToMarkdown(withAttribution), '> stay hungry\n\n*— unknown*');
});

test('renders a multi-line quote with each line prefixed', () => {
  const block: Block = { id: 'b1', type: 'quote', content: 'line one\nline two' };
  assert.equal(renderBlockToMarkdown(block), '> line one\n> line two');
});

test('renders a chart block as a markdown data table', () => {
  const block: Block = {
    id: 'b1',
    type: 'chart',
    chartType: 'bar',
    title: 'Revenue',
    data: [
      { label: 'Q1', value: 10 },
      { label: 'Q2', value: 20 },
    ],
  };
  const rendered = renderBlockToMarkdown(block);
  assert.match(rendered, /\*\*Revenue\*\*/);
  assert.match(rendered, /\| Q1 \| 10 \|/);
  assert.match(rendered, /\| Q2 \| 20 \|/);
  assert.match(rendered, /chart type: bar/);
});
