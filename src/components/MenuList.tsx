import React, {useMemo, useState} from 'react';
import {useEffect} from 'react';
import {Box, Text, useInput} from 'ink';
import {TextInput} from '@inkjs/ui';

/**
 * Menu item model shared across pages.
 */
export interface MenuItem {
  readonly label: string;
  readonly value: string;
  readonly description?: string;
}

/**
 * Searchable vertical menu with vim-style shortcuts.
 */
export function MenuList({
  items,
  onSelect,
}: {
  readonly items: readonly MenuItem[];
  readonly onSelect: (value: string) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!query) {
      return items;
    }

    const lowerQuery = query.toLowerCase();
    return items.filter((item) =>
      `${item.label} ${item.description ?? ''}`.toLowerCase().includes(lowerQuery),
    );
  }, [items, query]);

  useEffect(() => {
    if (selectedIndex >= filteredItems.length) {
      setSelectedIndex(filteredItems.length > 0 ? filteredItems.length - 1 : 0);
    }
  }, [filteredItems.length, selectedIndex]);

  useInput((input, key) => {
    if (isSearching) {
      if (key.escape) {
        setIsSearching(false);
        setQuery('');
        setSelectedIndex(0);
      }

      return;
    }

    if (input === '/') {
      setIsSearching(true);
      setSelectedIndex(0);
      return;
    }

    if ((key.downArrow || input === 'j') && filteredItems.length > 0) {
      setSelectedIndex((current) => (current + 1) % filteredItems.length);
      return;
    }

    if ((key.upArrow || input === 'k') && filteredItems.length > 0) {
      setSelectedIndex((current) => (current - 1 + filteredItems.length) % filteredItems.length);
      return;
    }

    if (key.return && filteredItems[selectedIndex]) {
      onSelect(filteredItems[selectedIndex].value);
    }
  });

  return (
    <Box flexDirection="column">
      {isSearching ? (
        <Box marginBottom={1}>
          <Text color="#58a6ff">搜索: </Text>
          <TextInput defaultValue={query} onChange={setQuery} onSubmit={() => setIsSearching(false)} />
        </Box>
      ) : null}
      {filteredItems.map((item, index) => {
        const selected = index === selectedIndex;
        return (
          <Box key={`${item.value}-${index}`}>
            <Text color={selected ? '#bc8cff' : '#f0f6fc'}>{selected ? '❯ ' : '  '}</Text>
            <Text color={selected ? '#bc8cff' : '#f0f6fc'}>{item.label}</Text>
            {item.description ? <Text color="#6e7681">{`  ${item.description}`}</Text> : null}
          </Box>
        );
      })}
      {filteredItems.length === 0 ? <Text color="#6e7681">无匹配项</Text> : null}
      <Box marginTop={1}>
        <Text color="#6e7681">↑↓ / j k 导航  Enter 进入  / 搜索</Text>
      </Box>
    </Box>
  );
}
