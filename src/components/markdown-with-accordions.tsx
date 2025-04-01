import { ItemWithMarkdown } from './item-with-markdown';
import { SimpleAccordion } from './simple-accordion';

interface MarkdownWithAccordionsProps {
  content: string;
}

interface ContentGroup {
  type: 'accordion' | 'content';
  items: any[];
}

export function MarkdownWithAccordions({ content }: MarkdownWithAccordionsProps) {
  if (!content) return null;

  // Split content into sections, keeping the ::: markers for proper splitting
  const sections = content.split(/(:::accordion[\s\S]*?:::)/).filter(Boolean);

  // Function to check if a section is an accordion
  const isAccordion = (section: string) => section.trim().startsWith(':::accordion');

  // Group sections into accordion groups and regular content
  let currentGroup: ContentGroup = { type: 'content', items: [] };
  const groups: ContentGroup[] = [];

  sections.forEach((section) => {
    const isAccordionSection = isAccordion(section);
    const currentGroupIsEmpty = currentGroup.items.length === 0;

    // Determine the type of the current section
    const sectionType = isAccordionSection ? 'accordion' : 'content';

    // Start a new group if the type changes or if the first section doesn't match the initial group type
    if ((!currentGroupIsEmpty && sectionType !== currentGroup.type) || (currentGroupIsEmpty && sectionType !== currentGroup.type)) {
      if (!currentGroupIsEmpty) {
        groups.push(currentGroup);
      }
      currentGroup = { type: sectionType, items: [] };
    }

    // Add section to current group
    if (isAccordionSection) {
      const match = section.trim().match(/:::accordion\s*(.*?)\n([\s\S]*?):::/);
      if (match) {
        const [, title, accordionContent] = match;
        currentGroup.items.push({ title: title.trim(), content: accordionContent.trim() });
      }
    } else {
      // Add non-empty content sections
      const trimmedContent = section.trim();
      if (trimmedContent) {
          currentGroup.items.push(trimmedContent);
      }
    }
  });

  // Add the last group if it has items
  if (currentGroup.items.length > 0) {
    groups.push(currentGroup);
  }

  return (
    <div>
      {groups.map((group, groupIndex) => {
        // Determine if the previous group was an accordion group
        const previousGroupWasAccordion = groupIndex > 0 && groups[groupIndex - 1].type === 'accordion';

        if (group.type === 'accordion') {
          // Render accordion group (no specific margin here)
          return (
            <div key={groupIndex}>
              {group.items.map((item, itemIndex) => (
                <SimpleAccordion 
                  key={itemIndex}
                  title={item.title}
                >
                  <ItemWithMarkdown content={item.content} />
                </SimpleAccordion>
              ))}
            </div>
          );
        } else {
          // Render content group
          // Add margin-top if the previous group was an accordion group
          return group.items.map((content, contentIndex) => (
            <div 
              key={`${groupIndex}-${contentIndex}`} 
              className={`${(previousGroupWasAccordion && contentIndex === 0) ? 'mt-16' : ''} mb-4`}
            >
              <ItemWithMarkdown content={content} />
            </div>
          ));
        }
      })}
    </div>
  );
} 