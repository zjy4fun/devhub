import React, {useEffect, useState} from 'react';
import {Box, Text} from 'ink';
import {TextInput} from '@inkjs/ui';
import {THEME} from '../theme.js';

/**
 * Inline text input used for guided edit forms.
 */
export function EditableField({
  label,
  defaultValue,
  placeholder,
  onSubmit,
}: {
  readonly label: string;
  readonly defaultValue?: string;
  readonly placeholder?: string;
  readonly onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState(defaultValue ?? '');

  useEffect(() => {
    setValue(defaultValue ?? '');
  }, [defaultValue]);

  return (
    <Box flexDirection="column">
      <Text color={THEME.accent}>{label}</Text>
      <TextInput
        defaultValue={value}
        placeholder={placeholder}
        onChange={setValue}
        onSubmit={(nextValue) => onSubmit(nextValue)}
      />
    </Box>
  );
}
