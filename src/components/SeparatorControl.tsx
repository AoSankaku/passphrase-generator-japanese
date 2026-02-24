import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import TextField from '@mui/material/TextField';

const PRESETS = ['.', ',', '&', '+', '-', '_'];

type SeparatorControlProps = {
  value: string;
  onChange: (value: string) => void;
};

const SeparatorControl: React.FC<SeparatorControlProps> = ({ value, onChange }) => {
  const presetValue = PRESETS.includes(value) ? value : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2">区切り文字</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={presetValue}
          exclusive
          onChange={(_, val) => val !== null && onChange(val)}
          size="small"
        >
          {PRESETS.map((p) => (
            <ToggleButton key={p} value={p} sx={{ fontFamily: 'monospace', minWidth: '36px' }}>
              {p}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <TextField
          value={value}
          onChange={(e) => onChange(e.target.value)}
          size="small"
          label="カスタム"
          inputProps={{ maxLength: 4 }}
          sx={{ width: '80px' }}
        />
      </Box>
    </Box>
  );
};

export default SeparatorControl;
