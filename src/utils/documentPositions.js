/**
 * Reliable Navigation & Anchor Resolution using stable blockId
 */

export function navigateToBlock(blockId) {
  if (!blockId) return { success: false, reason: 'No blockId provided' };

  // Try direct DOM selector with data-block-id
  let el = document.querySelector(`[data-block-id="${blockId}"]`);

  // Fallback to id="block-..."
  if (!el) {
    el = document.getElementById(`block-${blockId}`);
  }

  if (!el) {
    return {
      success: false,
      reason: 'Target not found. This task needs attention.',
    };
  }

  // Scroll element into view centered within its scrollable container
  try {
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });
  } catch (err) {
    // Fallback if options unsupported
    el.scrollIntoView(true);
  }

  // Flash highlight animation on the target element
  el.classList.remove('target-flash');
  // Trigger reflow to restart animation
  void el.offsetWidth;
  el.classList.add('target-flash');
  setTimeout(() => {
    el.classList.remove('target-flash');
  }, 2000);

  return { success: true, element: el };
}

export function findBlockByIdInDoc(doc, blockId) {
  if (!doc || !blockId) return null;

  let found = null;
  doc.descendants((node, pos) => {
    if (node.attrs && node.attrs.blockId === blockId) {
      found = { node, pos };
      return false; // stop traversal
    }
    return true;
  });

  return found;
}

export function findAnchorTextInBlock(node, anchorText) {
  if (!node || !anchorText) return null;
  const textContent = node.textContent;
  const index = textContent.indexOf(anchorText);

  if (index === -1) return null;
  return {
    start: index,
    end: index + anchorText.length,
  };
}

export function resolveTaskTarget(doc, target) {
  if (!doc || !target) {
    return { status: 'needs_attention', reason: 'Missing document or target' };
  }

  // Find block by blockId
  const block = findBlockByIdInDoc(doc, target.blockId);
  if (!block) {
    return {
      status: 'needs_attention',
      reason: 'Target block could not be found in the document.',
    };
  }

  const blockText = block.node.textContent || '';
  const anchorText = target.anchorText || '';

  // 1. Exact match for anchorText within the block text
  if (anchorText) {
    const anchorMatch = findAnchorTextInBlock(block.node, anchorText);
    if (anchorMatch) {
      const from = block.pos + 1 + anchorMatch.start;
      const to = block.pos + 1 + anchorMatch.end;
      return {
        status: 'valid',
        from,
        to,
        blockPos: block.pos,
        blockNode: block.node,
      };
    }
  }

  // 2. If anchorText doesn't match exactly (e.g. user edited it):
  // Resolve bounds dynamically relative to block content without fixed cutoff
  const startOffset = typeof target.startOffset === 'number' ? target.startOffset : 0;
  const endOffset = typeof target.endOffset === 'number' ? target.endOffset : blockText.length;

  let fromPos = Math.min(startOffset, blockText.length);
  let toPos = Math.min(endOffset, blockText.length);

  // If anchorText is shorter than blockText, target was a sub-segment (e.g. Sentence 1 of a paragraph)
  if (anchorText && anchorText.length < blockText.length) {
    const words = anchorText.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      // Check for trailing words of anchorText
      const trailingPhrase = words.slice(-3).join(' ');
      const trailingIdx = blockText.indexOf(trailingPhrase, fromPos);
      if (trailingIdx !== -1) {
        toPos = trailingIdx + trailingPhrase.length;
      } else {
        // Check for leading words of anchorText
        const leadingPhrase = words.slice(0, 3).join(' ');
        const leadingIdx = blockText.indexOf(leadingPhrase);
        if (leadingIdx !== -1) {
          fromPos = leadingIdx;
          // Extend toPos to next sentence boundary/period if present
          const nextPeriod = blockText.indexOf('. ', fromPos + 10);
          if (nextPeriod !== -1) {
            toPos = nextPeriod + 1;
          } else {
            toPos = blockText.length;
          }
        }
      }
    }
  }

  if (toPos > fromPos) {
    return {
      status: 'valid',
      from: block.pos + 1 + fromPos,
      to: block.pos + 1 + toPos,
      blockPos: block.pos,
      blockNode: block.node,
    };
  }

  // 3. Whole block fallback (only if target was whole block or unsegmented)
  const from = block.pos + 1;
  const to = Math.max(from, block.pos + block.node.nodeSize - 1);
  return {
    status: 'valid',
    from,
    to,
    blockPos: block.pos,
    blockNode: block.node,
  };
}



