import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: false,
});

const sanitize = (html: string): string => {
  return sanitizeHtml(html, {
    allowedTags: ['b', 'i', 'u', 's', 'a', 'code', 'pre', 'tg-spoiler'],
    allowedAttributes: {
      a: ['href'],
    },
    allowedSchemes: ['http', 'https', 'tg', 'mailto'],
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
  });
};

export const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

markdown.renderer.rules.strong_open = () => '<b>';
markdown.renderer.rules.strong_close = () => '</b>';
markdown.renderer.rules.em_open = () => '<i>';
markdown.renderer.rules.em_close = () => '</i>';

markdown.renderer.rules.heading_open = () => '<b>';
markdown.renderer.rules.heading_close = () => '</b>\n';

markdown.renderer.rules.paragraph_open = () => '';
markdown.renderer.rules.paragraph_close = () => '\n';

markdown.renderer.rules.bullet_list_open = () => '';
markdown.renderer.rules.bullet_list_close = () => '\n';
markdown.renderer.rules.ordered_list_open = () => '';
markdown.renderer.rules.ordered_list_close = () => '\n';
markdown.renderer.rules.list_item_open = () => '• ';
markdown.renderer.rules.list_item_close = () => '\n';

markdown.renderer.rules.code_inline = (tokens, idx) => {
  return `<code>${escapeHtml(tokens[idx].content)}</code>`;
};

markdown.renderer.rules.fence = (tokens, idx) => {
  const content = escapeHtml(tokens[idx].content);
  return `<pre><code>${content}</code></pre>\n`;
};

markdown.renderer.rules.code_block = (tokens, idx) => {
  const content = escapeHtml(tokens[idx].content);
  return `<pre><code>${content}</code></pre>\n`;
};

markdown.renderer.rules.link_open = (tokens, idx) => {
  const href = tokens[idx].attrGet('href') || '';
  const safeHref = escapeHtml(href);
  return `<a href="${safeHref}">`;
};

markdown.renderer.rules.link_close = () => '</a>';

markdown.renderer.rules.softbreak = () => '\n';
markdown.renderer.rules.hardbreak = () => '\n';

export const convertMarkdownToTelegramHtml = (
  input: string,
  logger?: { warn?: (message: string, error?: unknown) => void },
): string => {
  try {
    const rendered = markdown.render(input || '');
    const sanitized = sanitize(rendered);
    return sanitized.trim();
  } catch (error) {
    logger?.warn?.('Markdown-to-HTML conversion failed, using safe fallback.', error);
    return escapeHtml(input || '');
  }
};
