'use client';

import { useEffect } from 'react';

// Block types mapping based on keystatic.config.tsx
const BLOCK_TYPES = [
  { id: 'image', label: 'HQ Image', icon: '🖼️' },
  { id: 'video', label: 'Video Clip (MP4)', icon: '📹' },
  { id: 'youtube', label: 'Embed (YT/Vimeo)', icon: '📺' },
  { id: 'sketchfab', label: 'Sketchfab', icon: '🧊' },
  { id: 'marmoset', label: 'Marmoset Viewer', icon: '🐵' },
  { id: 'pano', label: '360 Pano', icon: '🔄' },
  { id: 'compare', label: 'Comparison', icon: '↔️' },
];

export function AdminToolbar() {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      // 1. Find the "Media Gallery" label/heading
      // Keystatic uses standard tags. We look for text content.
      const elements = Array.from(document.querySelectorAll('label, h3, span, div'));
      const labelEl = elements.find(
        (el) => el.textContent === 'Media Gallery' && 
        (el.tagName === 'LABEL' || el.tagName === 'H3' || el.getAttribute('role') === 'group-label')
      );

      if (!labelEl) return;

      // 2. Check if we already injected the toolbar
      const container = labelEl.closest('div[role="group"]') || labelEl.parentElement;
      if (!container) return;
      
      if (container.querySelector('#custom-media-toolbar')) return;

      // 3. Create the Toolbar
      const toolbar = document.createElement('div');
      toolbar.id = 'custom-media-toolbar';
      toolbar.className = 'custom-toolbar-grid';
      
      // Inject CSS for the toolbar if not already present
      if (!document.getElementById('custom-toolbar-styles')) {
        const style = document.createElement('style');
        style.id = 'custom-toolbar-styles';
        style.textContent = `
          .custom-toolbar-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 8px;
            margin-top: 12px;
            margin-bottom: 24px;
            padding: 12px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
          }
          .custom-toolbar-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px;
            background: var(--bg-tertiary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 13px;
            font-weight: 500;
            text-align: center;
          }
          .custom-toolbar-btn:hover {
            background: var(--bg-hover);
            border-color: var(--accent-primary);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          }
          .custom-toolbar-icon {
            font-size: 20px;
            margin-bottom: 4px;
          }
          /* Hide the original Add button if we can identify it securely */
          /* Note: We don't hide it because it might be needed as fallback, 
             and it's hard to target purely by CSS without classes. 
             But we can try to hide the one immediately following the list if we knew the structure.
             For now, we leave it. */
        `;
        document.head.appendChild(style);
      }

      // 4. Add Buttons
      for (const block of BLOCK_TYPES) {
        const btn = document.createElement('div');
        btn.className = 'custom-toolbar-btn';
        btn.innerHTML = `<span class="custom-toolbar-icon">${block.icon}</span><span>${block.label}</span>`;
        
        btn.onclick = async () => {
          // A. Find the "Add" button associated with this field
          // It's usually a button with "Add" text or an SVG plus, inside the same container or subsequent sibling
          // Strategy: Look for all buttons in the container or next sibling container
          const allButtons = Array.from(container.querySelectorAll('button'));
          // The "Add" button usually has "Add" text or is an icon button at the end
          // Let's look for a button that opens a menu.
          
          // Heuristic: The button that is NOT the toolbar button we just made.
          // And usually it is after the list.
          // Let's try to find a button with "Add" text.
          let addButton = allButtons.find(b => b.textContent?.includes('Add'));
          
          // If not found by text (maybe icon only), look for the last button in the group
          if (!addButton) {
             // Fallback: try to find button with aria-haspopup="menu" or "true"
             addButton = allButtons.find(b => b.getAttribute('aria-haspopup') === 'true' || b.getAttribute('aria-haspopup') === 'menu');
          }

          if (addButton) {
            addButton.click();
            
            // B. Wait for Menu
            // Menu is usually attached to body
            setTimeout(() => {
                const menu = document.querySelector('[role="menu"]');
                if (menu) {
                    // C. Find the item
                    const items = Array.from(menu.querySelectorAll('[role="menuitem"]'));
                    // Match loosely by text
                    const targetItem = items.find(item => item.textContent?.toLowerCase().includes(block.label.toLowerCase()) || item.textContent?.toLowerCase().includes(block.id));
                    
                    if (targetItem) {
                        (targetItem as HTMLElement).click();
                    } else {
                        console.error('Keystatic Toolbar: Menu item not found for', block.label);
                    }
                }
            }, 100); // Short delay for React to render Portal
          } else {
              console.error('Keystatic Toolbar: Add button not found');
          }
        };
        
        toolbar.appendChild(btn);
      }

      // 5. Insert Toolbar after the label
      labelEl.insertAdjacentElement('afterend', toolbar);

    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
